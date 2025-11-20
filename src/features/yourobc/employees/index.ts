// src/features/yourobc/employees/index.ts

// === Types ===
export type {
  Employee,
  EmployeeId,
  VacationDay,
  VacationDayId,
  EmployeeFormData,
  VacationRequestFormData,
  EmployeeListItem,
  EmployeeDetailsProps,
  EmployeeCardProps,
  EmployeeCreationParams,
  EmployeeUpdateParams,
  EmployeePerformanceMetrics,
  EmployeeSearchFilters,
  EmployeeSortOptions,
  EmployeeDashboardMetrics,
  EmployeeWithDetails,
  EmployeeWorkStatus,
  EmployeeInsights,
  VacationSummary,
  CreateEmployeeData,
  UpdateEmployeeData,
  Office,
  EmergencyContact,
  VacationEntry,
} from './types'

export {
  EMPLOYEE_CONSTANTS,
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  VACATION_STATUS_COLORS,
  VACATION_STATUS_LABELS,
  VACATION_TYPE_LABELS,
  COMMON_DEPARTMENTS,
  COMMON_POSITIONS,
  OFFICE_COUNTRIES,
} from './types'

// === Configuration ===
export {
  DEFAULT_EMPLOYEES_CONFIG,
  MINIMAL_EMPLOYEES_CONFIG,
  EMPLOYEES_CONFIG,
  getEmployeesConfig,
  isFeatureEnabled,
  type EmployeesConfig,
} from './config/employees.config'

// === Services ===
export { EmployeesService, employeesService } from './services/EmployeesService'

// === Hooks ===
export {
  useEmployees,
  useEmployee,
  useEmployeeSearch,
  useEmployeeVacations,
  useVacationRequests,
  useEmployeeForm,
} from './hooks/useEmployees'

// === Components ===
export { EmployeeCard } from './components/EmployeeCard'
export { EmployeeList } from './components/EmployeeList'
export { EmployeeForm } from './components/EmployeeForm'
export { EmployeeSearch } from './components/EmployeeSearch'
export { EmployeeStats } from './components/EmployeeStats'
export { VacationRequestForm } from './components/VacationRequestForm'
export { VacationList } from './components/VacationList'
export { OnlineStatusWidget, OnlineStatusCompact } from './components/OnlineStatusWidget'

// === Pages ===
export { EmployeesPage } from './pages/EmployeesPage'
export { EmployeeDetailsPage } from './pages/EmployeeDetailsPage'
export { CreateEmployeePage } from './pages/CreateEmployeePage'
export { VacationManagementPage } from './pages/VacationManagementPage'
export { CreateVacationRequestPage } from './pages/CreateVacationRequestPage'

// Re-export for convenience
export * from './types'