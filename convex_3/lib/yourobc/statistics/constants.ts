// convex/lib/yourobc/statistics/constants.ts
/**
 * Statistics Constants
 *
 * Constants and configuration values for operating costs and KPI tracking.
 * Defines validation rules, defaults, and business logic constants.
 *
 * @module convex/lib/yourobc/statistics/constants
 */

// ============================================================================
// Cost Categories
// ============================================================================

/**
 * Office cost categories
 */
export const OFFICE_COST_CATEGORIES = [
  'rent',
  'utilities',
  'insurance',
  'maintenance',
  'supplies',
  'technology',
  'other',
] as const

/**
 * Miscellaneous expense categories
 */
export const MISC_EXPENSE_CATEGORIES = [
  'trade_show',
  'marketing',
  'tools',
  'software',
  'travel',
  'entertainment',
  'other',
] as const

/**
 * Cost frequency options
 */
export const COST_FREQUENCIES = [
  'one_time',
  'monthly',
  'quarterly',
  'yearly',
] as const

// ============================================================================
// KPI Target Types
// ============================================================================

/**
 * Target types (employee, team, company)
 */
export const TARGET_TYPES = ['employee', 'team', 'company'] as const

/**
 * KPI cache types
 */
export const KPI_CACHE_TYPES = [
  'employee',
  'customer',
  'company',
  'department',
] as const

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Maximum employee cost entry name length
 */
export const MAX_COST_NAME_LENGTH = 200

/**
 * Maximum description length
 */
export const MAX_DESCRIPTION_LENGTH = 2000

/**
 * Maximum notes length
 */
export const MAX_NOTES_LENGTH = 5000

/**
 * Minimum cost amount (in cents/smallest currency unit)
 */
export const MIN_COST_AMOUNT = 0

/**
 * Maximum cost amount (in cents/smallest currency unit)
 */
export const MAX_COST_AMOUNT = 999999999 // ~10 million in major currency units

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * KPI cache TTL (time-to-live) in milliseconds
 * Default: 24 hours
 */
export const KPI_CACHE_TTL = 24 * 60 * 60 * 1000

/**
 * KPI cache stale threshold in milliseconds
 * Default: 1 hour
 */
export const KPI_CACHE_STALE_THRESHOLD = 60 * 60 * 1000

/**
 * Maximum number of cached KPIs per entity
 */
export const MAX_CACHED_KPIS_PER_ENTITY = 24 // One year of monthly data

// ============================================================================
// Business Logic Constants
// ============================================================================

/**
 * Default currency for cost calculations
 */
export const DEFAULT_CURRENCY = 'EUR' as const

/**
 * Quarters mapping
 */
export const QUARTERS = {
  1: [1, 2, 3], // Q1: Jan-Mar
  2: [4, 5, 6], // Q2: Apr-Jun
  3: [7, 8, 9], // Q3: Jul-Sep
  4: [10, 11, 12], // Q4: Oct-Dec
} as const

/**
 * Quarter names
 */
export const QUARTER_NAMES = {
  1: 'Q1',
  2: 'Q2',
  3: 'Q3',
  4: 'Q4',
} as const

/**
 * Month names
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/**
 * Default KPI target values
 */
export const DEFAULT_KPI_TARGETS = {
  conversionRate: 30, // 30% conversion rate
  averageMarginPercentage: 20, // 20% margin
} as const

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Error messages for statistics operations
 */
export const ERROR_MESSAGES = {
  // Employee Costs
  EMPLOYEE_COST_NOT_FOUND: 'Employee cost entry not found',
  INVALID_EMPLOYEE_COST_DATES: 'End date must be after start date',
  EMPLOYEE_COST_ALREADY_EXISTS: 'An employee cost entry already exists for this period',

  // Office Costs
  OFFICE_COST_NOT_FOUND: 'Office cost entry not found',
  INVALID_OFFICE_COST_DATES: 'End date must be after start date',
  INVALID_COST_FREQUENCY: 'Invalid cost frequency',

  // Miscellaneous Expenses
  MISC_EXPENSE_NOT_FOUND: 'Miscellaneous expense not found',
  EXPENSE_ALREADY_APPROVED: 'Expense has already been approved',
  EXPENSE_NOT_APPROVED: 'Expense must be approved before processing',
  INVALID_APPROVAL: 'Invalid approval data',

  // KPI Targets
  KPI_TARGET_NOT_FOUND: 'KPI target not found',
  INVALID_TARGET_PERIOD: 'Invalid target period (year, month, quarter)',
  TARGET_ALREADY_EXISTS: 'A target already exists for this period',
  INVALID_TARGET_TYPE: 'Invalid target type',

  // KPI Cache
  KPI_CACHE_NOT_FOUND: 'KPI cache entry not found',
  KPI_CACHE_STALE: 'KPI cache is stale and needs recalculation',
  INVALID_CACHE_TYPE: 'Invalid cache type',
  CACHE_CALCULATION_FAILED: 'Failed to calculate KPI cache',

  // General
  UNAUTHORIZED: 'Unauthorized to perform this action',
  INVALID_INPUT: 'Invalid input data',
  OPERATION_FAILED: 'Operation failed',
} as const

// ============================================================================
// Success Messages
// ============================================================================

/**
 * Success messages for statistics operations
 */
export const SUCCESS_MESSAGES = {
  // Employee Costs
  EMPLOYEE_COST_CREATED: 'Employee cost entry created successfully',
  EMPLOYEE_COST_UPDATED: 'Employee cost entry updated successfully',
  EMPLOYEE_COST_DELETED: 'Employee cost entry deleted successfully',

  // Office Costs
  OFFICE_COST_CREATED: 'Office cost entry created successfully',
  OFFICE_COST_UPDATED: 'Office cost entry updated successfully',
  OFFICE_COST_DELETED: 'Office cost entry deleted successfully',

  // Miscellaneous Expenses
  MISC_EXPENSE_CREATED: 'Miscellaneous expense created successfully',
  MISC_EXPENSE_UPDATED: 'Miscellaneous expense updated successfully',
  MISC_EXPENSE_DELETED: 'Miscellaneous expense deleted successfully',
  EXPENSE_APPROVED: 'Expense approved successfully',

  // KPI Targets
  KPI_TARGET_CREATED: 'KPI target created successfully',
  KPI_TARGET_UPDATED: 'KPI target updated successfully',
  KPI_TARGET_DELETED: 'KPI target deleted successfully',

  // KPI Cache
  KPI_CACHE_CREATED: 'KPI cache created successfully',
  KPI_CACHE_UPDATED: 'KPI cache updated successfully',
  KPI_CACHE_REFRESHED: 'KPI cache refreshed successfully',
  KPI_CACHE_DELETED: 'KPI cache deleted successfully',
} as const
