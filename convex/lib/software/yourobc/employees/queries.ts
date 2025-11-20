// convex/lib/software/yourobc/employees/queries.ts
/**
 * Query Operations for Employees Entity
 *
 * Provides query functions for retrieving employees and vacation data
 * with filtering, pagination, and permission checks.
 *
 * @module convex/lib/software/yourobc/employees/queries
 */

import { QueryCtx } from '../../../_generated/server'
import { Id } from '../../../_generated/dataModel'
import type {
  Employee,
  VacationDays,
  EmployeeFilter,
  VacationDaysFilter,
} from './types'

// ============================================================================
// Employee Queries
// ============================================================================

/**
 * Get employee by ID
 */
export async function getEmployeeById(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>
): Promise<Employee | null> {
  const employee = await ctx.db.get(employeeId)
  if (!employee || employee.deletedAt) return null
  return employee
}

/**
 * Get employee by public ID
 */
export async function getEmployeeByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<Employee | null> {
  const employee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()
  return employee
}

/**
 * Get employee by auth user ID
 */
export async function getEmployeeByAuthUserId(
  ctx: QueryCtx,
  authUserId: string
): Promise<Employee | null> {
  const employee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()
  return employee
}

/**
 * Get employee by employee number
 */
export async function getEmployeeByEmployeeNumber(
  ctx: QueryCtx,
  employeeNumber: string
): Promise<Employee | null> {
  const employee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_employeeNumber', (q) => q.eq('employeeNumber', employeeNumber))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()
  return employee
}

/**
 * List employees with filtering
 */
export async function listEmployees(
  ctx: QueryCtx,
  ownerId: string,
  filter?: EmployeeFilter,
  limit: number = 100
): Promise<Employee[]> {
  let query = ctx.db
    .query('yourobcEmployees')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  // Apply filters
  if (filter?.status) {
    query = query.filter((q) => q.eq(q.field('status'), filter.status))
  }
  if (filter?.workStatus) {
    query = query.filter((q) => q.eq(q.field('workStatus'), filter.workStatus))
  }
  if (filter?.isActive !== undefined) {
    query = query.filter((q) => q.eq(q.field('isActive'), filter.isActive))
  }
  if (filter?.isOnline !== undefined) {
    query = query.filter((q) => q.eq(q.field('isOnline'), filter.isOnline))
  }
  if (filter?.department) {
    query = query.filter((q) => q.eq(q.field('department'), filter.department))
  }
  if (filter?.officeLocation) {
    query = query.filter((q) =>
      q.eq(q.field('office.location'), filter.officeLocation)
    )
  }
  if (filter?.officeCountryCode) {
    query = query.filter((q) =>
      q.eq(q.field('office.countryCode'), filter.officeCountryCode)
    )
  }
  if (filter?.managerId) {
    query = query.filter((q) =>
      q.eq(q.field('managerId'), filter.managerId as Id<'yourobcEmployees'>)
    )
  }
  if (filter?.isOnVacation !== undefined) {
    query = query.filter((q) =>
      q.eq(q.field('currentVacationStatus.isOnVacation'), filter.isOnVacation)
    )
  }

  return await query.take(limit)
}

/**
 * Get employees by status
 */
