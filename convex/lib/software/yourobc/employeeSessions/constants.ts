// convex/lib/software/yourobc/employeeSessions/constants.ts
/**
 * Employee Sessions Constants
 *
 * Defines constants used throughout the employee sessions module.
 * Includes default values, configuration options, and common settings
 * for both sessions and work hours summary.
 *
 * @module convex/lib/software/yourobc/employeeSessions/constants
 */

// ============================================================================
// Public ID Prefixes
// ============================================================================

/**
 * Prefix for employee session public IDs
 * Format: session_[random_string]
 */
export const SESSION_PUBLIC_ID_PREFIX = 'session_' as const

/**
 * Prefix for work hours summary public IDs
 * Format: workhours_[random_string]
 */
export const WORK_HOURS_PUBLIC_ID_PREFIX = 'workhours_' as const

// ============================================================================
// Display Fields
// ============================================================================

/**
 * Main display field for sessions
 * Used in UI listings and references
 */
export const SESSION_DISPLAY_FIELD = 'loginTime' as const

/**
 * Main display field for work hours summary
 * Represents the period (year/month/day combination)
 */
export const WORK_HOURS_DISPLAY_FIELD = 'period' as const

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for new sessions
 */
export const SESSION_DEFAULTS = {
  sessionType: 'manual' as const,
  isActive: true,
  breaks: [],
  tags: [],
} as const

/**
 * Default expected work hours per day
 */
export const DEFAULT_EXPECTED_HOURS_PER_DAY = 8 as const

/**
 * Default expected work hours per month (assuming 22 working days)
 */
export const DEFAULT_EXPECTED_HOURS_PER_MONTH = 176 as const

// ============================================================================
// Activity Tracking
// ============================================================================

/**
 * Inactivity threshold in milliseconds (15 minutes)
 * After this time, a session is marked as inactive
 */
export const INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000

/**
 * Auto-logout threshold in milliseconds (2 hours)
 * After this time of inactivity, session is automatically logged out
 */
export const AUTO_LOGOUT_THRESHOLD_MS = 2 * 60 * 60 * 1000

// ============================================================================
// Break Types
// ============================================================================

/**
 * Common break durations in minutes
 */
export const COMMON_BREAK_DURATIONS = {
  coffee: 15,
  lunch: 60,
  personal: 30,
  meeting: 60,
} as const

/**
 * Maximum break duration in minutes (4 hours)
 */
export const MAX_BREAK_DURATION_MINUTES = 240

// ============================================================================
// Session Validation
// ============================================================================

/**
 * Maximum session duration in milliseconds (24 hours)
 */
export const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000

/**
 * Minimum session duration in milliseconds (1 minute)
 */
export const MIN_SESSION_DURATION_MS = 60 * 1000

// ============================================================================
// Work Hours Calculation
// ============================================================================

/**
 * Conversion factor from minutes to hours
 */
export const MINUTES_TO_HOURS = 60

/**
 * Maximum overtime hours per day before warning
 */
export const MAX_OVERTIME_HOURS_PER_DAY = 4

/**
 * Maximum work hours per day before alert
 */
export const MAX_WORK_HOURS_PER_DAY = 12

// ============================================================================
// Query Limits
// ============================================================================

/**
 * Default pagination limit for session queries
 */
export const DEFAULT_QUERY_LIMIT = 50

/**
 * Maximum pagination limit for session queries
 */
export const MAX_QUERY_LIMIT = 100

// ============================================================================
// Permissions
// ============================================================================

/**
 * Session permission levels
 */
export const SESSION_PERMISSIONS = {
  OWNER: 'owner',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const

// ============================================================================
// Time Periods
// ============================================================================

/**
 * Time period types for work hours aggregation
 */
export const TIME_PERIOD_TYPES = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
} as const

/**
 * Days per month for work hours calculation (average)
 */
export const AVG_WORKING_DAYS_PER_MONTH = 22
