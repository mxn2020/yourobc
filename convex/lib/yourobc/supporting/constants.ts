// convex/lib/yourobc/supporting/constants.ts
/**
 * Supporting Module Constants
 *
 * Defines constants for supporting entities including defaults,
 * limits, and configuration values.
 *
 * @module convex/lib/yourobc/supporting/constants
 */

// ============================================================================
// Exchange Rates Constants
// ============================================================================

export const EXCHANGE_RATE_DEFAULTS = {
  RATE: 1.0,
  SOURCE: 'manual',
  IS_ACTIVE: true,
} as const

export const EXCHANGE_RATE_LIMITS = {
  MAX_RATE: 1000000,
  MIN_RATE: 0.000001,
} as const

// ============================================================================
// Inquiry Sources Constants
// ============================================================================

export const INQUIRY_SOURCE_DEFAULTS = {
  IS_ACTIVE: true,
} as const

// ============================================================================
// Wiki Entries Constants
// ============================================================================

export const WIKI_DEFAULTS = {
  IS_PUBLIC: false,
  STATUS: 'draft' as const,
  VIEW_COUNT: 0,
  TAGS: [],
} as const

export const WIKI_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_SLUG_LENGTH: 250,
  MAX_CONTENT_LENGTH: 100000,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 50,
} as const

// ============================================================================
// Comments Constants
// ============================================================================

export const COMMENT_DEFAULTS = {
  IS_INTERNAL: false,
  IS_EDITED: false,
  REPLY_COUNT: 0,
} as const

export const COMMENT_LIMITS = {
  MAX_CONTENT_LENGTH: 10000,
  MAX_MENTIONS: 50,
  MAX_REACTIONS: 1000,
  MAX_ATTACHMENTS: 10,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_EDIT_HISTORY: 50,
} as const

// ============================================================================
// Followup Reminders Constants
// ============================================================================

export const REMINDER_DEFAULTS = {
  STATUS: 'pending' as const,
  PRIORITY: 'medium' as const,
  EMAIL_REMINDER: true,
  IS_RECURRING: false,
} as const

export const REMINDER_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_COMPLETION_NOTES_LENGTH: 2000,
  MAX_SNOOZE_REASON_LENGTH: 500,
  MAX_RECURRENCE_INTERVAL: 365, // days
  MAX_OCCURRENCES: 1000,
} as const

// ============================================================================
// Documents Constants
// ============================================================================

export const DOCUMENT_DEFAULTS = {
  IS_PUBLIC: false,
  IS_CONFIDENTIAL: false,
  STATUS: 'active' as const,
} as const

export const DOCUMENT_LIMITS = {
  MAX_FILENAME_LENGTH: 255,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const

export const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Text
  'text/plain',
  'text/csv',
  'text/html',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
] as const

// ============================================================================
// Notifications Constants
// ============================================================================

export const NOTIFICATION_DEFAULTS = {
  IS_READ: false,
  PRIORITY: 'normal' as const,
} as const

export const NOTIFICATION_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_ACTION_URL_LENGTH: 500,
  RETENTION_DAYS: 90, // Auto-delete after 90 days
} as const

// ============================================================================
// Counters Constants
// ============================================================================

export const COUNTER_DEFAULTS = {
  LAST_NUMBER: 0,
} as const

export const COUNTER_PREFIXES = {
  QUOTE: 'QT',
  SHIPMENT: 'SH',
  INVOICE: 'INV',
  CREDIT_NOTE: 'CN',
  BOOKING: 'BK',
  CONTAINER: 'CTR',
  WIKI: 'WIKI',
} as const

export const COUNTER_LIMITS = {
  MAX_PREFIX_LENGTH: 10,
  MAX_NUMBER: 999999,
} as const

// ============================================================================
// Common Constants
// ============================================================================

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 500,
} as const

export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  DEFAULT_RESULTS: 20,
} as const
