// convex/lib/yourobc/employees/commissions/utils.ts

import type { Doc } from '../../../../_generated/dataModel'

type CommissionRule = Doc<'yourobcEmployeeCommissionRules'>

/**
 * Calculate commission based on margin percentage
 */
export function calculateMarginCommission(
  revenue: number,
  cost: number,
  rate: number
): { margin: number; marginPercentage: number; commissionAmount: number } {
  const margin = revenue - cost
  const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0
  const commissionAmount = (margin * rate) / 100

  return {
    margin,
    marginPercentage,
    commissionAmount: Math.max(0, commissionAmount), // Never negative
  }
}

/**
 * Calculate commission based on revenue percentage
 */
export function calculateRevenueCommission(
  revenue: number,
  rate: number
): { commissionAmount: number } {
  const commissionAmount = (revenue * rate) / 100

  return {
    commissionAmount: Math.max(0, commissionAmount),
  }
}

/**
 * Calculate commission based on fixed amount
 */
export function calculateFixedCommission(
  rate: number
): { commissionAmount: number } {
  return {
    commissionAmount: rate,
  }
}

/**
 * Calculate commission based on tiered rates
 */
export function calculateTieredCommission(
  baseAmount: number,
  tiers: Array<{
    minAmount: number
    maxAmount?: number
    rate: number
    description?: string
  }>
): { commissionAmount: number; appliedTier: any } {
  // Find applicable tier
  const applicableTier = tiers.find(tier => {
    const meetsMin = baseAmount >= tier.minAmount
    const meetsMax = tier.maxAmount === undefined || baseAmount <= tier.maxAmount
    return meetsMin && meetsMax
  })

  if (!applicableTier) {
    return {
      commissionAmount: 0,
      appliedTier: null,
    }
  }

  const commissionAmount = (baseAmount * applicableTier.rate) / 100

  return {
    commissionAmount: Math.max(0, commissionAmount),
    appliedTier: applicableTier,
  }
}

/**
 * Apply commission rule to calculate commission amount
 */
export function applyCommissionRule(
  rule: CommissionRule,
  revenue: number,
  cost?: number
): {
  baseAmount: number
  margin?: number
  marginPercentage?: number
  commissionRate: number
  commissionAmount: number
  appliedTier?: any
} {
  switch (rule.type) {
    case 'margin_percentage': {
      if (cost === undefined) {
        throw new Error('Cost is required for margin-based commission')
      }
      const result = calculateMarginCommission(revenue, cost, rule.rate || 0)

      // Check minimum margin percentage
      if (rule.minMarginPercentage && result.marginPercentage < rule.minMarginPercentage) {
        return {
          baseAmount: result.margin,
          margin: result.margin,
          marginPercentage: result.marginPercentage,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      // Check minimum order value
      if (rule.minOrderValue && revenue < rule.minOrderValue) {
        return {
          baseAmount: result.margin,
          margin: result.margin,
          marginPercentage: result.marginPercentage,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      // Check minimum commission amount
      if (rule.minCommissionAmount && result.commissionAmount < rule.minCommissionAmount) {
        return {
          baseAmount: result.margin,
          margin: result.margin,
          marginPercentage: result.marginPercentage,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      return {
        baseAmount: result.margin,
        margin: result.margin,
        marginPercentage: result.marginPercentage,
        commissionRate: rule.rate || 0,
        commissionAmount: result.commissionAmount,
      }
    }

    case 'revenue_percentage': {
      const result = calculateRevenueCommission(revenue, rule.rate || 0)

      // Check minimum order value
      if (rule.minOrderValue && revenue < rule.minOrderValue) {
        return {
          baseAmount: revenue,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      // Check minimum commission amount
      if (rule.minCommissionAmount && result.commissionAmount < rule.minCommissionAmount) {
        return {
          baseAmount: revenue,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      return {
        baseAmount: revenue,
        commissionRate: rule.rate || 0,
        commissionAmount: result.commissionAmount,
      }
    }

    case 'fixed_amount': {
      const result = calculateFixedCommission(rule.rate || 0)

      // Check minimum order value
      if (rule.minOrderValue && revenue < rule.minOrderValue) {
        return {
          baseAmount: revenue,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      return {
        baseAmount: revenue,
        commissionRate: rule.rate || 0,
        commissionAmount: result.commissionAmount,
      }
    }

    case 'tiered': {
      if (!rule.tiers || rule.tiers.length === 0) {
        throw new Error('Tiered commission requires tier configuration')
      }

      const baseAmount = cost !== undefined ? revenue - cost : revenue
      const result = calculateTieredCommission(baseAmount, rule.tiers)

      // Check minimum order value
      if (rule.minOrderValue && revenue < rule.minOrderValue) {
        return {
          baseAmount,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      // Check minimum commission amount
      if (rule.minCommissionAmount && result.commissionAmount < rule.minCommissionAmount) {
        return {
          baseAmount,
          commissionRate: 0,
          commissionAmount: 0,
        }
      }

      return {
        baseAmount,
        commissionRate: result.appliedTier?.rate || 0,
        commissionAmount: result.commissionAmount,
        appliedTier: result.appliedTier,
      }
    }

    default:
      throw new Error(`Unknown commission type: ${rule.type}`)
  }
}

/**
 * Validate commission rule configuration
 */
export function validateCommissionRule(rule: Partial<CommissionRule>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!rule.type) {
    errors.push('Commission type is required')
  }

  if (rule.type === 'tiered') {
    if (!rule.tiers || rule.tiers.length === 0) {
      errors.push('Tiered commission requires at least one tier')
    } else {
      // Validate tiers don't overlap
      const sortedTiers = [...rule.tiers].sort((a, b) => a.minAmount - b.minAmount)
      for (let i = 0; i < sortedTiers.length - 1; i++) {
        const current = sortedTiers[i]
        const next = sortedTiers[i + 1]
        if (current.maxAmount && current.maxAmount >= next.minAmount) {
          errors.push(`Tier ${i + 1} overlaps with tier ${i + 2}`)
        }
      }
    }
  } else {
    if (rule.rate === undefined || rule.rate < 0) {
      errors.push('Commission rate must be a positive number')
    }
  }

  if (rule.minMarginPercentage !== undefined && rule.minMarginPercentage < 0) {
    errors.push('Minimum margin percentage must be positive')
  }

  if (rule.minOrderValue !== undefined && rule.minOrderValue < 0) {
    errors.push('Minimum order value must be positive')
  }

  if (rule.minCommissionAmount !== undefined && rule.minCommissionAmount < 0) {
    errors.push('Minimum commission amount must be positive')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
