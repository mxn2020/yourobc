// convex/lib/yourobc/employees/vacations/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'

/**
 * Get vacation balance for an employee
 */
export const getVacationBalance = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    return balance
  },
})

/**
 * Get all vacation balances for an employee (multi-year)
 */
export const getAllVacationBalances = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const balances = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    // Sort by year (newest first)
    return balances.sort((a, b) => b.year - a.year)
  },
})

/**
 * Get pending vacation requests for approval
 */
export const getPendingRequests = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, args) => {
    let balances

    if (args.employeeId) {
      // Get for specific employee
      const employeeId = args.employeeId; // Type narrowing
      balances = await ctx.db
        .query('yourobcVacationDays')
        .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
        .collect()
    } else {
      // Get all
      balances = await ctx.db.query('yourobcVacationDays').collect()
    }

    // Extract pending entries
    const pendingRequests: any[] = []

    for (const balance of balances) {
      const employee = await ctx.db.get(balance.employeeId)
      const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

      for (const entry of balance.entries) {
        if (entry.status === 'pending') {
          pendingRequests.push({
            ...entry,
            employeeId: balance.employeeId,
            employee,
            userProfile,
            year: balance.year,
          })
        }
      }
    }

    // Sort by request date (newest first)
    return pendingRequests.sort((a, b) => b.requestedDate - a.requestedDate)
  },
})

/**
 * Get vacation calendar (team view)
 */
export const getVacationCalendar = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    employeeIds: v.optional(v.array(v.id('yourobcEmployees'))),
  },
  handler: async (ctx, args) => {
    // Get all vacation balances
    let balances = await ctx.db.query('yourobcVacationDays').collect()

    // Filter by employee IDs if specified
    if (args.employeeIds && args.employeeIds.length > 0) {
      const employeeIdSet = new Set(args.employeeIds)
      balances = balances.filter(b => employeeIdSet.has(b.employeeId))
    }

    // Extract entries that fall within the date range
    const calendarEntries: any[] = []

    for (const balance of balances) {
      const employee = await ctx.db.get(balance.employeeId)
      const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

      for (const entry of balance.entries) {
        // Only include approved entries
        if (entry.status !== 'approved') continue

        // Check if entry overlaps with requested date range
        if (entry.endDate >= args.startDate && entry.startDate <= args.endDate) {
          calendarEntries.push({
            ...entry,
            employeeId: balance.employeeId,
            employee,
            userProfile,
            year: balance.year,
          })
        }
      }
    }

    // Sort by start date
    return calendarEntries.sort((a, b) => a.startDate - b.startDate)
  },
})

/**
 * Get vacation history for an employee
 */
export const getVacationHistory = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('cancelled')
    )),
  },
  handler: async (ctx, args) => {
    let balances

    if (args.year !== undefined) {
      // Get specific year
      const year = args.year; // Type narrowing
      const balance = await ctx.db
        .query('yourobcVacationDays')
        .withIndex('by_employee_year', (q) =>
          q.eq('employeeId', args.employeeId).eq('year', year)
        )
        .first()
      balances = balance ? [balance] : []
    } else {
      // Get all years
      balances = await ctx.db
        .query('yourobcVacationDays')
        .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
        .collect()
    }

    // Extract entries
    const history: any[] = []

    for (const balance of balances) {
      for (const entry of balance.entries) {
        // Filter by status if specified
        if (args.status && entry.status !== args.status) continue

        history.push({
          ...entry,
          year: balance.year,
        })
      }
    }

    // Sort by start date (newest first)
    return history.sort((a, b) => b.startDate - a.startDate)
  },
})

/**
 * Get upcoming vacations for an employee
 */
export const getUpcomingVacations = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current and next year balances
    const currentYear = new Date().getFullYear()
    const balances = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.gte(q.field('year'), currentYear))
      .collect()

    // Extract upcoming approved entries
    const upcoming: any[] = []

    for (const balance of balances) {
      for (const entry of balance.entries) {
        // Only approved entries that haven't ended yet
        if (entry.status === 'approved' && entry.endDate >= now) {
          upcoming.push({
            ...entry,
            year: balance.year,
          })
        }
      }
    }

    // Sort by start date (soonest first)
    return upcoming.sort((a, b) => a.startDate - b.startDate)
  },
})

/**
 * Get vacation statistics for employee
 */
