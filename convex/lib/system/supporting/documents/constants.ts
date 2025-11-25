// convex/lib/system/supporting/documents/constants.ts
// Business constants for system documents module

export const SYSTEM_DOCUMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:documents:view',
    CREATE: 'system:documents:create',
    EDIT: 'system:documents:edit',
    DELETE: 'system:documents:delete',
    SHARE: 'system:documents:share',
  },

  LIMITS: {
    MIN_FILENAME_LENGTH: 1,
    MAX_FILENAME_LENGTH: 255,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MIN_FILE_SIZE: 0,
    MAX_NAME_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAGS: 50,
  },

  DEFAULTS: {
    STATUS: 'draft' as const,
  },
} as const;

export const SYSTEM_DOCUMENTS_VALUES = {
  // Document types and statuses are defined in schema validators
} as const;
