// convex/lib/software/yourobc/customerMargins/mutations.ts
/**
 * Customer Margins Mutation Operations
 *
 * Write operations (create, update, delete) for all 4 tables:
 * - Customer Margins
 * - Contact Log
 * - Customer Analytics
 * - Customer Dunning Config
 *
 * @module convex/lib/software/yourobc/customerMargins/mutations
 */

import { mutation } from '../../../../_generated/server'
import { v } from 'convex/values'
import { generatePublicId } from '../../utils/publicId'
import {
  serviceMarginValidator,
  routeMarginValidator,
  volumeTierValidator,
} from '../../../schema/software/yourobc/customerMargins/validators'
import {
  marginCalculationMethodValidator,
  contactTypeValidator,
  contactDirectionValidator,
  contactOutcomeValidator,
  contactCategoryValidator,
  contactPriorityValidator,
  dunningMethodValidator,
} from '../../../schema/base'

// ============================================================================
// Customer Margins Mutations
// ============================================================================

/**
 * Create customer margin configuration
 */
export const createMargin = mutation({
  args: {
    ownerId: v.id('owners'),
    customerId: v.id('yourobcCustomers'),
    defaultMarginPercentage: v.number(),
    defaultMinimumMarginEUR: v.number(),
    serviceMargins: v.optional(v.array(serviceMarginValidator)),
    routeMargins: v.optional(v.array(routeMarginValidator)),
    volumeTiers: v.optional(v.array(volumeTierValidator)),
    hasNegotiatedRates: v.boolean(),
    negotiatedRatesNotes: v.optional(v.string()),
    negotiatedRatesValidUntil: v.optional(v.number()),
    calculationMethod: v.optional(marginCalculationMethodValidator),
    customCalculationNotes: v.optional(v.string()),
    isActive: v.boolean(),
    effectiveDate: v.number(),
    expiryDate: v.optional(v.number()),
    lastReviewDate: v.optional(v.number()),
    nextReviewDate: v.optional(v.number()),
    lastModifiedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const publicId = generatePublicId('MRGN')
    const now = Date.now()

    const marginId = await ctx.db.insert('customerMarginsTable', {
      publicId,
      ownerId: args.ownerId,
      customerId: args.customerId,
      defaultMarginPercentage: args.defaultMarginPercentage,
      defaultMinimumMarginEUR: args.defaultMinimumMarginEUR,
      serviceMargins: args.serviceMargins,
      routeMargins: args.routeMargins,
      volumeTiers: args.volumeTiers,
      hasNegotiatedRates: args.hasNegotiatedRates,
      negotiatedRatesNotes: args.negotiatedRatesNotes,
      negotiatedRatesValidUntil: args.negotiatedRatesValidUntil,
      calculationMethod: args.calculationMethod,
      customCalculationNotes: args.customCalculationNotes,
      isActive: args.isActive,
      effectiveDate: args.effectiveDate,
      expiryDate: args.expiryDate,
      lastReviewDate: args.lastReviewDate,
      nextReviewDate: args.nextReviewDate,
      lastModifiedBy: args.lastModifiedBy,
      notes: args.notes,
      internalNotes: args.internalNotes,
      createdAt: now,
      updatedAt: now,
    })

    return { id: marginId, publicId }
  },
})

/**
 * Update customer margin configuration
 */
