// convex/lib/software/yourobc/customerMargins/constants.ts
/**
 * Customer Margins Module Constants
 *
 * Business constants and default values for the customer margins module.
 * Includes defaults for margin calculations, dunning processes, and analytics.
 *
 * @module convex/lib/software/yourobc/customerMargins/constants
 */

// ============================================================================
// Margin Calculation Constants
// ============================================================================

/**
 * Default margin percentages
 */
export const DEFAULT_MARGIN_PERCENTAGE = 15 // 15%
export const DEFAULT_MINIMUM_MARGIN_EUR = 50 // 50 EUR

/**
 * Service-specific default margins
 */
export const SERVICE_MARGIN_DEFAULTS = {
  standard: {
    percentage: 12,
    minimumEUR: 30,
  },
  express: {
    percentage: 18,
    minimumEUR: 60,
  },
  overnight: {
    percentage: 22,
    minimumEUR: 80,
  },
  international: {
    percentage: 20,
    minimumEUR: 100,
  },
  freight: {
    percentage: 10,
    minimumEUR: 150,
  },
} as const

/**
 * Margin calculation methods
 */
export const MARGIN_CALCULATION_METHODS = {
  DUAL_SYSTEM: 'dual_system', // Higher of percentage or minimum
  PERCENTAGE_ONLY: 'percentage_only',
  MINIMUM_ONLY: 'minimum_only',
  CUSTOM: 'custom',
} as const

/**
 * Review schedule defaults (in days)
 */
export const MARGIN_REVIEW_SCHEDULE = {
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  ANNUAL: 365,
} as const

// ============================================================================
// Contact Log Constants
// ============================================================================

/**
 * Follow-up time defaults (in days)
 */
export const FOLLOW_UP_DEFAULTS = {
  URGENT: 1,
  HIGH_PRIORITY: 3,
  NORMAL: 7,
  LOW_PRIORITY: 14,
} as const

/**
 * Contact frequency alert threshold (days)
 */
export const CONTACT_ALERT_THRESHOLD_DAYS = 35

/**
 * Contact duration categories (in minutes)
 */
export const CONTACT_DURATION = {
  BRIEF: 15,
  STANDARD: 30,
  EXTENDED: 60,
  DETAILED: 120,
} as const

// ============================================================================
// Dunning Configuration Constants
// ============================================================================

/**
 * Default dunning level thresholds (days overdue)
 */
export const DUNNING_DEFAULTS = {
  LEVEL_1_DAYS: 7,
  LEVEL_2_DAYS: 14,
  LEVEL_3_DAYS: 21,
} as const

/**
 * Default dunning fees (EUR)
 */
export const DUNNING_FEES = {
  LEVEL_1: 5,
  LEVEL_2: 15,
  LEVEL_3: 30,
} as const

/**
 * Default payment terms (days)
 */
export const DEFAULT_PAYMENT_TERMS_DAYS = 30

/**
 * Service suspension grace period (days)
 */
export const SUSPENSION_GRACE_PERIOD_DAYS = 7

/**
 * Dunning process settings
 */
export const DUNNING_SETTINGS = {
  AUTO_SEND_LEVEL_1: true,
  AUTO_SEND_LEVEL_2: true,
  AUTO_SEND_LEVEL_3: false, // Manual review before final warning
  AUTO_SUSPEND_LEVEL_3: false, // Require manual approval
  AUTO_REACTIVATE_ON_PAYMENT: true,
} as const

// ============================================================================
// Customer Analytics Constants
// ============================================================================

/**
 * Analytics calculation frequency
 */
export const ANALYTICS_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

/**
 * Payment behavior thresholds
 */
export const PAYMENT_THRESHOLDS = {
  EXCELLENT_PAYMENT_DAYS: 10, // Paid within 10 days
  GOOD_PAYMENT_DAYS: 20,
  ACCEPTABLE_PAYMENT_DAYS: 30,
  LATE_PAYMENT_DAYS: 45,
  CRITICAL_PAYMENT_DAYS: 60,
} as const

