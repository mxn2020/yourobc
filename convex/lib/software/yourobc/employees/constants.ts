// convex/lib/software/yourobc/employees/constants.ts
/**
 * Employees Entity Constants
 *
 * Defines constants for employee and vacation management including
 * default values, limits, and configuration settings.
 *
 * @module convex/lib/software/yourobc/employees/constants
 */

// ============================================================================
// Employee Constants
// ============================================================================

/**
 * Default values for new employees
 */
export const EMPLOYEE_DEFAULTS = {
  TYPE: 'office' as const,
  IS_ACTIVE: true,
  IS_ONLINE: false,
  TIME_ENTRIES: [],
  TIMEZONE: 'UTC',
} as const

/**
 * Employee status values
 */
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
} as const

/**
 * Work status values
 */
export const WORK_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
} as const

/**
 * Maximum number of recent vacations to store
 */
export const MAX_RECENT_VACATIONS = 5

/**
 * Auto-offline timeout in milliseconds (15 minutes)
 */
export const AUTO_OFFLINE_TIMEOUT = 15 * 60 * 1000

// ============================================================================
// Vacation Constants
// ============================================================================

/**
 * Vacation type values
 */
export const VACATION_TYPE = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  EMERGENCY: 'emergency',
  UNPAID: 'unpaid',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
} as const

/**
 * Vacation status workflow
 */
export const VACATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const

/**
 * Default vacation entitlements
 */
export const VACATION_DEFAULTS = {
  ANNUAL_ENTITLEMENT: 20,
  CARRYOVER_DAYS: 0,
  USED: 0,
  PENDING: 0,
} as const

/**
 * Vacation calculation settings
 */
export const VACATION_SETTINGS = {
  MAX_CARRYOVER_DAYS: 5,
  MIN_NOTICE_DAYS: 7,
  MAX_CONSECUTIVE_DAYS: 30,
} as const

// ============================================================================
// Display Constants
// ============================================================================

/**
 * Main display field for employees
 */
export const EMPLOYEE_DISPLAY_FIELD = 'name' as const

/**
 * Main display field for vacation days (formatted date ranges)
 */
export const VACATION_DAYS_DISPLAY_FIELD = 'dates' as const

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
} as const