export const getVacationStatistics = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const balance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', args.year)
      )
      .first()

    if (!balance) {
      return null
    }

    // Calculate statistics
    const totalRequests = balance.entries.length
    const pendingRequests = balance.entries.filter(e => e.status === 'pending').length
    const approvedRequests = balance.entries.filter(e => e.status === 'approved').length
    const rejectedRequests = balance.entries.filter(e => e.status === 'rejected').length
    const cancelledRequests = balance.entries.filter(e => e.status === 'cancelled').length

    // Calculate days by type
    const daysByType: Record<string, number> = {}
    for (const entry of balance.entries) {
      if (entry.status === 'approved') {
        daysByType[entry.type] = (daysByType[entry.type] || 0) + entry.days
      }
    }

    // Calculate usage percentage
    const usagePercentage = balance.available > 0
      ? (balance.used / balance.available) * 100
      : 0

    return {
      year: args.year,
      annualEntitlement: balance.annualEntitlement,
      carryoverDays: balance.carryoverDays,
      available: balance.available,
      used: balance.used,
      pending: balance.pending,
      remaining: balance.remaining,
      usagePercentage,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
      daysByType,
    }
  },
})

/**
 * Check vacation conflicts for dates
 */
export const checkVacationConflicts = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    startDate: v.number(),
    endDate: v.number(),
    excludeEntryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const year = new Date(args.startDate).getFullYear()

    const balance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', year)
      )
      .first()

    if (!balance) {
      return { hasConflict: false, conflicts: [] }
    }

    const conflicts: any[] = []

    for (const entry of balance.entries) {
      // Skip if this is the entry being edited
      if (args.excludeEntryId && entry.entryId === args.excludeEntryId) continue

      // Skip cancelled/rejected entries
      if (entry.status === 'cancelled' || entry.status === 'rejected') continue

      // Check for overlap
      if (entry.startDate <= args.endDate && entry.endDate >= args.startDate) {
        conflicts.push(entry)
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    }
  },
})

/**
 * Get team vacation summary (admin view)
 */
export const getTeamVacationSummary = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const balances = await ctx.db
      .query('yourobcVacationDays')
      .filter((q) => q.eq(q.field('year'), args.year))
      .collect()

    if (balances.length === 0) {
      return null
    }

    // Calculate aggregates
    let totalEntitlement = 0
    let totalUsed = 0
    let totalPending = 0
    let totalRemaining = 0
    let totalCarryover = 0

    const employeeStats: any[] = []

    for (const balance of balances) {
      totalEntitlement += balance.available
      totalUsed += balance.used
      totalPending += balance.pending
      totalRemaining += balance.remaining
      totalCarryover += balance.carryoverDays

      const employee = await ctx.db.get(balance.employeeId)
      const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

      employeeStats.push({
        employeeId: balance.employeeId,
        employee,
        userProfile,
        available: balance.available,
        used: balance.used,
        pending: balance.pending,
        remaining: balance.remaining,
        usagePercentage: balance.available > 0 ? (balance.used / balance.available) * 100 : 0,
      })
    }

    return {
      year: args.year,
      totalEmployees: balances.length,
      totalEntitlement,
      totalUsed,
      totalPending,
      totalRemaining,
      totalCarryover,
      averageUsage: totalEntitlement > 0 ? (totalUsed / totalEntitlement) * 100 : 0,
      employeeStats: employeeStats.sort((a, b) => b.usagePercentage - a.usagePercentage),
    }
  },
})

/**
 * Get vacation days remaining for quick display
 */
export const getQuickVacationSummary = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, args) => {
    const currentYear = new Date().getFullYear()

    const balance = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) =>
        q.eq('employeeId', args.employeeId).eq('year', currentYear)
      )
      .first()

    if (!balance) {
      return {
        year: currentYear,
        remaining: 0,
        used: 0,
        pending: 0,
        available: 0,
      }
    }

    return {
      year: currentYear,
      remaining: balance.remaining,
      used: balance.used,
      pending: balance.pending,
      available: balance.available,
    }
  },
})

/**
 * Get all employees on vacation today (admin view)
 */
export const getEmployeesOnVacationToday = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)
    const endOfDayTimestamp = endOfDay.getTime()

    const currentYear = today.getFullYear()

    // Get all balances for current year
    const balances = await ctx.db
      .query('yourobcVacationDays')
      .filter((q) => q.eq(q.field('year'), currentYear))
      .collect()

    const onVacationToday: any[] = []

    for (const balance of balances) {
      for (const entry of balance.entries) {
        // Check if approved and today falls within the vacation period
        if (
          entry.status === 'approved' &&
          entry.startDate <= endOfDayTimestamp &&
          entry.endDate >= todayTimestamp
        ) {
          const employee = await ctx.db.get(balance.employeeId)
          const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null

          onVacationToday.push({
            ...entry,
            employeeId: balance.employeeId,
            employee,
            userProfile,
          })
        }
      }
    }

    return onVacationToday
  },
})
