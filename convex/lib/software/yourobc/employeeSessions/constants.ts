// convex/lib/software/yourobc/employeeSessions/constants.ts
// Business constants, permissions, and limits for employeeSessions module

export const EMPLOYEE_SESSIONS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'employeeSessions:view',
    CREATE: 'employeeSessions:create',
    EDIT: 'employeeSessions:edit',
    DELETE: 'employeeSessions:delete',
    BULK_EDIT: 'employeeSessions:bulk_edit',
    VIEW_ALL: 'employeeSessions:view_all',
  },

  STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  },

  LIMITS: {
    MAX_NOTES_LENGTH: 2000,
    MAX_SESSION_DURATION_HOURS: 24,
    INACTIVITY_THRESHOLD_MINUTES: 15,
    MAX_ACTIVITY_LOG_ENTRIES: 100,
    MAX_BREAKS_PER_SESSION: 10,
  },

  VALIDATION: {
    MIN_SESSION_DURATION_MINUTES: 1,
    MAX_SESSION_DURATION_MINUTES: 1440, // 24 hours
  },
} as const;
