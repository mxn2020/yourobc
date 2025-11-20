// convex/lib/software/yourobc/employees/mutations.ts
/**
 * Mutation Operations for Employees Entity
 *
 * Provides mutation functions for creating, updating, and deleting
 * employees and vacation data with validation and audit trails.
 *
 * @module convex/lib/software/yourobc/employees/mutations
 */

import { MutationCtx } from '../../../_generated/server'
import { Id } from '../../../_generated/dataModel'
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  CreateVacationDaysInput,
  CreateVacationEntryInput,
  UpdateVacationEntryInput,
  VacationEntry,
  BatchVacationEntriesInput,
} from './types'
import {
  generateEmployeePublicId,
  generateVacationDaysPublicId,
  generateVacationEntryId,
  calculateVacationStats,
  calculateDaysBetween,
  validateVacationRequest,
  getCurrentVacationEntry,
  calculateDaysRemaining,
  updateRecentVacations,
} from './utils'
import { EMPLOYEE_DEFAULTS, VACATION_DEFAULTS } from './constants'
import {
  getEmployeeById,
  getVacationDaysByEmployeeYear,
  getVacationDaysById,
} from './queries'

// ============================================================================
// Employee Mutations
// ============================================================================

/**
 * Create a new employee
 */
export async function createEmployee(
  ctx: MutationCtx,
  input: CreateEmployeeInput,
  ownerId: string
): Promise<Id<'yourobcEmployees'>> {
  const now = Date.now()
  const publicId = generateEmployeePublicId()

  const employeeId = await ctx.db.insert('yourobcEmployees', {
    publicId,
    ownerId,
    userProfileId: input.userProfileId,
    authUserId: input.authUserId,
    employeeNumber: input.employeeNumber,
    type: input.type || EMPLOYEE_DEFAULTS.TYPE,
    department: input.department,
    position: input.position,
    managerId: input.managerId,
    office: input.office,
    hireDate: input.hireDate,
    workPhone: input.workPhone,
    workEmail: input.workEmail,
    emergencyContact: input.emergencyContact,
    status: input.status,
    workStatus: input.workStatus,
    isActive: input.isActive,
    isOnline: input.isOnline || EMPLOYEE_DEFAULTS.IS_ONLINE,
    timeEntries: EMPLOYEE_DEFAULTS.TIME_ENTRIES,
    timezone: input.timezone,
    metadata: input.metadata || {},
    createdAt: now,
    createdBy: ownerId,
    updatedAt: now,
    updatedBy: ownerId,
  })

  return employeeId
}

/**
 * Update an employee
 */
