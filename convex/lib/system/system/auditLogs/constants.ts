// convex/lib/system/system/auditLogs/constants.ts
// Business constants, permissions, and limits for auditLogs module

export const AUDIT_LOGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'auditLogs:view',
    VIEW_ALL: 'auditLogs:view_all',
    DELETE: 'auditLogs:delete', // Admin only
  },

  LIMITS: {
    MAX_DESCRIPTION_LENGTH: 2000,
  },
} as const;
