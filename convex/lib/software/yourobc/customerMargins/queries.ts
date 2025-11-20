// convex/lib/software/yourobc/customerMargins/queries.ts
/**
 * Customer Margins Query Operations
 *
 * Read operations for all 4 tables in the customer margins module:
 * - Customer Margins
 * - Contact Log
 * - Customer Analytics
 * - Customer Dunning Config
 *
 * @module convex/lib/software/yourobc/customerMargins/queries
 */

import { query } from '../../../../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../../../../_generated/dataModel'
import { PAGE_SIZES } from './constants'

// ============================================================================
// Customer Margins Queries
// ============================================================================

/**
 * Get customer margin by ID
 */
export const getMarginById = query({
  args: { id: v.id('customerMarginsTable') },
  handler: async (ctx, args) => {
    const margin = await ctx.db.get(args.id)
    if (!margin || margin.deletedAt) return null
    return margin
  },
})

/**
 * Get customer margin by publicId
 */
export const getMarginByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const margin = await ctx.db
      .query('customerMarginsTable')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return margin
  },
})

/**
 * Get active customer margin for a customer
 */
export const getActiveMarginByCustomer = query({
  args: { customerId: v.id('yourobcCustomers') },
  handler: async (ctx, args) => {
    const margin = await ctx.db
      .query('customerMarginsTable')
      .withIndex('customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return margin
  },
})

/**
 * List all margins for a customer
 */
export const listMarginsByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('customerMarginsTable')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field('isActive'), true))
    }

    const margins = await query.collect()
    return margins
  },
})

/**
 * List margins needing review
 */
export const listMarginsNeedingReview = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const margins = await ctx.db
      .query('customerMarginsTable')
      .withIndex('by_next_review')
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.lte(q.field('nextReviewDate'), now)
        )
      )
      .collect()
    return margins
  },
})

// ============================================================================
// Contact Log Queries
// ============================================================================

/**
 * Get contact log by ID
 */
export const getContactById = query({
  args: { id: v.id('contactLogTable') },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id)
    if (!contact || contact.deletedAt) return null
    return contact
  },
})

/**
 * Get contact log by publicId
 */
export const getContactByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const contact = await ctx.db
      .query('contactLogTable')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return contact
  },
})

/**
 * List contact logs for a customer
 */
export const listContactsByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query('contactLogTable')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit || PAGE_SIZES.MEDIUM)
    return contacts
  },
})

/**
 * List contact logs by date range
 */
export const listContactsByDateRange = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    fromDate: v.number(),
    toDate: v.number(),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query('contactLogTable')
      .withIndex('by_customer_date', (q) =>
        q.eq('customerId', args.customerId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.gte(q.field('contactDate'), args.fromDate),
          q.lte(q.field('contactDate'), args.toDate)
        )
      )
      .collect()
    return contacts
  },
})

/**
 * List pending follow-ups
 */
export const listPendingFollowUps = query({
  args: {
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('contactLogTable')
      .withIndex('by_followUp', (q) => q.eq('requiresFollowUp', true))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('followUpCompleted'), false)
        )
      )

    const contacts = await query.collect()

    if (args.assignedTo) {
      return contacts.filter((c) => c.followUpAssignedTo === args.assignedTo)
    }

    return contacts
  },
})

/**
 * List overdue follow-ups
 */
export const listOverdueFollowUps = query({
  args: {
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    let query = ctx.db
      .query('contactLogTable')
      .withIndex('by_followUp', (q) => q.eq('requiresFollowUp', true))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('followUpCompleted'), false),
          q.lt(q.field('followUpDate'), now)
        )
      )

    const contacts = await query.collect()

    if (args.assignedTo) {
      return contacts.filter((c) => c.followUpAssignedTo === args.assignedTo)
    }

    return contacts
  },
})

/**
 * List contacts by employee
 */
export const listContactsByEmployee = query({
  args: {
    contactedBy: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query('contactLogTable')
      .withIndex('by_contactedBy', (q) => q.eq('contactedBy', args.contactedBy))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit || PAGE_SIZES.MEDIUM)
    return contacts
  },
})

// ============================================================================
// Customer Analytics Queries
// ============================================================================

/**
 * Get analytics by ID
 */
export const getAnalyticsById = query({
  args: { id: v.id('customerAnalyticsTable') },
  handler: async (ctx, args) => {
    const analytics = await ctx.db.get(args.id)
    if (!analytics || analytics.deletedAt) return null
    return analytics
  },
})

/**
 * Get analytics by publicId
 */
export const getAnalyticsByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return analytics
  },
})

/**
 * Get latest analytics for customer
 */
export const getLatestAnalyticsByCustomer = query({
  args: { customerId: v.id('yourobcCustomers') },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .first()
    return analytics
  },
})

