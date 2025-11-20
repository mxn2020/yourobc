/**
 * YourOBC Employee Vacations Constants
 *
 * Business constants for vacation management.
 *
 * @module convex/lib/yourobc/employees/vacations/constants
 */

/**
 * Vacation-related business constants
 */
export const VACATION_CONSTANTS = {
  /**
   * Default vacation values
   */
  DEFAULT_VALUES: {
    ANNUAL_ENTITLEMENT: 25, // Standard 25 days per year
    MAX_CARRYOVER_DAYS: 5, // Maximum days that can be carried over
  },

  /**
   * Vacation limits
   */
  LIMITS: {
    MAX_VACATION_DAYS_PER_REQUEST: 50,
    MIN_VACATION_DAYS: 0,
    MAX_ADVANCE_BOOKING_DAYS: 365, // Can book up to 1 year in advance
    MIN_NOTICE_DAYS: 7, // Minimum days notice for vacation requests
  },

  /**
   * Permission constants
   */
  PERMISSIONS: {
    VIEW: 'vacations.view',
    CREATE: 'vacations.create',
    EDIT: 'vacations.edit',
    DELETE: 'vacations.delete',
    APPROVE: 'vacations.approve',
    VIEW_TEAM: 'vacations.view_team',
  },
} as const;

/**
 * Vacation status colors for UI
 */
export const VACATION_STATUS_COLORS = {
  pending: '#f59e0b', // amber
  approved: '#10b981', // green
  rejected: '#ef4444', // red
  cancelled: '#6b7280', // gray
} as const;

/**
 * Vacation type labels
 */
export const VACATION_TYPE_LABELS = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  unpaid: 'Unpaid Leave',
  parental: 'Parental Leave',
  bereavement: 'Bereavement Leave',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
  other: 'Other',
} as const;

/**
 * Vacation status labels
 */
export const VACATION_STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
} as const;
