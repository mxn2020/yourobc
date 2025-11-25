// convex/lib/yourobc/supporting/comments/constants.ts
// Business constants, permissions, and limits for comments module

export const COMMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'comments:view',
    CREATE: 'comments:create',
    EDIT: 'comments:edit',
    DELETE: 'comments:delete',
    REACT: 'comments:react',
  },

  LIMITS: {
    MIN_CONTENT_LENGTH: 1,
    MAX_CONTENT_LENGTH: 10000,
    MAX_MENTIONS: 50,
    MAX_REACTIONS_PER_TYPE: 1000,
    MAX_ATTACHMENTS: 10,
    MAX_EDIT_HISTORY: 100,
  },

  DEFAULTS: {
    IS_INTERNAL: false,
    REPLY_COUNT: 0,
  },

  COMMON_REACTIONS: ['👍', '❤️', '😂', '🔥', '👀'] as const,
} as const;

export const COMMENTS_VALUES = {
  // Comment types are defined in base validators
} as const;
