// convex/lib/software/yourobc/employeeCommissions/mutations.ts
/**
 * Employee Commissions Mutation Functions
 *
 * Mutation functions for creating, updating, and deleting employee commissions and rules.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/mutations
 */

import { MutationCtx } from '../../../../_generated/server'
import { Id } from '../../../../_generated/dataModel'
import {
  EMPLOYEE_COMMISSIONS_TABLE,
  EMPLOYEE_COMMISSION_RULES_TABLE,
  COMMISSION_STATUS,
} from './constants'
import type {
  CreateEmployeeCommissionInput,
  UpdateEmployeeCommissionInput,
  CreateEmployeeCommissionRuleInput,
  UpdateEmployeeCommissionRuleInput,
  ApproveCommissionInput,
  PayCommissionInput,
  CancelCommissionInput,
  EmployeeCommission,
  EmployeeCommissionRule,
} from './types'
import {
  generateCommissionPublicId,
  generateRulePublicId,
  formatPeriod,
  formatRuleType,
} from './utils'

// ============================================================================
// Commission Mutations
// ============================================================================

/**
 * Create a new employee commission
 */
export async function createCommission(
  ctx: MutationCtx,
  input: CreateEmployeeCommissionInput,
  ownerId: string
): Promise<Id<'yourobcEmployeeCommissions'>> {
  const now = Date.now()

  // Ensure period is set
  const period = input.period || formatPeriod()

  const commissionId = await ctx.db.insert(EMPLOYEE_COMMISSIONS_TABLE, {
    publicId: generateCommissionPublicId(),
    ownerId,
    employeeId: input.employeeId,
    shipmentId: input.shipmentId,
    quoteId: input.quoteId,
    invoiceId: input.invoiceId,
    type: input.type,
    ruleId: input.ruleId,
    ruleName: input.ruleName,
    baseAmount: input.baseAmount,
    margin: input.margin,
    marginPercentage: input.marginPercentage,
    commissionRate: input.commissionRate,
    commissionAmount: input.commissionAmount,
    currency: input.currency,
    appliedTier: input.appliedTier,
    calculatedAt: input.calculatedAt || now,
    status: input.status,
    invoicePaymentStatus: input.invoicePaymentStatus,
    invoicePaidDate: input.invoicePaidDate,
    period,
    description: input.description,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: ownerId,
    updatedBy: ownerId,
  })

  return commissionId
}

/**
 * Update an existing employee commission
 */
