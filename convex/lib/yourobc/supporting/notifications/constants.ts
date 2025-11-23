// convex/lib/yourobc/supporting/notifications/constants.ts
// Business constants for notifications module

export const NOTIFICATIONS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'notifications:view',
    CREATE: 'notifications:create',
    DELETE: 'notifications:delete',
    MARK_READ: 'notifications:mark_read',
  },

  DEFAULTS: {
    IS_READ: false,
  },

  // Notification cleanup (keep unread for 30 days, read for 7 days)
  RETENTION: {
    UNREAD_DAYS: 30,
    READ_DAYS: 7,
  },
} as const;

export const NOTIFICATIONS_VALUES = {
  // Notification types and priorities are defined in base validators
} as const;
