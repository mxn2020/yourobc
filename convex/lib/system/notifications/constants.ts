// convex/lib/boilerplate/notifications/constants.ts

export const NOTIFICATION_CONSTANTS = {
  // Permissions
  PERMISSIONS: {
    VIEW: 'notifications:view',
    CREATE: 'notifications:create',
    DELETE: 'notifications:delete',
    CLEANUP: 'notifications:cleanup',
  },

  TYPES: {
    ASSIGNMENT: 'assignment',
    COMPLETION: 'completion',
    INVITE: 'invite',
    ACHIEVEMENT: 'achievement',
    REMINDER: 'reminder',
    MENTION: 'mention',
  },

  ENTITY_TYPES: {
    USER: 'user',
    REMINDER: 'reminder',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 100,
    MAX_MESSAGE_LENGTH: 500,
    MAX_EMOJI_LENGTH: 10,
    MAX_URL_LENGTH: 500,
    MAX_NOTIFICATIONS_PER_QUERY: 100,
    CLEANUP_AFTER_DAYS: 30,
  },

  DEFAULT_EMOJIS: {
    assignment: '📋',
    completion: '✅',
    invite: '📧',
    achievement: '🏆',
    reminder: '⏰',
    mention: '💬',
  },
} as const;

