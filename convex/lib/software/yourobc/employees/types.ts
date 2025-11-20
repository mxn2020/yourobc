// convex/lib/software/yourobc/employees/types.ts
/**
 * Library Types for Employees Entity
 *
 * Re-exports types from schema and defines additional types
 * for library operations, queries, and mutations.
 *
 * @module convex/lib/software/yourobc/employees/types
 */

// Re-export all types from schema
export type {
  Employee,
  VacationDays,
  EmployeeId,
  VacationDaysId,
  Office,
  EmergencyContact,
  CurrentVacationStatus,
  RecentVacation,
  VacationEntry,
  EmployeeStatus,
  WorkStatus,
  VacationType,
  VacationStatus,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  CreateVacationDaysInput,
  CreateVacationEntryInput,
  UpdateVacationEntryInput,
  EmployeeDisplay,
  VacationDaysDisplay,
} from '../../../schema/software/yourobc/employees/types'

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Filter options for employee queries
 */
export type EmployeeFilter = {
  status?: string
  workStatus?: string
  isActive?: boolean
  isOnline?: boolean
  department?: string
  officeLocation?: string
  officeCountryCode?: string
  managerId?: string
  isOnVacation?: boolean
}

/**
 * Filter options for vacation days queries
 */
export type VacationDaysFilter = {
  employeeId?: string
  year?: number
  hasAvailableDays?: boolean
  hasPendingRequests?: boolean
}

// ============================================================================
// Batch Operation Types
// ============================================================================

/**
 * Batch vacation entry creation input
 */
export type BatchVacationEntriesInput = {
  employeeId: string
  year: number
  entries: Array<{
    startDate: number
    endDate: number
    days: number
    type: string
    reason?: string
    emergencyContact?: any
    notes?: string
    isHalfDay?: boolean
  }>
}

/**
 * Vacation calculation result
 */
export type VacationCalculation = {
  available: number
  used: number
  pending: number
  remaining: number
}

// ============================================================================
// Audit Types
// ============================================================================

/**
 * Audit log entry for employee changes
 */
export type EmployeeAuditLog = {
  action: 'create' | 'update' | 'delete' | 'restore'
  performedBy: string
  performedAt: number
  changes?: Record<string, any>
  reason?: string
}

/**
 * Audit log entry for vacation changes
 */
export type VacationAuditLog = {
  action: 'request' | 'approve' | 'reject' | 'cancel' | 'update'
  entryId: string
  performedBy: string
  performedAt: number
  reason?: string
  notes?: string
}
