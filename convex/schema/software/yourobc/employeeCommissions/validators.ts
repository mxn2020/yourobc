// convex/schema/software/yourobc/employeeCommissions/validators.ts
/**
 * Employee Commissions Validators
 *
 * Defines validators for employee commission tracking and rules.
 * Separate from courier commissions - tracks sales employee earnings.
 *
 * @module convex/schema/software/yourobc/employeeCommissions/validators
 */

import { v } from 'convex/values'

/**
 * Applied Tier Validator
 * Tracks which tier was applied for tiered commission calculations
 */
export const appliedTierValidator = v.object({
  minAmount: v.number(),
  maxAmount: v.optional(v.number()),
  rate: v.number(),
  description: v.optional(v.string()),
})

/**
 * Commission Tier Validator
 * Used in commission rules to define tiered rate structures
 */
export const commissionTierValidator = v.object({
  minAmount: v.number(),
  maxAmount: v.optional(v.number()),
  rate: v.number(),
  description: v.optional(v.string()),
})

/**
 * Service Type Validator
 * Defines which service types a commission rule applies to
 */
export const serviceTypeValidator = v.union(
  v.literal('OBC'),
  v.literal('NFO')
)
