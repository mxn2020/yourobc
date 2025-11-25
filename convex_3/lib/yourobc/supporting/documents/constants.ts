// convex/lib/yourobc/supporting/documents/constants.ts
// Business constants, permissions, and limits for documents module

export const DOCUMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'documents:view',
    CREATE: 'documents:create',
    EDIT: 'documents:edit',
    DELETE: 'documents:delete',
  },

  LIMITS: {
    MIN_FILENAME_LENGTH: 1,
    MAX_FILENAME_LENGTH: 255,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MIN_FILE_SIZE: 0,
    MAX_TITLE_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 5000,
  },

  DEFAULTS: {
    IS_PUBLIC: false,
    IS_CONFIDENTIAL: false,
  },
} as const;

export const DOCUMENTS_VALUES = {
  // Document types and statuses are defined in base validators
} as const;
