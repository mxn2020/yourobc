// convex/lib/yourobc/employees/index.ts
// Public API exports for employees module

// Constants
export { EMPLOYEES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmployeeData,
  validateVacationRequest,
  formatEmployeeDisplayName,
  generateEmployeeNumber,
  isEmployeeEditable,
  canRequestVacation,
  calculateVacationDays,
  calculateDaysRemaining,
  isOnVacation,
  formatSalary,
  sanitizeEmployeeData,
} from './utils';

// Permissions
export {
  canViewEmployee,
  canEditEmployee,
  canDeleteEmployee,
  canViewSalary,
  canEditSalary,
  canViewVacationDays,
  canApproveVacation,
  requireViewEmployeeAccess,
  requireEditEmployeeAccess,
  requireDeleteEmployeeAccess,
  requireEditSalaryAccess,
  requireViewVacationDaysAccess,
  requireApproveVacationAccess,
  filterEmployeesByAccess,
  filterVacationDaysByAccess,
} from './permissions';

// Queries
export {
  getEmployees,
  getEmployee,
  getEmployeeByPublicId,
  getEmployeeByUserProfileId,
  getEmployeeStats,
  getEmployeesByManager,
  getEmployeesByDepartment,
  getVacationDays,
  getAllVacationDays,
  getVacationStats,
} from './queries';

// Mutations
export {
  createEmployee,
  updateEmployee,
  updateEmployeeSalary,
  deleteEmployee,
  restoreEmployee,
  createVacationDays,
  requestVacation,
  approveVacation,
  rejectVacation,
  cancelVacation,
} from './mutations';

// Employee Commissions Module
export * from './commissions';

// Employee KPIs Module
export * from './kpis';

// Employee Sessions Module
export * from './sessions';
