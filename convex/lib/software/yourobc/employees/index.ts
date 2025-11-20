// convex/lib/software/yourobc/employees/index.ts
/**
 * Employees Entity - Library Module
 *
 * Barrel export for all employee-related library functions including
 * constants, types, utilities, permissions, queries, and mutations.
 *
 * This module provides complete CRUD operations for both employees
 * and vacation days tables.
 *
 * @module convex/lib/software/yourobc/employees
 */

// Constants
export * from './constants'

// Types
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
  EmployeeFilter,
  VacationDaysFilter,
  BatchVacationEntriesInput,
  VacationCalculation,
  EmployeeAuditLog,
  VacationAuditLog,
} from './types'

// Utilities
export {
  generateEmployeePublicId,
  generateVacationDaysPublicId,
  generateVacationEntryId,
  calculateVacationStats,
  calculateDaysBetween,
  calculateDaysRemaining,
  isCurrentlyOnVacation,
  getCurrentVacationEntry,
  calculateProRatedEntitlement,
  validateVacationRequest,
  updateRecentVacations,
  shouldMarkOffline,
  formatEmployeeDisplay,
  formatVacationDaysDisplay,
  formatDate,
  formatDateRange,
} from './utils'

// Permissions
export type { PermissionContext } from './permissions'
export {
  canViewEmployee,
  canCreateEmployee,
  canUpdateEmployee,
  canDeleteEmployee,
  canRestoreEmployee,
  canViewVacationDays,
  canCreateVacationDays,
  canRequestVacation,
  canApproveVacation,
  canCancelVacation,
  canUpdateVacationEntitlements,
  getAllowedEmployeeUpdateFields,
} from './permissions'

// Queries
export {
  getEmployeeById,
  getEmployeeByPublicId,
  getEmployeeByAuthUserId,
  getEmployeeByEmployeeNumber,
  listEmployees,
  getEmployeesByStatus,
  getEmployeesByDepartment,
  getActiveOnlineEmployees,
  getEmployeesOnVacation,
  getVacationDaysById,
  getVacationDaysByPublicId,
  getVacationDaysByEmployeeYear,
  listVacationDaysForEmployee,
  listVacationDays,
  getVacationDaysByYear,
  getPendingVacationRequests,
  getVacationEntry,
  getApprovedVacationsInRange,
} from './queries'

// Mutations
export {
  createEmployee,
  updateEmployee,
  updateEmployeeActivity,
  updateEmployeeVacationStatus,
  softDeleteEmployee,
  restoreEmployee,
  createVacationDays,
  updateVacationEntitlements,
  requestVacation,
  approveVacation,
  rejectVacation,
  cancelVacation,
  batchCreateVacationEntries,
  softDeleteVacationDays,
  restoreVacationDays,
} from './mutations'
