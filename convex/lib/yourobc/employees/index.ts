// convex/lib/yourobc/employees/index.ts
// convex/yourobc/employees/index.ts

// Export subdirectory modules
export * as commissions from './commissions'
export * as kpis from './kpis'
export * as onlineStatus from './onlineStatus'
export * as sessions from './sessions'
export * as vacations from './vacations'

export {
  EMPLOYEE_CONSTANTS,
  EMPLOYEE_STATUS_COLORS,
  VACATION_STATUS_COLORS,
  COMMON_DEPARTMENTS,
  COMMON_POSITIONS
} from './constants'

export * from './types'

export {
  getEmployees,
  getEmployee,
  getEmployeeByAuthId,
  getEmployeeStats,
  getEmployeeTimeEntries,
  searchEmployees,
  getEmployeeVacations,
  getVacationRequests,
} from './queries'

export {
  createEmployee,
  updateEmployee,
  recordEmployeeTimeEntry,
  deleteEmployee,
  requestVacation,
  approveVacation,
} from './mutations'

export {
  validateEmployeeData,
  validateOfficeData,
  validateEmergencyContact,
  generateEmployeeNumber,
  getEmployeeStatusColor,
  getVacationStatusColor,
  getEmployeeWorkStatus,
  formatEmployeeDisplayName,
  sanitizeEmployeeForExport,
  validateVacationData,
  calculateVacationDays,
  isEmployeeOnVacation,
  getUpcomingVacations,
  calculateRemainingVacationDays,
} from './utils'