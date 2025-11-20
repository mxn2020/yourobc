// convex/lib/yourobc/customers/margins/mutations.ts

import { v } from 'convex/values'
import { mutation } from '@/generated/server'
import { validateMarginRule } from './utils'

/**
 * Create margin rule for customer
 */
export const createMarginRule = mutation({
  args: {
    customerId: v.id('yourobcCustomers'),
    defaultMarginPercentage: v.number(),
    defaultMinimumMarginEUR: v.number(),
    serviceMargins: v.optional(
      v.array(
        v.object({
          serviceType: v.union(
            v.literal('standard'),
            v.literal('express'),
            v.literal('overnight'),
            v.literal('international'),
            v.literal('freight'),
            v.literal('other')
          ),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    routeMargins: v.optional(
      v.array(
        v.object({
          routeId: v.optional(v.string()),
          origin: v.string(),
          destination: v.string(),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    volumeTiers: v.optional(
      v.array(
        v.object({
          minShipmentsPerMonth: v.number(),
          maxShipmentsPerMonth: v.optional(v.number()),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    hasNegotiatedRates: v.optional(v.boolean()),
    negotiatedRatesNotes: v.optional(v.string()),
    negotiatedRatesValidUntil: v.optional(v.number()),
    calculationMethod: v.optional(
      v.union(
        v.literal('higher_wins'),
        v.literal('percentage_only'),
        v.literal('minimum_only'),
        v.literal('custom')
      )
    ),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    nextReviewDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Validate margin rule
    const validation = validateMarginRule({
      defaultMarginPercentage: args.defaultMarginPercentage,
      defaultMinimumMarginEUR: args.defaultMinimumMarginEUR,
      serviceMargins: args.serviceMargins,
      routeMargins: args.routeMargins,
      volumeTiers: args.volumeTiers,
    })

    if (!validation.valid) {
      throw new Error(`Invalid margin rule: ${validation.errors.join(', ')}`)
    }

    // Check if margin rule already exists
    const existing = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .first()

    if (existing) {
      throw new Error(
        'Active margin rule already exists for this customer. Please update the existing rule or deactivate it first.'
      )
    }

    // Create margin rule
    const marginRuleId = await ctx.db.insert('yourobcCustomerMargins', {
      customerId: args.customerId,
      defaultMarginPercentage: args.defaultMarginPercentage,
      defaultMinimumMarginEUR: args.defaultMinimumMarginEUR,
      serviceMargins: args.serviceMargins,
      routeMargins: args.routeMargins,
      volumeTiers: args.volumeTiers,
      hasNegotiatedRates: args.hasNegotiatedRates || false,
      negotiatedRatesNotes: args.negotiatedRatesNotes,
      negotiatedRatesValidUntil: args.negotiatedRatesValidUntil,
      calculationMethod: args.calculationMethod || 'higher_wins',
      notes: args.notes,
      internalNotes: args.internalNotes,
      isActive: true,
      effectiveDate: now,
      createdBy: identity.subject,
      lastReviewDate: now,
      nextReviewDate: args.nextReviewDate || now + 365 * 24 * 60 * 60 * 1000, // Default 1 year
      tags: [],
      createdAt: now,
      updatedAt: now,
    })

    return marginRuleId
  },
})

/**
 * Update existing margin rule
 */
export const updateMarginRule = mutation({
  args: {
    marginRuleId: v.id('yourobcCustomerMargins'),
    defaultMarginPercentage: v.optional(v.number()),
    defaultMinimumMarginEUR: v.optional(v.number()),
    serviceMargins: v.optional(
      v.array(
        v.object({
          serviceType: v.union(
            v.literal('standard'),
            v.literal('express'),
            v.literal('overnight'),
            v.literal('international'),
            v.literal('freight'),
            v.literal('other')
          ),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    routeMargins: v.optional(
      v.array(
        v.object({
          routeId: v.optional(v.string()),
          origin: v.string(),
          destination: v.string(),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    volumeTiers: v.optional(
      v.array(
        v.object({
          minShipmentsPerMonth: v.number(),
          maxShipmentsPerMonth: v.optional(v.number()),
          marginPercentage: v.number(),
          minimumMarginEUR: v.number(),
          description: v.optional(v.string()),
        })
      )
    ),
    hasNegotiatedRates: v.optional(v.boolean()),
    negotiatedRatesNotes: v.optional(v.string()),
    negotiatedRatesValidUntil: v.optional(v.number()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    nextReviewDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const { marginRuleId, ...updates } = args

    // Get existing rule
    const existing = await ctx.db.get(marginRuleId)
    if (!existing) {
      throw new Error('Margin rule not found')
    }

    // Type guard: verify this is a margin rule document
    if (!('defaultMarginPercentage' in existing)) {
      throw new Error('Invalid document type')
    }

    // Build updated rule for validation
    const updatedRule = {
      defaultMarginPercentage:
        updates.defaultMarginPercentage ?? existing.defaultMarginPercentage,
      defaultMinimumMarginEUR:
        updates.defaultMinimumMarginEUR ?? existing.defaultMinimumMarginEUR,
      serviceMargins: updates.serviceMargins ?? existing.serviceMargins,
      routeMargins: updates.routeMargins ?? existing.routeMargins,
      volumeTiers: updates.volumeTiers ?? existing.volumeTiers,
    }

    // Validate
    const validation = validateMarginRule(updatedRule)
    if (!validation.valid) {
      throw new Error(`Invalid margin rule: ${validation.errors.join(', ')}`)
    }

    // Update
    await ctx.db.patch(marginRuleId, {
      ...updates,
      lastModifiedBy: identity.subject,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Review margin rule (mark as reviewed)
 */
export const reviewMarginRule = mutation({
  args: {
    marginRuleId: v.id('yourobcCustomerMargins'),
    nextReviewDate: v.number(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.marginRuleId, {
      lastReviewDate: now,
      nextReviewDate: args.nextReviewDate,
      internalNotes: args.reviewNotes,
      lastModifiedBy: identity.subject,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Deactivate margin rule
 */
export const deactivateMarginRule = mutation({
  args: {
    marginRuleId: v.id('yourobcCustomerMargins'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    await ctx.db.patch(args.marginRuleId, {
      isActive: false,
      expiryDate: now,
      internalNotes: args.reason,
      lastModifiedBy: identity.subject,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Duplicate margin rule for new customer
 */
export const duplicateMarginRule = mutation({
  args: {
    sourceMarginRuleId: v.id('yourobcCustomerMargins'),
    targetCustomerId: v.id('yourobcCustomers'),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get source rule
    const sourceRule = await ctx.db.get(args.sourceMarginRuleId)
    if (!sourceRule) {
      throw new Error('Source margin rule not found')
    }

    // Type guard: verify this is a margin rule document
    if (!('defaultMarginPercentage' in sourceRule)) {
      throw new Error('Invalid document type')
    }

    // Check if target customer already has active rule
    const existing = await ctx.db
      .query('yourobcCustomerMargins')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.targetCustomerId).eq('isActive', true)
      )
      .first()

    if (existing) {
      throw new Error(
        'Target customer already has an active margin rule'
      )
    }

    // Create duplicate
    const newRuleId = await ctx.db.insert('yourobcCustomerMargins', {
      customerId: args.targetCustomerId,
      defaultMarginPercentage: sourceRule.defaultMarginPercentage,
      defaultMinimumMarginEUR: sourceRule.defaultMinimumMarginEUR,
      serviceMargins: sourceRule.serviceMargins,
      routeMargins: sourceRule.routeMargins,
      volumeTiers: sourceRule.volumeTiers,
      hasNegotiatedRates: false, // Don't copy negotiated rates
      calculationMethod: sourceRule.calculationMethod,
      notes: `Duplicated from customer ${sourceRule.customerId}`,
      isActive: true,
      effectiveDate: now,
      createdBy: identity.subject,
      lastReviewDate: now,
      nextReviewDate: now + 365 * 24 * 60 * 60 * 1000,
      tags: [],
      createdAt: now,
      updatedAt: now,
    })

    return newRuleId
  },
})
