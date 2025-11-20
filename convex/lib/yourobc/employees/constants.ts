// convex/lib/yourobc/employees/constants.ts
// convex/yourobc/employees/constants.ts

import type { EmployeeStatus, WorkStatus } from '../../../schema/yourobc/base'

export const EMPLOYEE_CONSTANTS = {
  TYPE: {
    OFFICE: 'office',
  },
  // Employment status (active, inactive, terminated, on_leave)
  STATUS: {
    ACTIVE: 'active' as EmployeeStatus,
    INACTIVE: 'inactive' as EmployeeStatus,
    TERMINATED: 'terminated' as EmployeeStatus,
    ON_LEAVE: 'on_leave' as EmployeeStatus,
  },
  // Work availability status (available, busy, offline)
  WORK_STATUS: {
    AVAILABLE: 'available' as WorkStatus,
    BUSY: 'busy' as WorkStatus,
    OFFLINE: 'offline' as WorkStatus,
  },
  TIME_ENTRY_TYPE: {
    LOGIN: 'login',
    LOGOUT: 'logout',
  },
  VACATION_STATUS: {
    REQUESTED: 'requested',
    APPROVED: 'approved',
    DENIED: 'denied',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  VACATION_TYPE: {
    ANNUAL: 'annual',
    SICK: 'sick',
    PERSONAL: 'personal',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
  },
  DEFAULT_VALUES: {
    TYPE: 'office',
    STATUS: 'active' as EmployeeStatus,
    WORK_STATUS: 'available' as WorkStatus,
    TIMEZONE: 'Europe/Berlin',
    ANNUAL_VACATION_DAYS: 25,
  },
  LIMITS: {
    MAX_EMPLOYEE_NUMBER_LENGTH: 20,
    MAX_NAME_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_EMAIL_LENGTH: 100,
    MAX_DEPARTMENT_LENGTH: 50,
    MAX_POSITION_LENGTH: 100,
    MAX_OFFICE_LOCATION_LENGTH: 100,
    MAX_VACATION_DAYS_PER_YEAR: 50,
    MIN_VACATION_DAYS: 0,
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
} as const;

export const EMPLOYEE_STATUS_COLORS = {
  [EMPLOYEE_CONSTANTS.STATUS.ACTIVE]: '#10b981',
  [EMPLOYEE_CONSTANTS.STATUS.INACTIVE]: '#6b7280',
  [EMPLOYEE_CONSTANTS.STATUS.TERMINATED]: '#ef4444',
  [EMPLOYEE_CONSTANTS.STATUS.ON_LEAVE]: '#f59e0b',
} as const;

export const WORK_STATUS_COLORS = {
  [EMPLOYEE_CONSTANTS.WORK_STATUS.AVAILABLE]: '#10b981',
  [EMPLOYEE_CONSTANTS.WORK_STATUS.BUSY]: '#f59e0b',
  [EMPLOYEE_CONSTANTS.WORK_STATUS.OFFLINE]: '#6b7280',
} as const;

export const VACATION_STATUS_COLORS = {
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.REQUESTED]: '#f59e0b',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.APPROVED]: '#10b981',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.DENIED]: '#ef4444',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.CANCELLED]: '#6b7280',
  [EMPLOYEE_CONSTANTS.VACATION_STATUS.COMPLETED]: '#8b5cf6',
} as const;

export const COMMON_DEPARTMENTS = [
  'Operations',
  'Sales',
  'Customer Service',
  'Finance',
  'IT',
  'HR',
  'Management',
  'Administration',
] as const;

export const COMMON_POSITIONS = [
  'Manager',
  'Senior Specialist',
  'Specialist',
  'Coordinator',
  'Assistant',
  'Director',
  'Team Lead',
  'Analyst',
] as const;