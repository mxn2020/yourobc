// convex/lib/system/supporting/notifications/constants.ts
// Business constants for system notifications module

export const SYSTEM_NOTIFICATIONS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:notifications:view',
    CREATE: 'system:notifications:create',
    DELETE: 'system:notifications:delete',
    MARK_READ: 'system:notifications:mark_read',
  },

  DEFAULTS: {
    IS_READ: false,
  },

  RETENTION: {
    UNREAD_DAYS: 30,
    READ_DAYS: 7,
  },
} as const;

export const SYSTEM_NOTIFICATIONS_VALUES = {
  // Types and priorities defined in schema validators
} as const;
