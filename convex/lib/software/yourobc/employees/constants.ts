// convex/lib/software/yourobc/employees/constants.ts
// Business constants, permissions, and limits for employees module

export const EMPLOYEES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'employees:view',
    CREATE: 'employees:create',
    EDIT: 'employees:edit',
    DELETE: 'employees:delete',
    MANAGE_ALL: 'employees:manage_all',
    APPROVE_VACATION: 'employees:approve_vacation',
    VIEW_SALARY: 'employees:view_salary',
    EDIT_SALARY: 'employees:edit_salary',
    BULK_EDIT: 'employees:bulk_edit',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated',
    ON_LEAVE: 'on_leave',
    PROBATION: 'probation',
  },

  WORK_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline',
    ON_BREAK: 'on_break',
    IN_MEETING: 'in_meeting',
  },

  VACATION_TYPE: {
    ANNUAL: 'annual',
    SICK: 'sick',
    PERSONAL: 'personal',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
    UNPAID: 'unpaid',
    BEREAVEMENT: 'bereavement',
    OTHER: 'other',
  },

  VACATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  EMPLOYMENT_TYPE: {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    CONTRACT: 'contract',
    TEMPORARY: 'temporary',
    INTERN: 'intern',
  },

  PAYMENT_FREQUENCY: {
    HOURLY: 'hourly',
    WEEKLY: 'weekly',
    BI_WEEKLY: 'bi_weekly',
    MONTHLY: 'monthly',
    ANNUALLY: 'annually',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 2,
    MAX_EMPLOYEE_NUMBER_LENGTH: 50,
    MAX_DEPARTMENT_LENGTH: 100,
    MAX_POSITION_LENGTH: 150,
    MAX_PHONE_LENGTH: 20,
    MAX_EMAIL_LENGTH: 255,
    MAX_NOTES_LENGTH: 2000,
    MAX_REASON_LENGTH: 500,
    MIN_SALARY: 0,
    MAX_SALARY: 10000000,
    MIN_VACATION_DAYS: 0,
    MAX_VACATION_DAYS: 365,
    MAX_VACATION_ENTRIES: 100,
    MAX_TIME_ENTRIES: 1000,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z\s\-'.]+$/,
    EMPLOYEE_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    PHONE_PATTERN: /^\+?[\d\s\-()]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  ROLES: {
    EMPLOYEE: 'employee',
    MANAGER: 'manager',
    HR: 'hr',
    ADMIN: 'admin',
  },

  DEFAULT_ANNUAL_VACATION_DAYS: 20,
  DEFAULT_TIMEZONE: 'UTC',
  AUTO_OFFLINE_TIMEOUT: 1800000, // 30 minutes in milliseconds
} as const;
