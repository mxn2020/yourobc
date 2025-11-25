// convex/lib/addons/[addon_name]/shared/constants.ts

/**
 * ============================================================================
 * SHARED CONSTANTS TEMPLATE
 * ============================================================================
 *
 * This file contains constants that are shared across all modules within
 * the addon. Use this for common values that multiple entities need.
 *
 * USAGE:
 * 1. Copy to: convex/lib/addons/[addon_name]/shared/constants.ts
 * 2. Replace ADDON with your addon name (e.g., GEENIUS, AI_ACADEMY)
 * 3. Define common constants used across multiple modules
 * 4. Import in individual module constants files
 *
 * WHEN TO USE SHARED CONSTANTS:
 * - Pagination defaults (limit, offset)
 * - Date/time formats
 * - Common error messages
 * - Shared status values
 * - API timeout values
 * - File upload limits
 * - Common regex patterns
 *
 * WHEN NOT TO USE:
 * - Entity-specific constants (use module's constants.ts)
 * - Business logic values (use module's constants.ts)
 * - Module-specific permissions (use module's constants.ts)
 *
 * REQUIRED: All entities must have a main display field (name/title/displayName)
 * for auditLogs and UI display. See schema-patterns.template.md for details.
 *
 * ============================================================================
 */

// ============================================================================
// ADDON METADATA
// ============================================================================

export const ADDON_METADATA = {
  NAME: 'ADDON_NAME',
  VERSION: '1.0.0',
  DESCRIPTION: 'Addon description',
  PREFIX: 'addon', // Used for table names, permissions, etc.
} as const

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Common default values used across all modules
 */
export const SHARED_DEFAULTS = {
  // Pagination
  LIMIT: 20,
  MAX_LIMIT: 100,
  OFFSET: 0,

  // Sorting
  SORT_BY: 'updatedAt' as const,
  SORT_ORDER: 'desc' as const,

  // Status
  STATUS: 'active' as const,
  VISIBILITY: 'private' as const,

  // Versioning
  VERSION: 1,

  // Arrays
  TAGS: [] as string[],
  COLLABORATORS: [] as string[],
} as const

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

/**
 * Pagination and limit constants
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_OFFSET: 0,
} as const

export const LIMITS = {
  // String lengths
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_SHORT_TEXT_LENGTH: 500,
  MIN_NAME_LENGTH: 1,

  // Arrays
  MAX_TAGS: 20,
  MAX_COLLABORATORS: 50,
  MAX_ATTACHMENTS: 10,

  // File uploads
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,

  // Batch operations
  MAX_BATCH_SIZE: 50,
} as const

// ============================================================================
// TIME & DATE
// ============================================================================

/**
 * Time and date constants
 */
export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30, // Approximate
  DAYS_PER_YEAR: 365, // Approximate

  // Common durations in milliseconds
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000, // Approximate
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000, // Approximate
} as const

export const DATE_FORMATS = {
  SHORT_DATE: 'MM/DD/YYYY',
  LONG_DATE: 'MMMM DD, YYYY',
  SHORT_DATETIME: 'MM/DD/YYYY HH:mm',
  LONG_DATETIME: 'MMMM DD, YYYY HH:mm:ss',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ssZ',
} as const

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Common regex patterns for validation
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]+$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
} as const

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  // Generic errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timeout',

  // Authentication/Authorization
  UNAUTHORIZED: 'You are not authorized to perform this action',
  UNAUTHENTICATED: 'You must be logged in to perform this action',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions',

  // Not found
  NOT_FOUND: 'Resource not found',
  ENTITY_NOT_FOUND: 'Entity not found',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',

  // Conflicts
  ALREADY_EXISTS: 'Resource already exists',
  DUPLICATE_ENTRY: 'Duplicate entry',

  // Operations
  OPERATION_FAILED: 'Operation failed',
  CREATE_FAILED: 'Failed to create resource',
  UPDATE_FAILED: 'Failed to update resource',
  DELETE_FAILED: 'Failed to delete resource',

  // Limits
  LIMIT_EXCEEDED: 'Limit exceeded',
  TOO_MANY_ITEMS: 'Too many items',
  FILE_TOO_LARGE: 'File size exceeds limit',
} as const

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  ARCHIVED: 'Archived successfully',
  RESTORED: 'Restored successfully',
  PUBLISHED: 'Published successfully',
  SAVED: 'Saved successfully',
} as const

// ============================================================================
// STATUS VALUES
// ============================================================================

/**
 * Common status values used across entities
 */
export const COMMON_STATUS = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  ARCHIVED: 'archived' as const,
  DELETED: 'deleted' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
} as const

// ============================================================================
// VISIBILITY VALUES
// ============================================================================

/**
 * Common visibility values
 */
export const VISIBILITY = {
  PUBLIC: 'public' as const,
  PRIVATE: 'private' as const,
  SHARED: 'shared' as const,
  ORGANIZATION: 'organization' as const,
  RESTRICTED: 'restricted' as const,
} as const

// ============================================================================
// PRIORITY VALUES
// ============================================================================

/**
 * Common priority values
 */
export const PRIORITY = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
  URGENT: 'urgent' as const,
} as const

// ============================================================================
// FILE TYPES
// ============================================================================

/**
 * Allowed file types and MIME types
 */
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  VIDEOS: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const

export const FILE_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt'],
  SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
  VIDEOS: ['.mp4', '.mpeg', '.mov', '.webm'],
  AUDIO: ['.mp3', '.wav', '.ogg'],
} as const

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

/**
 * Common HTTP status codes (if using REST APIs)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================================================
// CUSTOM ADDON CONSTANTS
// ============================================================================

/**
 * Add your addon-specific shared constants here
 *
 * Examples:
 * - Feature flags
 * - API endpoints
 * - Configuration values
 * - Theme values
 * - Currency codes
 * - Country codes
 */

// Example: Feature flags
// export const FEATURES = {
//   ENABLE_NOTIFICATIONS: true,
//   ENABLE_REAL_TIME_UPDATES: true,
//   ENABLE_EXPORT: false,
// } as const

// Example: API configuration
// export const API = {
//   BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
//   TIMEOUT_MS: 10000,
//   MAX_RETRIES: 3,
// } as const

// Example: Theme colors
// export const THEME_COLORS = {
//   PRIMARY: '#3b82f6',
//   SECONDARY: '#8b5cf6',
//   SUCCESS: '#10b981',
//   WARNING: '#f59e0b',
//   ERROR: '#ef4444',
//   INFO: '#0ea5e9',
// } as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Export types derived from constants
 */
export type CommonStatus = (typeof COMMON_STATUS)[keyof typeof COMMON_STATUS]
export type Visibility = (typeof VISIBILITY)[keyof typeof VISIBILITY]
export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY]
export type SortOrder = 'asc' | 'desc'
