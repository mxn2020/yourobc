// convex/lib/system/supporting/documents/constants.ts

/**
 * Documents Module Constants
 * Defines permissions, limits, and default values for the documents module
 */
export const DOCUMENT_CONSTANTS = {
  /**
   * Document types
   */
  TYPE: {
    CONTRACT: 'contract',
    INVOICE: 'invoice',
    REPORT: 'report',
    SPECIFICATION: 'specification',
    PRESENTATION: 'presentation',
    IMAGE: 'image',
    SPREADSHEET: 'spreadsheet',
    OTHER: 'other',
  },

  /**
   * Document processing status
   */
  STATUS: {
    READY: 'ready',
    PROCESSING: 'processing',
    ERROR: 'error',
  },

  /**
   * Entity types that can have documents (must match entityTypes.documentable)
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
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILENAME_LENGTH: 255,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  /**
   * Permission strings for authorization
   */
  PERMISSIONS: {
    VIEW: 'documents.view',
    UPLOAD: 'documents.upload',
    EDIT: 'documents.edit',
    DELETE: 'documents.delete',
    VIEW_CONFIDENTIAL: 'documents.view_confidential',
  },

  /**
   * Default values
   */
  DEFAULT_VALUES: {
    IS_PUBLIC: false,
    IS_CONFIDENTIAL: false,
    STATUS: 'ready' as const,
  },
} as const
