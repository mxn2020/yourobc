// convex/lib/system/system/notifications/constants.ts
// Business constants, permissions, and limits for notifications module

export const NOTIFICATIONS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'notifications:view',
    CREATE: 'notifications:create',
    EDIT: 'notifications:edit',
    DELETE: 'notifications:delete',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MIN_TITLE_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  VALIDATION: {
    TITLE_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  },
} as const;