export async function updateCommission(
  ctx: MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  input: UpdateEmployeeCommissionInput,
  userId: string
): Promise<void> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.deletedAt) {
    throw new Error('Cannot update deleted commission')
  }

  if (commission.status === 'paid') {
    throw new Error('Cannot update paid commission')
  }

  const now = Date.now()

  await ctx.db.patch(commissionId, {
    ...input,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Approve a commission
 */
export async function approveCommission(
  ctx: MutationCtx,
  input: ApproveCommissionInput
): Promise<void> {
  const commission = await ctx.db.get(input.commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.status !== COMMISSION_STATUS.PENDING) {
    throw new Error('Can only approve pending commissions')
  }

  if (commission.deletedAt) {
    throw new Error('Cannot approve deleted commission')
  }

  const now = Date.now()

  await ctx.db.patch(input.commissionId, {
    status: COMMISSION_STATUS.APPROVED,
    approvedBy: input.approvedBy,
    approvedDate: now,
    approvalNotes: input.approvalNotes,
    updatedAt: now,
    updatedBy: input.approvedBy,
  })
}

/**
 * Pay a commission
 */
export async function payCommission(
  ctx: MutationCtx,
  input: PayCommissionInput
): Promise<void> {
  const commission = await ctx.db.get(input.commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.status !== COMMISSION_STATUS.APPROVED) {
    throw new Error('Can only pay approved commissions')
  }

  if (commission.deletedAt) {
    throw new Error('Cannot pay deleted commission')
  }

  const now = Date.now()

  await ctx.db.patch(input.commissionId, {
    status: COMMISSION_STATUS.PAID,
    paidDate: input.paymentDate,
    paymentReference: input.paymentReference,
    paymentMethod: input.paymentMethod,
    paymentNotes: input.paymentNotes,
    paidBy: input.paidBy,
    updatedAt: now,
    updatedBy: input.paidBy,
  })
}

/**
 * Cancel a commission
 */
export async function cancelCommission(
  ctx: MutationCtx,
  input: CancelCommissionInput
): Promise<void> {
  const commission = await ctx.db.get(input.commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.status === COMMISSION_STATUS.PAID) {
    throw new Error('Cannot cancel paid commission')
  }

  if (commission.deletedAt) {
    throw new Error('Cannot cancel deleted commission')
  }

  const now = Date.now()

  await ctx.db.patch(input.commissionId, {
    status: COMMISSION_STATUS.CANCELLED,
    cancelledBy: input.cancelledBy,
    cancelledDate: now,
    cancellationReason: input.cancellationReason,
    updatedAt: now,
    updatedBy: input.cancelledBy,
  })
}

/**
 * Soft delete a commission
 */
export async function deleteCommission(
  ctx: MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<void> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.deletedAt) {
    throw new Error('Commission already deleted')
  }

  if (commission.status === COMMISSION_STATUS.PAID) {
    throw new Error('Cannot delete paid commission')
  }

  const now = Date.now()

  await ctx.db.patch(commissionId, {
    deletedAt: now,
    deletedBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Restore a soft-deleted commission
 */
export async function restoreCommission(
  ctx: MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<void> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (!commission.deletedAt) {
    throw new Error('Commission is not deleted')
  }

  const now = Date.now()

  await ctx.db.patch(commissionId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Auto-approve commissions when invoice is paid
 */
export async function autoApproveCommissionsForInvoice(
  ctx: MutationCtx,
  invoiceId: Id<'yourobcInvoices'>,
  ownerId: string
): Promise<number> {
  // Find pending commissions for this invoice with auto-approve rules
  const commissions = await ctx.db
    .query(EMPLOYEE_COMMISSIONS_TABLE)
    .withIndex('by_invoice', (q) => q.eq('invoiceId', invoiceId))
    .filter((q) => q.eq(q.field('ownerId'), ownerId))
    .filter((q) => q.eq(q.field('status'), COMMISSION_STATUS.PENDING))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect()

  let approvedCount = 0
  const now = Date.now()

  for (const commission of commissions) {
    // Check if the rule has auto-approve enabled
    if (commission.ruleId) {
      const rule = await ctx.db.get(commission.ruleId)
      if (rule?.autoApprove) {
        await ctx.db.patch(commission._id, {
          status: COMMISSION_STATUS.APPROVED,
          approvedBy: 'system:auto-approve',
          approvedDate: now,
          approvalNotes: 'Auto-approved when invoice was paid',
          invoicePaymentStatus: 'paid',
          invoicePaidDate: now,
          updatedAt: now,
          updatedBy: 'system:auto-approve',
        })
        approvedCount++
      }
    }
  }

  return approvedCount
}

// ============================================================================
// Commission Rules Mutations
// ============================================================================

/**
 * Create a new commission rule
 */
export async function createRule(
  ctx: MutationCtx,
  input: CreateEmployeeCommissionRuleInput,
  ownerId: string
): Promise<Id<'yourobcEmployeeCommissionRules'>> {
  const now = Date.now()

  // Generate ruleType display field
  const ruleType = formatRuleType(input.type, input.rate, input.tiers)

  const ruleId = await ctx.db.insert(EMPLOYEE_COMMISSION_RULES_TABLE, {
    publicId: generateRulePublicId(),
    ownerId,
    employeeId: input.employeeId,
    name: input.name,
    description: input.description,
    type: input.type,
    ruleType,
    rate: input.rate,
    tiers: input.tiers,
    serviceTypes: input.serviceTypes,
    applicableCategories: input.applicableCategories,
    applicableProducts: input.applicableProducts,
    minMarginPercentage: input.minMarginPercentage,
    minOrderValue: input.minOrderValue,
    minCommissionAmount: input.minCommissionAmount,
    autoApprove: input.autoApprove,
    priority: input.priority,
    startDate: input.startDate,
    endDate: input.endDate,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo,
    isActive: input.isActive,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: ownerId,
    updatedBy: ownerId,
  })

  return ruleId
}

/**
 * Update an existing commission rule
 */
export async function updateRule(
  ctx: MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  input: UpdateEmployeeCommissionRuleInput,
  userId: string
): Promise<void> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) {
    throw new Error('Rule not found')
  }

  if (rule.deletedAt) {
    throw new Error('Cannot update deleted rule')
  }

  const now = Date.now()

  // Regenerate ruleType if type, rate, or tiers changed
  const updatedType = input.type || rule.type
  const updatedRate = input.rate !== undefined ? input.rate : rule.rate
  const updatedTiers = input.tiers || rule.tiers
  const ruleType = formatRuleType(updatedType, updatedRate, updatedTiers)

  await ctx.db.patch(ruleId, {
    ...input,
    ruleType,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Soft delete a commission rule
 */
export async function deleteRule(
  ctx: MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<void> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) {
    throw new Error('Rule not found')
  }

  if (rule.deletedAt) {
    throw new Error('Rule already deleted')
  }

  const now = Date.now()

  await ctx.db.patch(ruleId, {
    deletedAt: now,
    deletedBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Restore a soft-deleted commission rule
 */
export async function restoreRule(
  ctx: MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<void> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) {
    throw new Error('Rule not found')
  }

  if (!rule.deletedAt) {
    throw new Error('Rule is not deleted')
  }

  const now = Date.now()

  await ctx.db.patch(ruleId, {
    deletedAt: undefined,
    deletedBy: undefined,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Activate a commission rule
 */
export async function activateRule(
  ctx: MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<void> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) {
    throw new Error('Rule not found')
  }

  if (rule.deletedAt) {
    throw new Error('Cannot activate deleted rule')
  }

  const now = Date.now()

  await ctx.db.patch(ruleId, {
    isActive: true,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Deactivate a commission rule
 */
export async function deactivateRule(
  ctx: MutationCtx,
  ruleId: Id<'yourobcEmployeeCommissionRules'>,
  userId: string
): Promise<void> {
  const rule = await ctx.db.get(ruleId)
  if (!rule) {
    throw new Error('Rule not found')
  }

  if (rule.deletedAt) {
    throw new Error('Cannot deactivate deleted rule')
  }

  const now = Date.now()

  await ctx.db.patch(ruleId, {
    isActive: false,
    updatedAt: now,
    updatedBy: userId,
  })
}

/**
 * Bulk update commission status
 */
export async function bulkUpdateCommissionStatus(
  ctx: MutationCtx,
  commissionIds: Id<'yourobcEmployeeCommissions'>[],
  status: string,
  userId: string
): Promise<number> {
  let updatedCount = 0
  const now = Date.now()

  for (const commissionId of commissionIds) {
    const commission = await ctx.db.get(commissionId)
    if (commission && !commission.deletedAt && commission.status !== 'paid') {
      await ctx.db.patch(commissionId, {
        status,
        updatedAt: now,
        updatedBy: userId,
      })
      updatedCount++
    }
  }

  return updatedCount
}

/**
 * Recalculate commission amount
 */
export async function recalculateCommission(
  ctx: MutationCtx,
  commissionId: Id<'yourobcEmployeeCommissions'>,
  userId: string
): Promise<void> {
  const commission = await ctx.db.get(commissionId)
  if (!commission) {
    throw new Error('Commission not found')
  }

  if (commission.deletedAt) {
    throw new Error('Cannot recalculate deleted commission')
  }

  if (commission.status === COMMISSION_STATUS.PAID) {
    throw new Error('Cannot recalculate paid commission')
  }

  // Get the rule if it exists
  if (!commission.ruleId) {
    throw new Error('Cannot recalculate commission without rule')
  }

  const rule = await ctx.db.get(commission.ruleId)
  if (!rule) {
    throw new Error('Commission rule not found')
  }

  const now = Date.now()

  // Recalculate based on rule type
  let newCommissionAmount = commission.commissionAmount
  let newCommissionRate = commission.commissionRate
  let newAppliedTier = commission.appliedTier

  if (rule.type === 'margin_percentage' && commission.margin !== undefined) {
    newCommissionRate = rule.rate || 0
    newCommissionAmount = (commission.margin * newCommissionRate) / 100
  } else if (rule.type === 'revenue_percentage') {
    newCommissionRate = rule.rate || 0
    newCommissionAmount = (commission.baseAmount * newCommissionRate) / 100
  } else if (rule.type === 'fixed_amount') {
    newCommissionRate = rule.rate || 0
    newCommissionAmount = rule.rate || 0
  } else if (rule.type === 'tiered' && rule.tiers) {
    // Find matching tier
    const sortedTiers = [...rule.tiers].sort((a, b) => a.minAmount - b.minAmount)
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      const tier = sortedTiers[i]
      if (
        commission.baseAmount >= tier.minAmount &&
        (tier.maxAmount === undefined || commission.baseAmount <= tier.maxAmount)
      ) {
        newCommissionRate = tier.rate
        newCommissionAmount = (commission.baseAmount * tier.rate) / 100
        newAppliedTier = tier
        break
      }
    }
  }

  await ctx.db.patch(commissionId, {
    commissionRate: newCommissionRate,
    commissionAmount: newCommissionAmount,
    appliedTier: newAppliedTier,
    calculatedAt: now,
    updatedAt: now,
    updatedBy: userId,
  })
}
