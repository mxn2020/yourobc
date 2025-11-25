// convex/lib/system/supporting/comments/constants.ts
// Business constants and permissions for system comments module

export const SYSTEM_COMMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:comments:view',
    CREATE: 'system:comments:create',
    EDIT: 'system:comments:edit',
    DELETE: 'system:comments:delete',
    REACT: 'system:comments:react',
  },

  LIMITS: {
    MIN_CONTENT_LENGTH: 1,
    MAX_CONTENT_LENGTH: 10000,
    MAX_MENTIONS: 50,
    MAX_ATTACHMENTS: 10,
    MAX_REACTIONS_PER_TYPE: 1000,
    MAX_EDIT_HISTORY: 100,
  },

  DEFAULTS: {
    IS_INTERNAL: false,
    REPLY_COUNT: 0,
  },
} as const;

export const SYSTEM_COMMENTS_VALUES = {
  // Comment types are defined in schema validators
} as const;