/**
 * Get analytics for specific period
 */
export const getAnalyticsByPeriod = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_customer_period', (q) =>
        q.eq('customerId', args.customerId)
          .eq('year', args.year)
          .eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return analytics
  },
})

/**
 * List analytics for customer
 */
export const listAnalyticsByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit || PAGE_SIZES.MEDIUM)
    return analytics
  },
})

/**
 * List customers needing follow-up
 */
export const listCustomersNeedingFollowUp = query({
  args: {},
  handler: async (ctx) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_followUpAlert', (q) => q.eq('needsFollowUpAlert', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
    return analytics
  },
})

/**
 * Get analytics for period across all customers
 */
export const listAnalyticsByPeriod = query({
  args: {
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query('customerAnalyticsTable')
      .withIndex('by_year_month', (q) =>
        q.eq('year', args.year).eq('month', args.month)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
    return analytics
  },
})

// ============================================================================
// Customer Dunning Config Queries
// ============================================================================

/**
 * Get dunning config by ID
 */
export const getDunningConfigById = query({
  args: { id: v.id('customerDunningConfigTable') },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.id)
    if (!config || config.deletedAt) return null
    return config
  },
})

/**
 * Get dunning config by publicId
 */
export const getDunningConfigByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('customerDunningConfigTable')
      .withIndex('by_publicId', (q) => q.eq('publicId', args.publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return config
  },
})

/**
 * Get active dunning config for customer
 */
export const getActiveDunningConfigByCustomer = query({
  args: { customerId: v.id('yourobcCustomers') },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('customerDunningConfigTable')
      .withIndex('by_customer_active', (q) =>
        q.eq('customerId', args.customerId).eq('isActive', true)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first()
    return config
  },
})

/**
 * List all dunning configs for customer
 */
export const listDunningConfigsByCustomer = query({
  args: {
    customerId: v.id('yourobcCustomers'),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('customerDunningConfigTable')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field('isActive'), true))
    }

    const configs = await query.collect()
    return configs
  },
})

/**
 * List suspended customers
 */
export const listSuspendedCustomers = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db
      .query('customerDunningConfigTable')
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('serviceSuspended'), true)
        )
      )
      .collect()
    return configs
  },
})

/**
 * List customers with service restrictions
 */
export const listCustomersWithServiceRestrictions = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db
      .query('customerDunningConfigTable')
      .withIndex('by_suspendService', (q) => q.eq('allowServiceWhenOverdue', false))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
    return configs
  },
})

/**
 * List customers requiring prepayment
 */
export const listPrepaymentCustomers = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db
      .query('customerDunningConfigTable')
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('requirePrepayment'), true)
        )
      )
      .collect()
    return configs
  },
})

// ============================================================================
// Combined Queries
// ============================================================================

/**
 * Get complete customer margin profile
 */
export const getCustomerMarginProfile = query({
  args: { customerId: v.id('yourobcCustomers') },
  handler: async (ctx, args) => {
    const [margin, analytics, dunningConfig, recentContacts] = await Promise.all([
      ctx.db
        .query('customerMarginsTable')
        .withIndex('customer_active', (q) =>
          q.eq('customerId', args.customerId).eq('isActive', true)
        )
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first(),
      ctx.db
        .query('customerAnalyticsTable')
        .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .first(),
      ctx.db
        .query('customerDunningConfigTable')
        .withIndex('by_customer_active', (q) =>
          q.eq('customerId', args.customerId).eq('isActive', true)
        )
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first(),
      ctx.db
        .query('contactLogTable')
        .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(5),
    ])

    return {
      margin,
      analytics,
      dunningConfig,
      recentContacts,
    }
  },
})

// ============================================================================
// Export All Queries
// ============================================================================

export default {
  // Customer Margins
  getMarginById,
  getMarginByPublicId,
  getActiveMarginByCustomer,
  listMarginsByCustomer,
  listMarginsNeedingReview,

  // Contact Log
  getContactById,
  getContactByPublicId,
  listContactsByCustomer,
  listContactsByDateRange,
  listPendingFollowUps,
  listOverdueFollowUps,
  listContactsByEmployee,

  // Analytics
  getAnalyticsById,
  getAnalyticsByPublicId,
  getLatestAnalyticsByCustomer,
  getAnalyticsByPeriod,
  listAnalyticsByCustomer,
  listCustomersNeedingFollowUp,
  listAnalyticsByPeriod,

  // Dunning Config
  getDunningConfigById,
  getDunningConfigByPublicId,
  getActiveDunningConfigByCustomer,
  listDunningConfigsByCustomer,
  listSuspendedCustomers,
  listCustomersWithServiceRestrictions,
  listPrepaymentCustomers,

  // Combined
  getCustomerMarginProfile,
}
