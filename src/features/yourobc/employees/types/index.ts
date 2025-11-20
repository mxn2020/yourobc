// src/features/yourobc/employees/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { EmergencyContact, Office, VacationEntry } from '@/convex/lib/yourobc'

// Base types from Convex schema
export type Employee = Doc<'yourobcEmployees'>
export type EmployeeId = Id<'yourobcEmployees'>
export type VacationDay = Doc<'yourobcVacationDays'>
export type VacationDayId = Id<'yourobcVacationDays'>

// Re-export types from convex for consistency
export type {
  CreateEmployeeData,
  UpdateEmployeeData,
  Office,
  EmergencyContact,
  VacationEntry,
} from '@/convex/lib/yourobc/employees/types'

// Work Status type (matches what queries return)
export interface EmployeeWorkStatus {
  isWorking: boolean
  lastLogin?: number
  lastLogout?: number
  todayHours: number
}

// Extended employee type with additional computed fields
// Note: Employee has 'workStatus' string field for availability (available/busy/offline)
// and 'workingHours' computed object with actual work hours data
export interface EmployeeWithDetails extends Employee {
  userProfile: {
    name?: string
    email: string
    avatar?: string
    role?: string
    isActive?: boolean
  }
  manager?: {
    _id: EmployeeId
    employeeNumber: string
    name?: string
    email?: string
    department?: string
    position?: string
  } | null
  directReports?: Array<{
    _id: EmployeeId
    employeeNumber: string
    department?: string
    position?: string
    status: string
    isActive: boolean
    userProfile: {
      name?: string
      email: string
      avatar?: string
    } | null
  }>
  workingHours?: EmployeeWorkStatus
  vacationStatus?: {
    onVacation: boolean
    currentVacation?: {
      startDate: number
      endDate: number
      type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other'
      reason?: string
      daysRemaining: number
    }
    upcomingVacations: VacationEntry[]
  }
}

// UI-specific types
export interface EmployeeFormData {
  userProfileId: Id<"userProfiles">
  authUserId: string
  employeeNumber?: string
  department?: string
  position?: string
  managerId?: EmployeeId
  office: Office
  hireDate?: number
  workPhone?: string
  workEmail?: string
  emergencyContact?: EmergencyContact
  status?: Employee['status']
  isActive?: boolean
  isOnline?: boolean
  timezone?: string
}

export interface VacationRequestFormData {
  year: number
  startDate: number
  endDate: number
  days: number
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity'
  reason?: string
  emergencyContact?: EmergencyContact
}

export interface EmployeeListItem extends EmployeeWithDetails {
  displayName?: string
  formattedOffice?: string
  formattedDepartment?: string
  hasRecentActivity?: boolean
  isManager?: boolean
}

