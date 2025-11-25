// convex/schema/yourobc/employees/commissions/validators.ts
/**
 * Employee Commissions Validators
 *
 * Convex validators for employee commissions module.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for employee commissions module
 */
export const employeeCommissionsValidators = {
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('paid'),
    v.literal('cancelled')
  ),
  employeeCommissionType: v.union(
    v.literal('margin_percentage'),
    v.literal('revenue_percentage'),
    v.literal('fixed_amount'),
    v.literal('tiered')
  ),
} as const;

/**
 * Complex object schemas for employee commissions module
 */
const commissionAdjustment = v.object({
  type: v.string(),
  amount: v.number(),
  reason: v.string(),
});

export const employeeCommissionsFields = {
  calculationBreakdown: v.object({
    baseAmount: v.number(),
    rate: v.number(),
    adjustments: v.optional(v.array(commissionAdjustment)),
    finalAmount: v.number(),
  }),

  tier: v.object({
    minAmount: v.number(),
    maxAmount: v.optional(v.number()),
    rate: v.number(),
    description: v.optional(v.string()),
  }),

  commissionAdjustment,
} as const;
