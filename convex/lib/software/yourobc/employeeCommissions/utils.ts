// convex/lib/software/yourobc/employeeCommissions/utils.ts
/**
 * Employee Commissions Utilities
 *
 * Utility functions for commission calculations and operations.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/utils
 */

import { v } from 'convex/values'
import {
  COMMISSION_TYPE,
  DISPLAY_FIELDS,
  VALIDATION,
  DEFAULTS,
} from './constants'
import type {
  CommissionTier,
  AppliedTier,
  CommissionCalculationContext,
  CommissionCalculationResult,
  RuleMatchResult,
} from './types'

/**
 * Generate a public ID for a commission
 */
export function generateCommissionPublicId(): string {
  const prefix = 'COMM'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate a public ID for a commission rule
 */
export function generateRulePublicId(): string {
  const prefix = 'RULE'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Calculate commission based on rule type
 */
export function calculateCommission(
  context: CommissionCalculationContext,
  rule: RuleMatchResult
): CommissionCalculationResult {
  const { revenue, margin, marginPercentage, currency } = context
  const { type, rate, tiers, ruleId, ruleName, autoApprove } = rule

  let commissionAmount = 0
  let commissionRate = 0
  let baseAmount = 0
  let appliedTier: AppliedTier | undefined

  switch (type) {
    case COMMISSION_TYPE.MARGIN_PERCENTAGE:
      baseAmount = margin
      commissionRate = rate || 0
      commissionAmount = (margin * commissionRate) / 100
      break

    case COMMISSION_TYPE.REVENUE_PERCENTAGE:
      baseAmount = revenue
      commissionRate = rate || 0
      commissionAmount = (revenue * commissionRate) / 100
      break

    case COMMISSION_TYPE.FIXED_AMOUNT:
      baseAmount = revenue
      commissionRate = rate || 0
      commissionAmount = rate || 0
      break

    case COMMISSION_TYPE.TIERED:
      baseAmount = revenue
      if (tiers && tiers.length > 0) {
        const matchedTier = findMatchingTier(revenue, tiers)
        if (matchedTier) {
          commissionRate = matchedTier.rate
          commissionAmount = (revenue * matchedTier.rate) / 100
          appliedTier = matchedTier
        }
      }
      break

    default:
      throw new Error(`Unknown commission type: ${type}`)
  }

  return {
    type,
    ruleId,
    ruleName,
    baseAmount,
    margin,
    marginPercentage,
    commissionRate,
    commissionAmount: Math.max(0, commissionAmount), // Ensure non-negative
    appliedTier,
    calculatedAt: Date.now(),
  }
}

/**
 * Find the matching tier for a given amount
 */
export function findMatchingTier(
  amount: number,
  tiers: CommissionTier[]
): CommissionTier | undefined {
  // Sort tiers by minAmount ascending
  const sortedTiers = [...tiers].sort((a, b) => a.minAmount - b.minAmount)

  // Find the highest tier where amount >= minAmount and (maxAmount is undefined or amount <= maxAmount)
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    const tier = sortedTiers[i]
    if (
      amount >= tier.minAmount &&
      (tier.maxAmount === undefined || amount <= tier.maxAmount)
    ) {
      return tier
    }
  }

  return undefined
}

/**
 * Check if a rule matches the commission context
 */
export function doesRuleMatch(
  context: CommissionCalculationContext,
  rule: {
    type: string
    isActive: boolean
    effectiveFrom: number
    effectiveTo?: number
    serviceTypes?: string[]
    applicableCategories?: string[]
    applicableProducts?: string[]
    minMarginPercentage?: number
    minOrderValue?: number
    minCommissionAmount?: number
  }
): boolean {
  const now = Date.now()

  // Check if rule is active
  if (!rule.isActive) return false

  // Check effective dates
  if (rule.effectiveFrom > now) return false
  if (rule.effectiveTo && rule.effectiveTo < now) return false

  // Check service type filter
  if (
    rule.serviceTypes &&
    rule.serviceTypes.length > 0 &&
    context.serviceType
  ) {
    if (!rule.serviceTypes.includes(context.serviceType)) return false
  }

  // Check category filter
  if (
    rule.applicableCategories &&
    rule.applicableCategories.length > 0 &&
    context.category
  ) {
    if (!rule.applicableCategories.includes(context.category)) return false
  }

  // Check product filter
  if (
    rule.applicableProducts &&
    rule.applicableProducts.length > 0 &&
    context.productId
  ) {
    if (!rule.applicableProducts.includes(context.productId)) return false
  }

  // Check minimum margin percentage
  if (
    rule.minMarginPercentage !== undefined &&
    context.marginPercentage < rule.minMarginPercentage
  ) {
    return false
  }

  // Check minimum order value
  if (rule.minOrderValue !== undefined && context.revenue < rule.minOrderValue) {
    return false
  }

  return true
}

/**
 * Generate period display string from date
 */
export function formatPeriod(date: Date = new Date()): string {
  return DISPLAY_FIELDS.period(date)
}

/**
 * Generate rule type display string
 */
export function formatRuleType(
  type: string,
  rate?: number,
  tiers?: CommissionTier[]
): string {
  return DISPLAY_FIELDS.ruleType(type, rate, tiers)
}

/**
 * Validate commission rate
 */
export function validateCommissionRate(rate: number, type: string): boolean {
  if (type === COMMISSION_TYPE.FIXED_AMOUNT) {
    return rate >= VALIDATION.MIN_AMOUNT
  }
  return rate >= VALIDATION.MIN_RATE && rate <= VALIDATION.MAX_RATE
}

/**
 * Validate commission tier
 */
export function validateCommissionTier(tier: CommissionTier): boolean {
  if (tier.minAmount < 0) return false
  if (tier.maxAmount !== undefined && tier.maxAmount <= tier.minAmount)
    return false
  if (tier.rate < VALIDATION.MIN_RATE || tier.rate > VALIDATION.MAX_RATE)
    return false
  return true
}

/**
 * Validate commission tiers array
 */
export function validateCommissionTiers(tiers: CommissionTier[]): boolean {
  if (tiers.length === 0) return false

  // Validate each tier
  for (const tier of tiers) {
    if (!validateCommissionTier(tier)) return false
  }

  // Check for overlaps
  const sortedTiers = [...tiers].sort((a, b) => a.minAmount - b.minAmount)
  for (let i = 0; i < sortedTiers.length - 1; i++) {
    const current = sortedTiers[i]
    const next = sortedTiers[i + 1]

    if (current.maxAmount !== undefined && current.maxAmount >= next.minAmount) {
      return false // Overlap detected
    }
  }

  return true
}

/**
 * Calculate total commissions from an array
 */
export function calculateTotalCommissions(
  commissions: Array<{ commissionAmount: number; status: string }>
): {
  total: number
  pending: number
  approved: number
  paid: number
  count: number
} {
  const result = {
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    count: commissions.length,
  }

  for (const commission of commissions) {
    result.total += commission.commissionAmount

    switch (commission.status) {
      case 'pending':
        result.pending += commission.commissionAmount
        break
      case 'approved':
        result.approved += commission.commissionAmount
        break
      case 'paid':
        result.paid += commission.commissionAmount
        break
    }
  }

  return result
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

/**
 * Check if commission meets minimum threshold
 */
export function meetsMinimumThreshold(
  commissionAmount: number,
  minCommissionAmount?: number
): boolean {
  if (minCommissionAmount === undefined) return true
  return commissionAmount >= minCommissionAmount
}

/**
 * Get period start and end timestamps
 */
export function getPeriodRange(period: string): {
  start: number
  end: number
} {
  const [year, month] = period.split('-').map(Number)
  const start = new Date(year, month - 1, 1).getTime()
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime()
  return { start, end }
}

/**
 * Check if date falls within period
 */
export function isDateInPeriod(date: number, period: string): boolean {
  const { start, end } = getPeriodRange(period)
  return date >= start && date <= end
}