export const updateMargin = mutation({
  args: {
    id: v.id('customerMarginsTable'),
    defaultMarginPercentage: v.optional(v.number()),
    defaultMinimumMarginEUR: v.optional(v.number()),
    serviceMargins: v.optional(v.array(serviceMarginValidator)),
    routeMargins: v.optional(v.array(routeMarginValidator)),
    volumeTiers: v.optional(v.array(volumeTierValidator)),
    hasNegotiatedRates: v.optional(v.boolean()),
    negotiatedRatesNotes: v.optional(v.string()),
    negotiatedRatesValidUntil: v.optional(v.number()),
    calculationMethod: v.optional(marginCalculationMethodValidator),
    customCalculationNotes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    effectiveDate: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
    lastReviewDate: v.optional(v.number()),
    nextReviewDate: v.optional(v.number()),
    lastModifiedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const existing = await ctx.db.get(id)
    if (!existing || existing.deletedAt) {
      throw new Error('Margin configuration not found')
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return { id }
  },
})

/**
 * Delete customer margin configuration (soft delete)
 */
export const deleteMargin = mutation({
  args: {
    id: v.id('customerMarginsTable'),
    deletedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Margin configuration not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============================================================================
// Contact Log Mutations
// ============================================================================

/**
 * Create contact log entry
 */
export const createContact = mutation({
  args: {
    ownerId: v.id('owners'),
    customerId: v.id('yourobcCustomers'),
    contactPersonId: v.optional(v.id('contactPersons')),
    contactType: contactTypeValidator,
    direction: contactDirectionValidator,
    subject: v.string(),
    summary: v.string(),
    details: v.optional(v.string()),
    outcome: v.optional(contactOutcomeValidator),
    outcomeNotes: v.optional(v.string()),
    relatedQuoteId: v.optional(v.id('yourobcQuotes')),
    relatedShipmentId: v.optional(v.id('yourobcShipments')),
    relatedInvoiceId: v.optional(v.id('yourobcInvoices')),
    requiresFollowUp: v.boolean(),
    followUpDate: v.optional(v.number()),
    followUpAssignedTo: v.optional(v.string()),
    followUpNotes: v.optional(v.string()),
    contactedBy: v.string(),
    contactDate: v.number(),
    duration: v.optional(v.number()),
    category: v.optional(contactCategoryValidator),
    priority: v.optional(contactPriorityValidator),
  },
  handler: async (ctx, args) => {
    const publicId = generatePublicId('CONT')
    const now = Date.now()

    const contactId = await ctx.db.insert('contactLogTable', {
      publicId,
      ownerId: args.ownerId,
      customerId: args.customerId,
      contactPersonId: args.contactPersonId,
      contactType: args.contactType,
      direction: args.direction,
      subject: args.subject,
      summary: args.summary,
      details: args.details,
      outcome: args.outcome,
      outcomeNotes: args.outcomeNotes,
      relatedQuoteId: args.relatedQuoteId,
      relatedShipmentId: args.relatedShipmentId,
      relatedInvoiceId: args.relatedInvoiceId,
      requiresFollowUp: args.requiresFollowUp,
      followUpDate: args.followUpDate,
      followUpAssignedTo: args.followUpAssignedTo,
      followUpCompleted: false,
      followUpNotes: args.followUpNotes,
      contactedBy: args.contactedBy,
      contactDate: args.contactDate,
      duration: args.duration,
      category: args.category,
      priority: args.priority,
      createdAt: now,
      updatedAt: now,
    })

    return { id: contactId, publicId }
  },
})

/**
 * Update contact log entry
 */
export const updateContact = mutation({
  args: {
    id: v.id('contactLogTable'),
    subject: v.optional(v.string()),
    summary: v.optional(v.string()),
    details: v.optional(v.string()),
    outcome: v.optional(contactOutcomeValidator),
    outcomeNotes: v.optional(v.string()),
    requiresFollowUp: v.optional(v.boolean()),
    followUpDate: v.optional(v.number()),
    followUpAssignedTo: v.optional(v.string()),
    followUpNotes: v.optional(v.string()),
    category: v.optional(contactCategoryValidator),
    priority: v.optional(contactPriorityValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const existing = await ctx.db.get(id)
    if (!existing || existing.deletedAt) {
      throw new Error('Contact log not found')
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return { id }
  },
})

/**
 * Complete follow-up task
 */
export const completeFollowUp = mutation({
  args: {
    id: v.id('contactLogTable'),
    completedBy: v.string(),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Contact log not found')
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      followUpCompleted: true,
      followUpCompletedDate: now,
      followUpCompletedBy: args.completedBy,
      followUpNotes: args.completionNotes || existing.followUpNotes,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Delete contact log entry (soft delete)
 */
export const deleteContact = mutation({
  args: {
    id: v.id('contactLogTable'),
    deletedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Contact log not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============================================================================
// Customer Analytics Mutations
// ============================================================================

/**
 * Create or update customer analytics
 */
export const upsertAnalytics = mutation({
  args: {
    ownerId: v.id('owners'),
    customerId: v.id('yourobcCustomers'),
    year: v.number(),
    month: v.optional(v.number()),
    totalShipments: v.number(),
    completedShipments: v.number(),
    cancelledShipments: v.number(),
    totalRevenue: v.number(),
    totalCost: v.number(),
    totalMargin: v.number(),
    averageMargin: v.number(),
    averageMarginPercentage: v.number(),
    marginsByService: v.optional(v.any()),
    topRoutes: v.optional(v.any()),
    totalInvoiced: v.number(),
    totalPaid: v.number(),
    totalOutstanding: v.number(),
    averagePaymentDays: v.number(),
    onTimePaymentRate: v.number(),
    latePaymentCount: v.number(),
    overdueInvoiceCount: v.number(),
    dunningLevel1Count: v.number(),
    dunningLevel2Count: v.number(),
    dunningLevel3Count: v.number(),
    totalDunningFees: v.number(),
    totalContacts: v.number(),
    lastContactDate: v.optional(v.number()),
    daysSinceLastContact: v.optional(v.number()),
    needsFollowUpAlert: v.boolean(),
    complaintCount: v.number(),
    issueResolutionRate: v.number(),
    customerSatisfactionScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if analytics already exists for this period
    const existing = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_customer_period', (q) =>
        q.eq('customerId', args.customerId)
          .eq('year', args.year)
          .eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        totalShipments: args.totalShipments,
        completedShipments: args.completedShipments,
        cancelledShipments: args.cancelledShipments,
        totalRevenue: args.totalRevenue,
        totalCost: args.totalCost,
        totalMargin: args.totalMargin,
        averageMargin: args.averageMargin,
        averageMarginPercentage: args.averageMarginPercentage,
        marginsByService: args.marginsByService,
        topRoutes: args.topRoutes,
        totalInvoiced: args.totalInvoiced,
        totalPaid: args.totalPaid,
        totalOutstanding: args.totalOutstanding,
        averagePaymentDays: args.averagePaymentDays,
        onTimePaymentRate: args.onTimePaymentRate,
        latePaymentCount: args.latePaymentCount,
        overdueInvoiceCount: args.overdueInvoiceCount,
        dunningLevel1Count: args.dunningLevel1Count,
        dunningLevel2Count: args.dunningLevel2Count,
        dunningLevel3Count: args.dunningLevel3Count,
        totalDunningFees: args.totalDunningFees,
        totalContacts: args.totalContacts,
        lastContactDate: args.lastContactDate,
        daysSinceLastContact: args.daysSinceLastContact,
        needsFollowUpAlert: args.needsFollowUpAlert,
        complaintCount: args.complaintCount,
        issueResolutionRate: args.issueResolutionRate,
        customerSatisfactionScore: args.customerSatisfactionScore,
        calculatedAt: now,
        updatedAt: now,
      })

      return { id: existing._id, publicId: existing.publicId }
    } else {
      // Create new
      const publicId = generatePublicId('ANLT')
      const analyticsId = await ctx.db.insert('customerAnalyticsTable', {
        publicId,
        ownerId: args.ownerId,
        customerId: args.customerId,
        year: args.year,
        month: args.month,
        totalShipments: args.totalShipments,
        completedShipments: args.completedShipments,
        cancelledShipments: args.cancelledShipments,
        totalRevenue: args.totalRevenue,
        totalCost: args.totalCost,
        totalMargin: args.totalMargin,
        averageMargin: args.averageMargin,
        averageMarginPercentage: args.averageMarginPercentage,
        marginsByService: args.marginsByService,
        topRoutes: args.topRoutes,
        totalInvoiced: args.totalInvoiced,
        totalPaid: args.totalPaid,
        totalOutstanding: args.totalOutstanding,
        averagePaymentDays: args.averagePaymentDays,
        onTimePaymentRate: args.onTimePaymentRate,
        latePaymentCount: args.latePaymentCount,
        overdueInvoiceCount: args.overdueInvoiceCount,
        dunningLevel1Count: args.dunningLevel1Count,
        dunningLevel2Count: args.dunningLevel2Count,
        dunningLevel3Count: args.dunningLevel3Count,
        totalDunningFees: args.totalDunningFees,
        totalContacts: args.totalContacts,
        lastContactDate: args.lastContactDate,
        daysSinceLastContact: args.daysSinceLastContact,
        needsFollowUpAlert: args.needsFollowUpAlert,
        complaintCount: args.complaintCount,
        issueResolutionRate: args.issueResolutionRate,
        customerSatisfactionScore: args.customerSatisfactionScore,
        calculatedAt: now,
        createdAt: now,
        updatedAt: now,
      })

      return { id: analyticsId, publicId }
    }
  },
})

/**
 * Delete analytics (soft delete)
 */
export const deleteAnalytics = mutation({
  args: {
    id: v.id('customerAnalyticsTable'),
    deletedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Analytics not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============================================================================
// Customer Dunning Config Mutations
// ============================================================================

/**
 * Create dunning configuration
 */
export const createDunningConfig = mutation({
  args: {
    ownerId: v.id('owners'),
    customerId: v.id('yourobcCustomers'),
    level1DaysOverdue: v.number(),
    level1FeeEUR: v.number(),
    level1EmailTemplate: v.optional(v.string()),
    level1AutoSend: v.boolean(),
    level2DaysOverdue: v.number(),
    level2FeeEUR: v.number(),
    level2EmailTemplate: v.optional(v.string()),
    level2AutoSend: v.boolean(),
    level3DaysOverdue: v.number(),
    level3FeeEUR: v.number(),
    level3EmailTemplate: v.optional(v.string()),
    level3AutoSend: v.boolean(),
    level3SuspendService: v.boolean(),
    allowServiceWhenOverdue: v.boolean(),
    suspensionGracePeriodDays: v.optional(v.number()),
    autoReactivateOnPayment: v.boolean(),
    skipDunningProcess: v.boolean(),
    customPaymentTermsDays: v.optional(v.number()),
    requirePrepayment: v.boolean(),
    dunningContactEmail: v.optional(v.string()),
    dunningContactPhone: v.optional(v.string()),
    dunningContactName: v.optional(v.string()),
    preferredDunningMethod: v.optional(dunningMethodValidator),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const publicId = generatePublicId('DUNN')
    const now = Date.now()

    const configId = await ctx.db.insert('customerDunningConfigTable', {
      publicId,
      ownerId: args.ownerId,
      customerId: args.customerId,
      level1DaysOverdue: args.level1DaysOverdue,
      level1FeeEUR: args.level1FeeEUR,
      level1EmailTemplate: args.level1EmailTemplate,
      level1AutoSend: args.level1AutoSend,
      level2DaysOverdue: args.level2DaysOverdue,
      level2FeeEUR: args.level2FeeEUR,
      level2EmailTemplate: args.level2EmailTemplate,
      level2AutoSend: args.level2AutoSend,
      level3DaysOverdue: args.level3DaysOverdue,
      level3FeeEUR: args.level3FeeEUR,
      level3EmailTemplate: args.level3EmailTemplate,
      level3AutoSend: args.level3AutoSend,
      level3SuspendService: args.level3SuspendService,
      allowServiceWhenOverdue: args.allowServiceWhenOverdue,
      suspensionGracePeriodDays: args.suspensionGracePeriodDays,
      autoReactivateOnPayment: args.autoReactivateOnPayment,
      skipDunningProcess: args.skipDunningProcess,
      customPaymentTermsDays: args.customPaymentTermsDays,
      requirePrepayment: args.requirePrepayment,
      dunningContactEmail: args.dunningContactEmail,
      dunningContactPhone: args.dunningContactPhone,
      dunningContactName: args.dunningContactName,
      preferredDunningMethod: args.preferredDunningMethod,
      isActive: args.isActive,
      notes: args.notes,
      internalNotes: args.internalNotes,
      createdAt: now,
      updatedAt: now,
    })

    return { id: configId, publicId }
  },
})

/**
 * Update dunning configuration
 */
export const updateDunningConfig = mutation({
  args: {
    id: v.id('customerDunningConfigTable'),
    level1DaysOverdue: v.optional(v.number()),
    level1FeeEUR: v.optional(v.number()),
    level1EmailTemplate: v.optional(v.string()),
    level1AutoSend: v.optional(v.boolean()),
    level2DaysOverdue: v.optional(v.number()),
    level2FeeEUR: v.optional(v.number()),
    level2EmailTemplate: v.optional(v.string()),
    level2AutoSend: v.optional(v.boolean()),
    level3DaysOverdue: v.optional(v.number()),
    level3FeeEUR: v.optional(v.number()),
    level3EmailTemplate: v.optional(v.string()),
    level3AutoSend: v.optional(v.boolean()),
    level3SuspendService: v.optional(v.boolean()),
    allowServiceWhenOverdue: v.optional(v.boolean()),
    suspensionGracePeriodDays: v.optional(v.number()),
    autoReactivateOnPayment: v.optional(v.boolean()),
    skipDunningProcess: v.optional(v.boolean()),
    customPaymentTermsDays: v.optional(v.number()),
    requirePrepayment: v.optional(v.boolean()),
    dunningContactEmail: v.optional(v.string()),
    dunningContactPhone: v.optional(v.string()),
    dunningContactName: v.optional(v.string()),
    preferredDunningMethod: v.optional(dunningMethodValidator),
    lastModifiedBy: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const existing = await ctx.db.get(id)
    if (!existing || existing.deletedAt) {
      throw new Error('Dunning configuration not found')
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return { id }
  },
})

/**
 * Suspend customer service
 */
export const suspendService = mutation({
  args: {
    id: v.id('customerDunningConfigTable'),
    suspendedBy: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Dunning configuration not found')
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      serviceSuspended: true,
      serviceSuspendedDate: now,
      serviceSuspendedBy: args.suspendedBy,
      serviceSuspensionReason: args.reason,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Reactivate customer service
 */
export const reactivateService = mutation({
  args: {
    id: v.id('customerDunningConfigTable'),
    reactivatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Dunning configuration not found')
    }

    const now = Date.now()
    await ctx.db.patch(args.id, {
      serviceSuspended: false,
      serviceReactivatedDate: now,
      serviceReactivatedBy: args.reactivatedBy,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Delete dunning configuration (soft delete)
 */
export const deleteDunningConfig = mutation({
  args: {
    id: v.id('customerDunningConfigTable'),
    deletedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.deletedAt) {
      throw new Error('Dunning configuration not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// ============================================================================
// Export All Mutations
// ============================================================================

export default {
  // Customer Margins
  createMargin,
  updateMargin,
  deleteMargin,

  // Contact Log
  createContact,
  updateContact,
  completeFollowUp,
  deleteContact,

  // Analytics
  upsertAnalytics,
  deleteAnalytics,

  // Dunning Config
  createDunningConfig,
  updateDunningConfig,
  suspendService,
  reactivateService,
  deleteDunningConfig,
}
