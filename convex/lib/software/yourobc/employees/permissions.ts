// convex/lib/software/yourobc/employees/permissions.ts
/**
 * Permissions for Employees Entity
 *
 * Defines permission checks and access control logic for employee
 * and vacation management operations.
 *
 * @module convex/lib/software/yourobc/employees/permissions
 */

import type { Employee, VacationDays } from './types'

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionContext = {
  authUserId: string
  isOwner?: boolean
  isManager?: boolean
  isAdmin?: boolean
}

// ============================================================================
// Employee Permissions
// ============================================================================

/**
 * Check if user can view employee
 */
export function canViewEmployee(
  employee: Employee,
  context: PermissionContext
): boolean {
  // Admins can view all
  if (context.isAdmin) return true

  // Owners can view their own employees
  if (employee.ownerId === context.authUserId) return true

  // Managers can view their direct reports
  if (context.isManager && employee.managerId) {
    // TODO: Implement manager check
    return true
  }

  // Users can view their own profile
  if (employee.authUserId === context.authUserId) return true

  return false
}

/**
 * Check if user can create employee
 */
export function canCreateEmployee(context: PermissionContext): boolean {
  // Only admins and owners can create employees
  return context.isAdmin || context.isOwner || false
}

/**
 * Check if user can update employee
 */
export function canUpdateEmployee(
  employee: Employee,
  context: PermissionContext
): boolean {
  // Admins can update all
  if (context.isAdmin) return true

  // Owners can update their own employees
  if (employee.ownerId === context.authUserId) return true

  // Managers can update their direct reports (limited fields)
  if (context.isManager && employee.managerId) {
    // TODO: Implement manager check
    return true
  }

  return false
}

/**
 * Check if user can delete (soft delete) employee
 */
export function canDeleteEmployee(
  employee: Employee,
  context: PermissionContext
): boolean {
  // Only admins and owners can delete employees
  return (
    context.isAdmin ||
    (context.isOwner && employee.ownerId === context.authUserId)
  )
}

/**
 * Check if user can restore employee
 */
export function canRestoreEmployee(
  employee: Employee,
  context: PermissionContext
): boolean {
  // Same as delete permissions
  return canDeleteEmployee(employee, context)
}

// ============================================================================
// Vacation Permissions
// ============================================================================

/**
 * Check if user can view vacation days
 */
export function canViewVacationDays(
  vacationDays: VacationDays,
  employeeAuthUserId: string,
  context: PermissionContext
): boolean {
  // Admins can view all
  if (context.isAdmin) return true

  // Owners can view their employees' vacation days
  if (vacationDays.ownerId === context.authUserId) return true

  // Users can view their own vacation days
  if (employeeAuthUserId === context.authUserId) return true

  // Managers can view their direct reports' vacation days
  if (context.isManager) {
    // TODO: Implement manager check
    return true
  }

  return false
}

/**
 * Check if user can create vacation days record
 */
export function canCreateVacationDays(context: PermissionContext): boolean {
  // Only admins and owners can create vacation days records
  return context.isAdmin || context.isOwner || false
}

/**
 * Check if user can request vacation
 */
export function canRequestVacation(
  vacationDays: VacationDays,
  employeeAuthUserId: string,
  context: PermissionContext
): boolean {
  // Admins can request for anyone
  if (context.isAdmin) return true

  // Owners can request for their employees
  if (vacationDays.ownerId === context.authUserId) return true

  // Users can request their own vacation
  if (employeeAuthUserId === context.authUserId) return true

  return false
}

/**
 * Check if user can approve/reject vacation
 */
export function canApproveVacation(
  vacationDays: VacationDays,
  employeeAuthUserId: string,
  context: PermissionContext
): boolean {
  // Admins can approve all
  if (context.isAdmin) return true

  // Owners can approve their employees' vacation
  if (vacationDays.ownerId === context.authUserId) return true

  // Managers can approve their direct reports' vacation
  if (context.isManager) {
    // TODO: Implement manager check
    return true
  }

  // Users cannot approve their own vacation
  return false
}

/**
 * Check if user can cancel vacation
 */
export function canCancelVacation(
  vacationDays: VacationDays,
  employeeAuthUserId: string,
  context: PermissionContext
): boolean {
  // Admins can cancel all
  if (context.isAdmin) return true

  // Owners can cancel their employees' vacation
  if (vacationDays.ownerId === context.authUserId) return true

  // Users can cancel their own vacation (before it starts)
  if (employeeAuthUserId === context.authUserId) return true

  // Managers can cancel their direct reports' vacation
  if (context.isManager) {
    // TODO: Implement manager check
    return true
  }

  return false
}

/**
 * Check if user can update vacation entitlements
 */
export function canUpdateVacationEntitlements(
  vacationDays: VacationDays,
  context: PermissionContext
): boolean {
  // Only admins and owners can update entitlements
  return (
    context.isAdmin ||
    (context.isOwner && vacationDays.ownerId === context.authUserId)
  )
}

// ============================================================================
// Field-Level Permissions
// ============================================================================

/**
 * Get allowed fields for employee update based on permission level
 */
export function getAllowedEmployeeUpdateFields(
  employee: Employee,
  context: PermissionContext
): string[] {
  // Admins and owners can update all fields
  if (context.isAdmin || employee.ownerId === context.authUserId) {
    return [
      'department',
      'position',
      'managerId',
      'office',
      'hireDate',
      'workPhone',
      'workEmail',
      'emergencyContact',
      'status',
      'workStatus',
      'isActive',
      'isOnline',
      'timeEntries',
      'timezone',
      'currentVacationStatus',
      'recentVacations',
      'metadata',
    ]
  }

  // Managers can update limited fields for direct reports
  if (context.isManager && employee.managerId) {
    return ['workStatus', 'isOnline', 'lastActivity', 'timeEntries']
  }

  // Users can update their own limited fields
  if (employee.authUserId === context.authUserId) {
    return [
      'workPhone',
      'emergencyContact',
      'workStatus',
      'isOnline',
      'lastActivity',
      'timezone',
    ]
  }

  return []
}