export interface EmployeeDetailsProps {
  employee: EmployeeWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export interface EmployeeCardProps {
  employee: EmployeeListItem
  onClick?: (employee: EmployeeListItem) => void
  showWorkStatus?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface EmployeeCreationParams {
  employeeData: EmployeeFormData
  autoGenerateNumber?: boolean
}

export interface EmployeeUpdateParams {
  employeeId: EmployeeId
  updates: Partial<EmployeeFormData>
  updateReason?: string
}

export interface EmployeePerformanceMetrics {
  totalWorkingDays: number
  averageHoursPerDay: number
  punctualityScore: number
  vacationDaysUsed: number
  vacationDaysRemaining: number
  reportsManaged: number
}

export interface EmployeeInsights {
  employeeAge: number
  daysSinceLastActivity: number | null
  needsAttention: boolean
  isNewEmployee: boolean
  isManager: boolean
  hasUpcomingVacation: boolean
}

// Stats type from query
export interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  onlineEmployees: number
  employeesByStatus: {
    available: number
    busy: number
    offline: number
  }
  employeesByDepartment: Record<string, number>
  employeesByOffice: Record<string, number>
  avgTasksPerEmployee: number
  vacationRequestsPending: number
}

// Vacation summary from query
export interface VacationSummary {
  year: number
  available: number
  used: number
  pending: number
  remaining: number
  entries: (VacationEntry & {
    approver?: {
      _id: EmployeeId
      employeeNumber: string
      name?: string
    } | null
  })[]
}

// Filter and search types
export interface EmployeeSearchFilters {
  status?: ('active' | 'inactive' | 'terminated' | 'on_leave')[]
  isActive?: boolean
  isOnline?: boolean
  department?: string[]
  position?: string[]
  office?: string[]
  manager?: EmployeeId[]
  search?: string
}

export interface EmployeeSortOptions {
  sortBy: 'name' | 'employeeNumber' | 'department' | 'position' | 'status' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface EmployeeDashboardMetrics {
  totalEmployees: number
  activeEmployees: number
  onlineEmployees: number
  employeesByDepartment: Record<string, number>
  employeesByOffice: Record<string, number>
  pendingVacationRequests: number
  employeesOnVacation: number
  recentActivity: Array<{
    employeeId: EmployeeId
    employeeName: string
    activity: string
    timestamp: number
  }>
}

// Export constants from convex
export const EMPLOYEE_CONSTANTS = {
  STATUS: {
    AVAILABLE: 'available' as const,
    BUSY: 'busy' as const,
    OFFLINE: 'offline' as const,
  },
  TYPE: {
    OFFICE: 'office' as const,
  },
  VACATION_STATUS: {
    REQUESTED: 'requested' as const,
    APPROVED: 'approved' as const,
    DENIED: 'denied' as const,
    CANCELLED: 'cancelled' as const,
    COMPLETED: 'completed' as const,
  },
  VACATION_TYPE: {
    ANNUAL: 'annual' as const,
    SICK: 'sick' as const,
    PERSONAL: 'personal' as const,
    MATERNITY: 'maternity' as const,
    PATERNITY: 'paternity' as const,
  },
  DEFAULT_VALUES: {
    TIMEZONE: 'Europe/Berlin',
    STATUS: 'available' as const,
    ANNUAL_VACATION_DAYS: 25,
  },
  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 200,
    MAX_PHONE_LENGTH: 50,
    MAX_DEPARTMENT_LENGTH: 50,
    MAX_POSITION_LENGTH: 100,
    MAX_OFFICE_LOCATION_LENGTH: 100,
    MAX_VACATION_DAYS_PER_YEAR: 50,
    MAX_EMPLOYEE_NUMBER_LENGTH: 20,
  },
  PERMISSIONS: {
    VIEW: 'employees.view',
    CREATE: 'employees.create',
    EDIT: 'employees.edit',
    DELETE: 'employees.delete',
    ASSIGN: 'employees.assign',
    VIEW_TIME_ENTRIES: 'employees.view_time_entries',
    VIEW_VACATIONS: 'employees.view_vacations',
    EDIT_VACATIONS: 'employees.edit_vacations',
    APPROVE_VACATIONS: 'employees.approve_vacations',
  },
} as const

export const EMPLOYEE_STATUS_COLORS = {
  [EMPLOYEE_CONSTANTS.STATUS.AVAILABLE]: '#10b981',
  [EMPLOYEE_CONSTANTS.STATUS.BUSY]: '#f59e0b',
  [EMPLOYEE_CONSTANTS.STATUS.OFFLINE]: '#6b7280',
} as const

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_CONSTANTS.STATUS.AVAILABLE]: 'Available',
  [EMPLOYEE_CONSTANTS.STATUS.BUSY]: 'Busy',
  [EMPLOYEE_CONSTANTS.STATUS.OFFLINE]: 'Offline',
} as const

export const VACATION_STATUS_COLORS = {
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.REQUESTED]: '#f59e0b',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.APPROVED]: '#10b981',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.DENIED]: '#ef4444',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.CANCELLED]: '#6b7280',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.COMPLETED]: '#8b5cf6',
} as const

export const VACATION_STATUS_LABELS = {
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.REQUESTED]: 'Requested',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.APPROVED]: 'Approved',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.DENIED]: 'Denied',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.CANCELLED]: 'Cancelled',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.COMPLETED]: 'Completed',
} as const

export const VACATION_TYPE_LABELS = {
  [EMPLOYEE_CONSTANTS.VACATION_TYPE.ANNUAL]: 'Annual Leave',
  [EMPLOYEE_CONSTANTS.VACATION_TYPE.SICK]: 'Sick Leave',
  [EMPLOYEE_CONSTANTS.VACATION_TYPE.PERSONAL]: 'Personal Leave',
  [EMPLOYEE_CONSTANTS.VACATION_TYPE.MATERNITY]: 'Maternity Leave',
  [EMPLOYEE_CONSTANTS.VACATION_TYPE.PATERNITY]: 'Paternity Leave',
  unpaid: 'Unpaid Leave',
  parental: 'Parental Leave',
  bereavement: 'Bereavement Leave',
  other: 'Other',
} as const

// Common departments
export const COMMON_DEPARTMENTS = [
  'Operations',
  'Sales',
  'Customer Service',
  'Finance',
  'IT',
  'HR',
  'Management',
  'Administration',
  'Marketing',
  'Legal',
] as const

// Common positions
export const COMMON_POSITIONS = [
  'Manager',
  'Senior Specialist',
  'Specialist',
  'Coordinator',
  'Assistant',
  'Director',
  'Team Lead',
  'Analyst',
  'Associate',
  'Intern',
] as const

// Countries for office locations
export const OFFICE_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'GB', name: 'United Kingdom' },
] as const