export async function getEmployeesByStatus(
  ctx: QueryCtx,
  ownerId: string,
  status: string
): Promise<Employee[]> {
  return await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_status', (q) => q.eq('status', status))
    .filter((q) =>
      q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

/**
 * Get employees by department
 */
export async function getEmployeesByDepartment(
  ctx: QueryCtx,
  ownerId: string,
  department: string
): Promise<Employee[]> {
  return await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_department', (q) => q.eq('department', department))
    .filter((q) =>
      q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

/**
 * Get active online employees
 */
export async function getActiveOnlineEmployees(
  ctx: QueryCtx,
  ownerId: string
): Promise<Employee[]> {
  return await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_isOnline', (q) => q.eq('isOnline', true))
    .filter((q) =>
      q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('isActive'), true),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

/**
 * Get employees on vacation
 */
export async function getEmployeesOnVacation(
  ctx: QueryCtx,
  ownerId: string
): Promise<Employee[]> {
  return await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_vacation_status', (q) =>
      q.eq('currentVacationStatus.isOnVacation', true)
    )
    .filter((q) =>
      q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

// ============================================================================
// Vacation Days Queries
// ============================================================================

/**
 * Get vacation days by ID
 */
export async function getVacationDaysById(
  ctx: QueryCtx,
  vacationDaysId: Id<'yourobcVacationDays'>
): Promise<VacationDays | null> {
  const vacationDays = await ctx.db.get(vacationDaysId)
  if (!vacationDays || vacationDays.deletedAt) return null
  return vacationDays
}

/**
 * Get vacation days by public ID
 */
export async function getVacationDaysByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<VacationDays | null> {
  const vacationDays = await ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()
  return vacationDays
}

/**
 * Get vacation days for employee and year
 */
export async function getVacationDaysByEmployeeYear(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  year: number
): Promise<VacationDays | null> {
  const vacationDays = await ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_employee_year', (q) =>
      q.eq('employeeId', employeeId).eq('year', year)
    )
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first()
  return vacationDays
}

/**
 * List vacation days for employee
 */
export async function listVacationDaysForEmployee(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>
): Promise<VacationDays[]> {
  return await ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()
}

/**
 * List vacation days with filtering
 */
export async function listVacationDays(
  ctx: QueryCtx,
  ownerId: string,
  filter?: VacationDaysFilter,
  limit: number = 100
): Promise<VacationDays[]> {
  let query = ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  // Apply filters
  if (filter?.employeeId) {
    query = query.filter((q) =>
      q.eq(q.field('employeeId'), filter.employeeId as Id<'yourobcEmployees'>)
    )
  }
  if (filter?.year) {
    query = query.filter((q) => q.eq(q.field('year'), filter.year))
  }
  if (filter?.hasAvailableDays) {
    query = query.filter((q) => q.gt(q.field('remaining'), 0))
  }
  if (filter?.hasPendingRequests) {
    query = query.filter((q) => q.gt(q.field('pending'), 0))
  }

  return await query.take(limit)
}

/**
 * Get vacation days by year
 */
export async function getVacationDaysByYear(
  ctx: QueryCtx,
  ownerId: string,
  year: number
): Promise<VacationDays[]> {
  return await ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_year', (q) => q.eq('year', year))
    .filter((q) =>
      q.and(
        q.eq(q.field('ownerId'), ownerId),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

/**
 * Get pending vacation requests
 */
export async function getPendingVacationRequests(
  ctx: QueryCtx,
  ownerId: string
): Promise<VacationDays[]> {
  const allVacationDays = await ctx.db
    .query('yourobcVacationDays')
    .withIndex('by_ownerId', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  // Filter for those with pending entries
  return allVacationDays.filter((vd) =>
    vd.entries.some((entry) => entry.status === 'pending')
  )
}

// ============================================================================
// Vacation Entry Queries
// ============================================================================

/**
 * Get vacation entry by ID within vacation days
 */
export async function getVacationEntry(
  ctx: QueryCtx,
  vacationDaysId: Id<'yourobcVacationDays'>,
  entryId: string
) {
  const vacationDays = await getVacationDaysById(ctx, vacationDaysId)
  if (!vacationDays) return null

  const entry = vacationDays.entries.find((e) => e.entryId === entryId)
  return entry || null
}

/**
 * Get approved vacation entries for date range
 */
export async function getApprovedVacationsInRange(
  ctx: QueryCtx,
  employeeId: Id<'yourobcEmployees'>,
  startDate: number,
  endDate: number
) {
  const allVacationDays = await listVacationDaysForEmployee(ctx, employeeId)

  const overlappingEntries = []
  for (const vd of allVacationDays) {
    for (const entry of vd.entries) {
      if (
        entry.status === 'approved' &&
        entry.startDate <= endDate &&
        entry.endDate >= startDate
      ) {
        overlappingEntries.push({ vacationDaysId: vd._id, entry })
      }
    }
  }

  return overlappingEntries
}
