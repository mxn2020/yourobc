// convex/lib/system/supporting/comments/constants.ts

/**
 * Comments Module Constants
 * Defines permissions, limits, and default values for the comments module
 */
export const COMMENT_CONSTANTS = {
  /**
   * Comment types
   */
  TYPE: {
    NOTE: 'note',
    STATUS_UPDATE: 'status_update',
    QUESTION: 'question',
    ANSWER: 'answer',
    INTERNAL: 'internal',
  },

  /**
   * Entity types that can have comments (must match entityTypes.commentable)
   */
  ENTITY_TYPE: {
    PROJECT: 'system_project',
    TASK: 'system_task',
    USER: 'system_user',
  },

  /**
   * Validation limits
   */
  LIMITS: {
    MAX_CONTENT_LENGTH: 5000,
    MAX_MENTIONS: 20,
    MAX_ATTACHMENTS: 10,
    MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  },

  /**
   * Permission strings for authorization
   */
  PERMISSIONS: {
    VIEW: 'comments.view',
    CREATE: 'comments.create',
    EDIT: 'comments.edit',
    DELETE: 'comments.delete',
  },

  /**
   * Default values
   */
  DEFAULT_VALUES: {
    IS_INTERNAL: false,
    REPLY_COUNT: 0,
  },
} as const
