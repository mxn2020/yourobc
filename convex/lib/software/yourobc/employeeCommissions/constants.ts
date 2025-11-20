// convex/lib/software/yourobc/employeeCommissions/constants.ts
/**
 * Employee Commissions Constants
 *
 * Defines constants for employee commission operations.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/constants
 */

/**
 * Table names
 */
export const EMPLOYEE_COMMISSIONS_TABLE = 'yourobcEmployeeCommissions' as const
export const EMPLOYEE_COMMISSION_RULES_TABLE = 'yourobcEmployeeCommissionRules' as const

/**
 * Commission statuses
 */
export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const

/**
 * Commission types
 */
export const COMMISSION_TYPE = {
  MARGIN_PERCENTAGE: 'margin_percentage',
  REVENUE_PERCENTAGE: 'revenue_percentage',
  FIXED_AMOUNT: 'fixed_amount',
  TIERED: 'tiered',
} as const

/**
 * Invoice payment statuses
 */
export const INVOICE_PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const

/**
 * Payment methods
 */
export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CASH: 'cash',
  PAYROLL: 'payroll',
  OTHER: 'other',
} as const

/**
 * Service types
 */
export const SERVICE_TYPE = {
  OBC: 'OBC',
  NFO: 'NFO',
} as const

/**
 * Default values
 */
export const DEFAULTS = {
  PRIORITY: 0,
  AUTO_APPROVE: false,
  IS_ACTIVE: true,
  MIN_COMMISSION_AMOUNT: 0,
} as const

/**
 * Display field generators
 */
export const DISPLAY_FIELDS = {
  /**
   * Generate period display field (YYYY-MM)
   */
  period: (date: Date = new Date()): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  },

  /**
   * Generate rule type display field
   */
  ruleType: (type: string, rate?: number, tiers?: unknown[]): string => {
    if (type === COMMISSION_TYPE.TIERED && tiers) {
      return `${type} (${tiers.length} tiers)`
    }
    if (rate !== undefined) {
      return `${type} (${rate}%)`
    }
    return type
  },
} as const

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_RATE: 0,
  MAX_RATE: 100,
  MIN_AMOUNT: 0,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
} as const
