// convex/lib/yourobc/employeeKPIs/constants.ts
// Business constants, permissions, and limits for employeeKPIs module

export const EMPLOYEE_KPIS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'employeeKPIs:view',
    CREATE: 'employeeKPIs:create',
    EDIT: 'employeeKPIs:edit',
    DELETE: 'employeeKPIs:delete',
    BULK_EDIT: 'employeeKPIs:bulk_edit',
    VIEW_ALL: 'employeeKPIs:view_all',
  },

  STATUS: {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    BEHIND: 'behind',
    ACHIEVED: 'achieved',
  },

  PERIOD: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
  },

  LIMITS: {
    MAX_KPI_NAME_LENGTH: 200,
    MIN_KPI_NAME_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_NOTES_LENGTH: 2000,
    MAX_HISTORICAL_DATA_ENTRIES: 365,
    MIN_TARGET_VALUE: 0,
    MIN_CURRENT_VALUE: 0,
  },

  THRESHOLDS: {
    DEFAULT_WARNING_THRESHOLD: 80, // 80% of target
    DEFAULT_CRITICAL_THRESHOLD: 60, // 60% of target
  },

  VALIDATION: {
    KPI_NAME_PATTERN: /^[a-zA-Z0-9\s\-_()%]+$/,
  },
} as const;
