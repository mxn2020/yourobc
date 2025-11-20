// convex/lib/software/yourobc/accounting/constants.ts
/**
 * Accounting Constants
 *
 * Constant values and configuration for the accounting module.
 *
 * @module convex/lib/software/yourobc/accounting/constants
 */

/**
 * Default invoice numbering format
 */
export const DEFAULT_INVOICE_FORMAT = 'YYMM####'

/**
 * Default invoice number increment (13 as per spec)
 */
export const DEFAULT_INCREMENT = 13

/**
 * Dashboard cache validity period (24 hours in milliseconds)
 */
export const CACHE_VALIDITY_HOURS = 24
export const CACHE_VALIDITY_MS = CACHE_VALIDITY_HOURS * 60 * 60 * 1000

/**
 * Overdue aging buckets (in days)
 */
export const AGING_BUCKETS = {
  BUCKET_1: { min: 1, max: 30 },
  BUCKET_2: { min: 31, max: 60 },
  BUCKET_3: { min: 61, max: 90 },
  BUCKET_4: { min: 91, max: Infinity },
} as const

/**
 * Cash flow forecast period (30 days)
 */
export const CASH_FLOW_FORECAST_DAYS = 30

/**
 * Dunning levels
 */
export const DUNNING_LEVELS = {
  LEVEL_1: 1, // First reminder
  LEVEL_2: 2, // Second reminder
  LEVEL_3: 3, // Final notice
} as const

/**
 * Invoice auto-generation notification retry attempts
 */
export const MAX_NOTIFICATION_RETRIES = 3

/**
 * Missing invoice reminder intervals (in days)
 */
export const REMINDER_INTERVALS = [7, 14, 21, 30] as const

/**
 * Statement export formats
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
} as const

/**
 * Public ID prefixes for accounting entities
 */
export const PUBLIC_ID_PREFIXES = {
  INCOMING_INVOICE_TRACKING: 'IIT',
  INVOICE_NUMBERING: 'INN',
  STATEMENT_OF_ACCOUNTS: 'SOA',
  ACCOUNTING_DASHBOARD_CACHE: 'ADC',
  INVOICE_AUTO_GEN_LOG: 'IAGL',
} as const

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'EUR' as const

/**
 * Zero currency amount
 */
export const ZERO_AMOUNT = {
  amount: 0,
  currency: DEFAULT_CURRENCY,
} as const
