// convex/lib/software/yourobc/employeeKPIs/constants.ts
/**
 * Employee KPIs Constants
 *
 * Constants and configuration values for employee KPIs and targets.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/constants
 */

/**
 * Default KPI values
 */
export const DEFAULT_KPI_VALUES = {
  quotesCreated: 0,
  quotesConverted: 0,
  quotesValue: 0,
  convertedValue: 0,
  ordersProcessed: 0,
  ordersCompleted: 0,
  ordersValue: 0,
  averageOrderValue: 0,
  commissionsEarned: 0,
  commissionsPaid: 0,
  commissionsPending: 0,
  conversionRate: 0,
  averageQuoteValue: 0,
} as const

/**
 * Ranking metrics
 */
export const RANKING_METRICS = [
  'orders',
  'revenue',
  'conversion',
  'commissions',
] as const

/**
 * Target periods
 */
export const TARGET_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const

/**
 * Quarter months mapping
 */
export const QUARTER_MONTHS = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
} as const

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 120, // 120% of target
  GOOD: 100, // 100% of target
  NEEDS_IMPROVEMENT: 80, // 80% of target
} as const

/**
 * Display field for KPIs
 */
export const KPI_DISPLAY_FIELD = 'metricName' as const

/**
 * Display field for targets
 */
export const TARGET_DISPLAY_FIELD = 'period' as const
