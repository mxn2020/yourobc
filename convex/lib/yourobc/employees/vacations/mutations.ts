// convex/lib/yourobc/employees/vacations/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import type { Id } from '../../../../_generated/dataModel'

/**
 * Request vacation days
 */
export const requestVacation = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.number(),
    endDate: v.number(),
    type: v.union(
      v.literal('annual'),
      v.literal('sick'),
      v.literal('personal'),
      v.literal('unpaid'),
      v.literal('parental'),
      v.literal('bereavement'),
      v.literal('other')
    ),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Calculate number of days
    const days = calculateBusinessDays(args.startDate, args.endDate)

    if (days <= 0) {
      throw new Error('Invalid date range')
    }

    // Get or create vacation balance for this year
    const year = new Date(args.startDate).getFullYear()
    let vacationBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', year)
      )
      .first()

    if (!vacationBalance) {
      // Create new balance record
      const employee = await ctx.db.get(args.employeeId)
      if (!employee) {
        throw new Error('Employee not found')
      }

      const annualEntitlement = calculateAnnualEntitlement(employee.hireDate ?? now, year)

      const vacationBalanceId = await ctx.db.insert('yourobcVacationDays', {
        employeeId: args.employeeId,
        year,
        annualEntitlement,
        carryoverDays: 0,
        available: annualEntitlement,
        used: 0,
        pending: 0,
        remaining: annualEntitlement,
        entries: [],
        createdAt: now,
        createdBy: identity.subject,
        updatedAt: now,
      })

      // Fetch the newly created record
      vacationBalance = await ctx.db.get(vacationBalanceId)
      if (!vacationBalance) {
        throw new Error('Failed to create vacation balance')
      }
    }

    // Check if enough days available (for annual leave)
    if (args.type === 'annual') {
      if (vacationBalance.remaining < days) {
        throw new Error(`Insufficient vacation days. Remaining: ${vacationBalance.remaining}, Requested: ${days}`)
      }
    }

    // Check if vacationBalance exists after creation
    if (!vacationBalance) {
      throw new Error('Failed to create vacation balance')
    }

    // Create entry
    const entryId = generateEntryId()
    const newEntry = {
      entryId,
      startDate: args.startDate,
      endDate: args.endDate,
      days,
      type: args.type,
      status: 'pending' as const,
      reason: args.reason,
      notes: args.notes,
      requestedBy: identity.subject,
      requestedDate: now,
    }

    // Update vacation balance
    await ctx.db.patch(vacationBalance._id, {
      pending: vacationBalance.pending + days,
      remaining: vacationBalance.available - vacationBalance.used - (vacationBalance.pending + days),
      entries: [...vacationBalance.entries, newEntry],
      updatedAt: now,
    })

    return { success: true, entryId }
  },
})

/**
 * Approve vacation request
 */
export const approveVacation = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    entryId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const vacationBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    if (!vacationBalance) {
      throw new Error('Vacation balance not found')
    }

    // Find the entry
    const entryIndex = vacationBalance.entries.findIndex(e => e.entryId === args.entryId)
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found')
    }

    const entry = vacationBalance.entries[entryIndex]
    if (entry.status !== 'pending') {
      throw new Error('Entry is not pending approval')
    }

    // Update entry
    const updatedEntry = {
      ...entry,
      status: 'approved' as const,
      approvedBy: identity.subject,
      approvedDate: now,
      approvalNotes: args.notes,
    }

    const updatedEntries = [...vacationBalance.entries]
    updatedEntries[entryIndex] = updatedEntry

    // Update balances
    await ctx.db.patch(vacationBalance._id, {
      used: vacationBalance.used + entry.days,
      pending: vacationBalance.pending - entry.days,
      remaining: vacationBalance.available - (vacationBalance.used + entry.days) - (vacationBalance.pending - entry.days),
      entries: updatedEntries,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Reject vacation request
 */
export const rejectVacation = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    entryId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const vacationBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    if (!vacationBalance) {
      throw new Error('Vacation balance not found')
    }

    // Find the entry
    const entryIndex = vacationBalance.entries.findIndex(e => e.entryId === args.entryId)
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found')
    }

    const entry = vacationBalance.entries[entryIndex]
    if (entry.status !== 'pending') {
      throw new Error('Entry is not pending approval')
    }

    // Update entry
    const updatedEntry = {
      ...entry,
      status: 'rejected' as const,
      rejectedBy: identity.subject,
      rejectedDate: now,
      rejectionReason: args.reason,
    }

    const updatedEntries = [...vacationBalance.entries]
    updatedEntries[entryIndex] = updatedEntry

    // Update balances (release pending days)
    await ctx.db.patch(vacationBalance._id, {
      pending: vacationBalance.pending - entry.days,
      remaining: vacationBalance.available - vacationBalance.used - (vacationBalance.pending - entry.days),
      entries: updatedEntries,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Cancel vacation request (by employee)
 */
export const cancelVacation = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
    entryId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const vacationBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    if (!vacationBalance) {
      throw new Error('Vacation balance not found')
    }

    // Find the entry
    const entryIndex = vacationBalance.entries.findIndex(e => e.entryId === args.entryId)
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found')
    }

    const entry = vacationBalance.entries[entryIndex]

    // Can only cancel pending or approved entries
    if (entry.status !== 'pending' && entry.status !== 'approved') {
      throw new Error('Cannot cancel this entry')
    }

    const wasPending = entry.status === 'pending'
    const wasApproved = entry.status === 'approved'

    // Update entry
    const updatedEntry = {
      ...entry,
      status: 'cancelled' as const,
      cancelledBy: identity.subject,
      cancelledDate: now,
      cancellationReason: args.reason,
    }

    const updatedEntries = [...vacationBalance.entries]
    updatedEntries[entryIndex] = updatedEntry

    // Update balances based on previous status
    type VacationBalanceUpdate = {
      entries: typeof updatedEntries
      updatedAt: number
      pending?: number
      remaining?: number
      used?: number
    }

    const updates: VacationBalanceUpdate = {
      entries: updatedEntries,
      updatedAt: now,
    }

    if (wasPending) {
      updates.pending = vacationBalance.pending - entry.days
      updates.remaining = vacationBalance.available - vacationBalance.used - (vacationBalance.pending - entry.days)
    } else if (wasApproved) {
      updates.used = vacationBalance.used - entry.days
      updates.remaining = vacationBalance.available - (vacationBalance.used - entry.days) - vacationBalance.pending
    }

    await ctx.db.patch(vacationBalance._id, updates)

    return { success: true }
  },
})