/**
 * Payment rate categories (percentage)
 */
export const ON_TIME_PAYMENT_RATES = {
  EXCELLENT: 95, // 95%+ on-time
  GOOD: 80,
  ACCEPTABLE: 60,
  POOR: 40,
} as const

/**
 * Customer risk levels based on payment behavior
 */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

/**
 * Issue resolution rate thresholds (percentage)
 */
export const RESOLUTION_RATE_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  ACCEPTABLE: 70,
  POOR: 50,
} as const

// ============================================================================
// Query Pagination Constants
// ============================================================================

/**
 * Default page sizes for queries
 */
export const PAGE_SIZES = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 50,
  EXTRA_LARGE: 100,
} as const

/**
 * Maximum results per query
 */
export const MAX_QUERY_RESULTS = 1000

// ============================================================================
// Time Constants
// ============================================================================

/**
 * Time periods in milliseconds
 */
export const TIME_PERIODS = {
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000,
} as const

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
  MARGIN_NOT_FOUND: 'Customer margin configuration not found',
  CONTACT_NOT_FOUND: 'Contact log entry not found',
  ANALYTICS_NOT_FOUND: 'Customer analytics not found',
  DUNNING_CONFIG_NOT_FOUND: 'Dunning configuration not found',
  INVALID_MARGIN_PERCENTAGE: 'Margin percentage must be between 0 and 100',
  INVALID_MINIMUM_MARGIN: 'Minimum margin must be a positive number',
  INVALID_CUSTOMER_ID: 'Valid customer ID is required',
  SERVICE_SUSPENDED: 'Service is suspended due to payment issues',
  PREPAYMENT_REQUIRED: 'Prepayment is required for this customer',
  UNAUTHORIZED: 'You do not have permission to perform this action',
} as const

// ============================================================================
// Success Messages
// ============================================================================

/**
 * Standard success messages
 */
export const SUCCESS_MESSAGES = {
  MARGIN_CREATED: 'Customer margin configuration created successfully',
  MARGIN_UPDATED: 'Customer margin configuration updated successfully',
  MARGIN_DELETED: 'Customer margin configuration deleted successfully',
  CONTACT_CREATED: 'Contact log entry created successfully',
  CONTACT_UPDATED: 'Contact log entry updated successfully',
  CONTACT_DELETED: 'Contact log entry deleted successfully',
  ANALYTICS_CALCULATED: 'Customer analytics calculated successfully',
  DUNNING_CONFIG_CREATED: 'Dunning configuration created successfully',
  DUNNING_CONFIG_UPDATED: 'Dunning configuration updated successfully',
  SERVICE_SUSPENDED: 'Customer service suspended successfully',
  SERVICE_REACTIVATED: 'Customer service reactivated successfully',
} as const

// ============================================================================
// Export All Constants
// ============================================================================

export default {
  DEFAULT_MARGIN_PERCENTAGE,
  DEFAULT_MINIMUM_MARGIN_EUR,
  SERVICE_MARGIN_DEFAULTS,
  MARGIN_CALCULATION_METHODS,
  MARGIN_REVIEW_SCHEDULE,
  FOLLOW_UP_DEFAULTS,
  CONTACT_ALERT_THRESHOLD_DAYS,
  CONTACT_DURATION,
  DUNNING_DEFAULTS,
  DUNNING_FEES,
  DEFAULT_PAYMENT_TERMS_DAYS,
  SUSPENSION_GRACE_PERIOD_DAYS,
  DUNNING_SETTINGS,
  ANALYTICS_FREQUENCY,
  PAYMENT_THRESHOLDS,
  ON_TIME_PAYMENT_RATES,
  RISK_LEVELS,
  RESOLUTION_RATE_THRESHOLDS,
  PAGE_SIZES,
  MAX_QUERY_RESULTS,
  TIME_PERIODS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
}