export async function updateEmployee(
  ctx: MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  input: UpdateEmployeeInput,
  updatedBy: string
): Promise<void> {
  const employee = await getEmployeeById(ctx, employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  const now = Date.now()
  const updates: any = {
    updatedAt: now,
    updatedBy,
  }

  // Apply updates
  if (input.department !== undefined) updates.department = input.department
  if (input.position !== undefined) updates.position = input.position
  if (input.managerId !== undefined) updates.managerId = input.managerId
  if (input.office !== undefined) updates.office = input.office
  if (input.hireDate !== undefined) updates.hireDate = input.hireDate
  if (input.workPhone !== undefined) updates.workPhone = input.workPhone
  if (input.workEmail !== undefined) updates.workEmail = input.workEmail
  if (input.emergencyContact !== undefined)
    updates.emergencyContact = input.emergencyContact
  if (input.status !== undefined) updates.status = input.status
  if (input.workStatus !== undefined) updates.workStatus = input.workStatus
  if (input.isActive !== undefined) updates.isActive = input.isActive
  if (input.isOnline !== undefined) updates.isOnline = input.isOnline
  if (input.timezone !== undefined) updates.timezone = input.timezone
  if (input.metadata !== undefined)
    updates.metadata = { ...employee.metadata, ...input.metadata }

  await ctx.db.patch(employeeId, updates)
}

/**
 * Update employee activity
 */
export async function updateEmployeeActivity(
  ctx: MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  isOnline: boolean,
  workStatus?: string
): Promise<void> {
  const now = Date.now()
  const updates: any = {
    isOnline,
    lastActivity: now,
    updatedAt: now,
  }

  if (workStatus !== undefined) {
    updates.workStatus = workStatus
  }

  await ctx.db.patch(employeeId, updates)
}

/**
 * Update employee vacation status (denormalized)
 */
export async function updateEmployeeVacationStatus(
  ctx: MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  vacationEntry: VacationEntry | null
): Promise<void> {
  const now = Date.now()

  if (vacationEntry) {
    const daysRemaining = calculateDaysRemaining(vacationEntry.endDate)
    await ctx.db.patch(employeeId, {
      currentVacationStatus: {
        isOnVacation: true,
        vacationEntryId: vacationEntry.entryId,
        startDate: vacationEntry.startDate,
        endDate: vacationEntry.endDate,
        type: vacationEntry.type,
        reason: vacationEntry.reason,
        daysRemaining,
      },
      updatedAt: now,
    })
  } else {
    await ctx.db.patch(employeeId, {
      currentVacationStatus: undefined,
      updatedAt: now,
    })
  }
}

/**
 * Soft delete an employee
 */
export async function softDeleteEmployee(
  ctx: MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  deletedBy: string
): Promise<void> {
  const employee = await getEmployeeById(ctx, employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  const now = Date.now()
  await ctx.db.patch(employeeId, {
    deletedAt: now,
    deletedBy,
    updatedAt: now,
    updatedBy: deletedBy,
  })
}

/**
 * Restore a soft-deleted employee
 */
export async function restoreEmployee(
  ctx: MutationCtx,
  employeeId: Id<'yourobcEmployees'>,
  restoredBy: string
): Promise<void> {
  const employee = await ctx.db.get(employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  const now = Date.now()
  await ctx.db.patch(employeeId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: restoredBy,
  })
}

// ============================================================================
// Vacation Days Mutations
// ============================================================================

/**
 * Create vacation days record
 */
export async function createVacationDays(
  ctx: MutationCtx,
  input: CreateVacationDaysInput,
  ownerId: string,
  createdBy: string
): Promise<Id<'yourobcVacationDays'>> {
  // Check if record already exists for this employee and year
  const existing = await getVacationDaysByEmployeeYear(
    ctx,
    input.employeeId,
    input.year
  )
  if (existing) {
    throw new Error(
      `Vacation days record already exists for employee ${input.employeeId} and year ${input.year}`
    )
  }

  const now = Date.now()
  const publicId = generateVacationDaysPublicId()

  const carryoverDays = input.carryoverDays || VACATION_DEFAULTS.CARRYOVER_DAYS
  const available = input.annualEntitlement + carryoverDays

  const vacationDaysId = await ctx.db.insert('yourobcVacationDays', {
    publicId,
    ownerId,
    employeeId: input.employeeId,
    year: input.year,
    annualEntitlement: input.annualEntitlement,
    carryoverDays,
    carryoverApprovedBy: input.carryoverApprovedBy,
    carryoverApprovedAt: input.carryoverApprovedAt,
    available,
    used: VACATION_DEFAULTS.USED,
    pending: VACATION_DEFAULTS.PENDING,
    remaining: available,
    entries: [],
    calculationDate: now,
    createdAt: now,
    createdBy,
    updatedAt: now,
    updatedBy: createdBy,
  })

  return vacationDaysId
}

/**
 * Update vacation entitlements
 */
export async function updateVacationEntitlements(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  annualEntitlement?: number,
  carryoverDays?: number,
  updatedBy?: string
): Promise<void> {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const now = Date.now()
  const newAnnual = annualEntitlement ?? vacationDays.annualEntitlement
  const newCarryover = carryoverDays ?? vacationDays.carryoverDays

  const stats = calculateVacationStats(newAnnual, newCarryover, vacationDays.entries)

  await ctx.db.patch(vacationDaysId, {
    annualEntitlement: newAnnual,
    carryoverDays: newCarryover,
    available: stats.available,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    calculationDate: now,
    updatedAt: now,
    updatedBy,
  })
}

/**
 * Request vacation
 */
export async function requestVacation(
  ctx: MutationCtx,
  input: CreateVacationEntryInput,
  requestedBy: string
): Promise<{ vacationDaysId: Id<'yourobcVacationDays'>; entryId: string }> {
  // Get or create vacation days record for the year
  let vacationDays = await getVacationDaysByEmployeeYear(
    ctx,
    input.employeeId,
    input.year
  )

  if (!vacationDays) {
    throw new Error(
      `No vacation days record found for year ${input.year}. Please create one first.`
    )
  }

  // Validate vacation request
  const validation = validateVacationRequest(
    input.startDate,
    input.endDate,
    input.days,
    vacationDays.available,
    vacationDays.pending,
    vacationDays.used
  )

  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Create vacation entry
  const now = Date.now()
  const entryId = generateVacationEntryId()

  const newEntry: VacationEntry = {
    entryId,
    startDate: input.startDate,
    endDate: input.endDate,
    days: input.days,
    type: input.type,
    status: 'pending',
    requestedDate: now,
    requestedBy,
    reason: input.reason,
    emergencyContact: input.emergencyContact,
    notes: input.notes,
    isHalfDay: input.isHalfDay,
  }

  // Update vacation days record
  const updatedEntries = [...vacationDays.entries, newEntry]
  const stats = calculateVacationStats(
    vacationDays.annualEntitlement,
    vacationDays.carryoverDays,
    updatedEntries
  )

  await ctx.db.patch(vacationDays._id, {
    entries: updatedEntries,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    updatedAt: now,
    updatedBy: requestedBy,
  })

  return { vacationDaysId: vacationDays._id, entryId }
}

/**
 * Approve vacation request
 */
export async function approveVacation(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  entryId: string,
  approvedBy: string,
  approvalNotes?: string
): Promise<void> {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const entryIndex = vacationDays.entries.findIndex((e) => e.entryId === entryId)
  if (entryIndex === -1) {
    throw new Error('Vacation entry not found')
  }

  const entry = vacationDays.entries[entryIndex]
  if (entry.status !== 'pending') {
    throw new Error(`Cannot approve vacation with status: ${entry.status}`)
  }

  const now = Date.now()
  const updatedEntry: VacationEntry = {
    ...entry,
    status: 'approved',
    approvedBy,
    approvedDate: now,
    approvalNotes,
  }

  const updatedEntries = [...vacationDays.entries]
  updatedEntries[entryIndex] = updatedEntry

  const stats = calculateVacationStats(
    vacationDays.annualEntitlement,
    vacationDays.carryoverDays,
    updatedEntries
  )

  await ctx.db.patch(vacationDaysId, {
    entries: updatedEntries,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    updatedAt: now,
    updatedBy: approvedBy,
  })

  // Update employee's current vacation status if applicable
  const currentEntry = getCurrentVacationEntry(updatedEntries, now)
  if (currentEntry && currentEntry.entryId === entryId) {
    await updateEmployeeVacationStatus(ctx, vacationDays.employeeId, currentEntry)
  }
}

/**
 * Reject vacation request
 */
export async function rejectVacation(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  entryId: string,
  rejectedBy: string,
  rejectionReason?: string
): Promise<void> {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const entryIndex = vacationDays.entries.findIndex((e) => e.entryId === entryId)
  if (entryIndex === -1) {
    throw new Error('Vacation entry not found')
  }

  const entry = vacationDays.entries[entryIndex]
  if (entry.status !== 'pending') {
    throw new Error(`Cannot reject vacation with status: ${entry.status}`)
  }

  const now = Date.now()
  const updatedEntry: VacationEntry = {
    ...entry,
    status: 'rejected',
    rejectedBy,
    rejectedDate: now,
    rejectionReason,
  }

  const updatedEntries = [...vacationDays.entries]
  updatedEntries[entryIndex] = updatedEntry

  const stats = calculateVacationStats(
    vacationDays.annualEntitlement,
    vacationDays.carryoverDays,
    updatedEntries
  )

  await ctx.db.patch(vacationDaysId, {
    entries: updatedEntries,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    updatedAt: now,
    updatedBy: rejectedBy,
  })
}

/**
 * Cancel vacation
 */
export async function cancelVacation(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  entryId: string,
  cancelledBy: string,
  cancellationReason?: string
): Promise<void> {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const entryIndex = vacationDays.entries.findIndex((e) => e.entryId === entryId)
  if (entryIndex === -1) {
    throw new Error('Vacation entry not found')
  }

  const entry = vacationDays.entries[entryIndex]
  if (entry.status !== 'approved' && entry.status !== 'pending') {
    throw new Error(`Cannot cancel vacation with status: ${entry.status}`)
  }

  const now = Date.now()
  const updatedEntry: VacationEntry = {
    ...entry,
    status: 'cancelled',
    cancelledBy,
    cancelledDate: now,
    cancellationReason,
  }

  const updatedEntries = [...vacationDays.entries]
  updatedEntries[entryIndex] = updatedEntry

  const stats = calculateVacationStats(
    vacationDays.annualEntitlement,
    vacationDays.carryoverDays,
    updatedEntries
  )

  await ctx.db.patch(vacationDaysId, {
    entries: updatedEntries,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    updatedAt: now,
    updatedBy: cancelledBy,
  })

  // Update employee's current vacation status if this was the active vacation
  const currentEntry = getCurrentVacationEntry(updatedEntries, now)
  await updateEmployeeVacationStatus(ctx, vacationDays.employeeId, currentEntry || null)

  // If vacation was completed, add to recent vacations
  if (entry.status === 'approved' && entry.endDate < now) {
    const employee = await getEmployeeById(ctx, vacationDays.employeeId)
    if (employee) {
      const recentVacations = updateRecentVacations(
        employee.recentVacations,
        entry,
        now
      )
      await ctx.db.patch(vacationDays.employeeId, {
        recentVacations,
        updatedAt: now,
      })
    }
  }
}

/**
 * Batch create vacation entries
 */
export async function batchCreateVacationEntries(
  ctx: MutationCtx,
  input: BatchVacationEntriesInput,
  requestedBy: string
): Promise<{ vacationDaysId: Id<'yourobcVacationDays'>; entryIds: string[] }> {
  const vacationDays = await getVacationDaysByEmployeeYear(
    ctx,
    input.employeeId as Id<'yourobcEmployees'>,
    input.year
  )

  if (!vacationDays) {
    throw new Error(
      `No vacation days record found for year ${input.year}. Please create one first.`
    )
  }

  const now = Date.now()
  const newEntries: VacationEntry[] = []
  const entryIds: string[] = []

  for (const entryInput of input.entries) {
    const entryId = generateVacationEntryId()
    entryIds.push(entryId)

    const newEntry: VacationEntry = {
      entryId,
      startDate: entryInput.startDate,
      endDate: entryInput.endDate,
      days: entryInput.days,
      type: entryInput.type,
      status: 'pending',
      requestedDate: now,
      requestedBy,
      reason: entryInput.reason,
      emergencyContact: entryInput.emergencyContact,
      notes: entryInput.notes,
      isHalfDay: entryInput.isHalfDay,
    }

    newEntries.push(newEntry)
  }

  // Update vacation days record
  const updatedEntries = [...vacationDays.entries, ...newEntries]
  const stats = calculateVacationStats(
    vacationDays.annualEntitlement,
    vacationDays.carryoverDays,
    updatedEntries
  )

  // Validate total days
  if (stats.remaining < 0) {
    throw new Error(
      `Insufficient vacation days. Available: ${stats.available}, Total requested: ${stats.used + stats.pending}`
    )
  }

  await ctx.db.patch(vacationDays._id, {
    entries: updatedEntries,
    used: stats.used,
    pending: stats.pending,
    remaining: stats.remaining,
    updatedAt: now,
    updatedBy: requestedBy,
  })

  return { vacationDaysId: vacationDays._id, entryIds }
}

/**
 * Soft delete vacation days record
 */
export async function softDeleteVacationDays(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  deletedBy: string
): Promise<void> {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const now = Date.now()
  await ctx.db.patch(vacationDaysId, {
    deletedAt: now,
    deletedBy,
    updatedAt: now,
    updatedBy: deletedBy,
  })
}

/**
 * Restore soft-deleted vacation days record
 */
export async function restoreVacationDays(
  ctx: MutationCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  restoredBy: string
): Promise<void> {
  const vacationDays = await ctx.db.get(vacationDaysId)
  if (!vacationDays) {
    throw new Error('Vacation days record not found')
  }

  const now = Date.now()
  await ctx.db.patch(vacationDaysId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: restoredBy,
  })
}