/**
 * Calculate annual vacation entitlement
 */
export const calculateAnnualDays = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    const entitlement = calculateAnnualEntitlement(employee.hireDate ?? Date.now(), args.year)

    return { entitlement }
  },
})

/**
 * Process year-end carryover
 */
export const carryoverDays = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    fromYear: v.number(),
    toYear: v.number(),
    maxCarryoverDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const maxCarryover = args.maxCarryoverDays || 5 // Default 5 days max carryover

    // Get previous year balance
    const previousBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.fromYear)
      )
      .first()

    if (!previousBalance) {
      throw new Error('Previous year balance not found')
    }

    // Calculate carryover amount (unused days, capped at max)
    const unusedDays = previousBalance.remaining
    const carryoverAmount = Math.min(unusedDays, maxCarryover)

    if (carryoverAmount <= 0) {
      return { carryoverDays: 0 }
    }

    // Get or create new year balance
    let newBalance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.toYear)
      )
      .first()

    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    const annualEntitlement = calculateAnnualEntitlement(employee.hireDate ?? now, args.toYear)

    if (newBalance) {
      // Update existing
      await ctx.db.patch(newBalance._id, {
        carryoverDays: carryoverAmount,
        available: annualEntitlement + carryoverAmount,
        remaining: annualEntitlement + carryoverAmount - newBalance.used - newBalance.pending,
        calculationDate: now,
        updatedAt: now,
      })
    } else {
      // Create new
      await ctx.db.insert('yourobcVacationDays', {
        employeeId: args.employeeId,
        year: args.toYear,
        annualEntitlement,
        carryoverDays: carryoverAmount,
        available: annualEntitlement + carryoverAmount,
        used: 0,
        pending: 0,
        remaining: annualEntitlement + carryoverAmount,
        entries: [],
        calculationDate: now,
        createdAt: now,
        createdBy: employee.createdBy || 'system',
        updatedAt: now,
      })
    }

    return { carryoverDays: carryoverAmount }
  },
})

/**
 * Initialize vacation balance for employee
 */
export const initializeVacationBalance = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if already exists
    const existing = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    if (existing) {
      return { vacationBalanceId: existing._id, created: false }
    }

    const employee = await ctx.db.get(args.employeeId)
    if (!employee) {
      throw new Error('Employee not found')
    }

    const annualEntitlement = calculateAnnualEntitlement(employee.hireDate ?? now, args.year)

    const vacationBalanceId = await ctx.db.insert('yourobcVacationDays', {
      employeeId: args.employeeId,
      year: args.year,
      annualEntitlement,
      carryoverDays: 0,
      available: annualEntitlement,
      used: 0,
      pending: 0,
      remaining: annualEntitlement,
      entries: [],
      calculationDate: now,
      createdAt: now,
      createdBy: employee.createdBy || 'system',
      updatedAt: now,
    })

    return { vacationBalanceId, created: true }
  },
})

/**
 * Helper functions
 */

function calculateBusinessDays(startDate: number, endDate: number): number {
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    // Count weekdays only (Monday-Friday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

function calculateAnnualEntitlement(hireDate: number, year: number): number {
  const STANDARD_ANNUAL_DAYS = 25 // Standard 25 days per year
  const hire = new Date(hireDate)
  const hireYear = hire.getFullYear()

  // If hired in current year, pro-rate based on months worked
  if (hireYear === year) {
    const hireMonth = hire.getMonth()
    const monthsInYear = 12 - hireMonth
    return Math.round((STANDARD_ANNUAL_DAYS / 12) * monthsInYear)
  }

  // Full year entitlement
  return STANDARD_ANNUAL_DAYS
}

function generateEntryId(): string {
  return `VAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
