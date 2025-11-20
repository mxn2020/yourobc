// convex/lib/boilerplate/stripe-connect/queries.ts

/**
 * Stripe Connect Queries
 *
 * Query functions for retrieving Stripe Connect data from Convex
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { vStripeEventType } from '@/shared/validators';

// ============================================
// Connected Account Queries
// ============================================

/**
 * Get all connected accounts
 * 🔒 Authentication: Optional (admin use)
 */
export const getAllConnectedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query('connectedAccounts').collect();
    return accounts;
  },
});

/**
 * Get connected account by ID
 * 🔒 Authentication: Optional
 */
export const getConnectedAccount = query({
  args: {
    accountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { accountId }) => {
    // ✅ Direct O(1) lookup
    const account = await ctx.db.get(accountId);
    return account;
  },
});

/**
 * Get connected account by Stripe account ID
 * 🔒 Authentication: Optional
 */
export const getConnectedAccountByStripeId = query({
  args: {
    stripeAccountId: v.string(),
  },
  handler: async (ctx, { stripeAccountId }) => {
    const account = await ctx.db
      .query('connectedAccounts')
      .withIndex('by_stripe_account_id', (q) => q.eq('stripeAccountId', stripeAccountId))
      .first();
    return account;
  },
});

/**
 * Get connected account by client email
 * 🔒 Authentication: Optional
 */
export const getConnectedAccountByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query('connectedAccounts')
      .withIndex('by_client_email', (q) => q.eq('clientEmail', email))
      .first();
    return account;
  },
});

/**
 * Get active connected accounts
 * 🔒 Authentication: Optional (admin use)
 */
export const getActiveConnectedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query('connectedAccounts')
      .withIndex('by_account_status', (q) => q.eq('accountStatus', 'active'))
      .collect();
    return accounts;
  },
});

/**
 * Get accounts pending onboarding
 * 🔒 Authentication: Optional (admin use)
 */
export const getPendingOnboardingAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db
      .query('connectedAccounts')
      .withIndex('by_onboarding_completed', (q) => q.eq('onboarding_completed', false))
      .collect();
    return accounts;
  },
});

/**
 * Get connected account by public ID
 * 🔒 Authentication: Optional
 */
export const getConnectedAccountByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query('connectedAccounts')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();
  },
});

// ============================================
// Product Queries
// ============================================

/**
 * Get all products for a connected account
 * 🔒 Authentication: Optional
 */
export const getProductsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { connectedAccountId }) => {
    const products = await ctx.db
      .query('clientProducts')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', connectedAccountId)
      )
      .collect();
    return products;
  },
});

/**
 * Get active products for a connected account
 * 🔒 Authentication: Optional
 */
export const getActiveProductsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { connectedAccountId }) => {
    const products = await ctx.db
      .query('clientProducts')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', connectedAccountId)
      )
      .filter((q) => q.eq(q.field('active'), true))
      .collect();
    return products;
  },
});

/**
 * Get product by ID
 * 🔒 Authentication: Optional
 */
export const getProduct = query({
  args: {
    productId: v.id('clientProducts'),
  },
  handler: async (ctx, { productId }) => {
    // ✅ Direct O(1) lookup
    const product = await ctx.db.get(productId);
    return product;
  },
});

/**
 * Get product by Stripe product ID
 * 🔒 Authentication: Optional
 */
export const getProductByStripeId = query({
  args: {
    stripeProductId: v.string(),
  },
  handler: async (ctx, { stripeProductId }) => {
    const product = await ctx.db
      .query('clientProducts')
      .withIndex('by_stripe_product_id', (q) => q.eq('stripeProductId', stripeProductId))
      .first();
    return product;
  },
});

/**
 * Get client product by public ID
 * 🔒 Authentication: Optional
 */
export const getClientProductByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query('clientProducts')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();
  },
});

// ============================================
// Payment Queries
// ============================================

/**
 * Get all payments for a connected account
 * 🔒 Authentication: Optional
 */
export const getPaymentsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', args.connectedAccountId)
      )
      .order('desc')
      .take(limit);
    return payments;
  },
});

/**
 * Get payment by ID
 * 🔒 Authentication: Optional
 */
export const getPayment = query({
  args: {
    paymentId: v.id('clientPayments'),
  },
  handler: async (ctx, { paymentId }) => {
    // ✅ Direct O(1) lookup
    const payment = await ctx.db.get(paymentId);
    return payment;
  },
});

/**
 * Get payment by Stripe payment intent ID
 * 🔒 Authentication: Optional
 */
export const getPaymentByStripeId = query({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, { stripePaymentIntentId }) => {
    const payment = await ctx.db
      .query('clientPayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', stripePaymentIntentId)
      )
      .first();
    return payment;
  },
});

/**
 * Get client payment by public ID
 * 🔒 Authentication: Optional
 */
export const getClientPaymentByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query('clientPayments')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();
  },
});

/**
 * Get successful payments for a connected account
 * 🔒 Authentication: Optional
 */
export const getSuccessfulPayments = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', args.connectedAccountId)
      )
      .filter((q) => q.eq(q.field('status'), 'succeeded'))
      .order('desc')
      .take(limit);
    return payments;
  },
});

/**
 * Get payments by status
 * 🔒 Authentication: Optional (admin use)
 */
export const getPaymentsByStatus = query({
  args: {
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('cancelled'),
      v.literal('refunded')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .take(limit);
    return payments;
  },
});

/**
 * Get subscriptions for a connected account
 * 🔒 Authentication: Optional
 */
export const getSubscriptionsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { connectedAccountId }) => {
    const subscriptions = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', connectedAccountId)
      )
      .filter((q) => q.eq(q.field('paymentType'), 'subscription'))
      .collect();
    return subscriptions;
  },
});

/**
 * Get active subscriptions for a connected account
 * 🔒 Authentication: Optional
 */
export const getActiveSubscriptionsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { connectedAccountId }) => {
    const subscriptions = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', connectedAccountId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('paymentType'), 'subscription'),
          q.eq(q.field('subscription_status'), 'active')
        )
      )
      .collect();
    return subscriptions;
  },
});

// ============================================
// Analytics Queries
// ============================================

/**
 * Get revenue analytics for a connected account
 * 🔒 Authentication: Optional
 */
export const getAccountRevenue = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let paymentsQuery = ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', args.connectedAccountId)
      )
      .filter((q) => q.eq(q.field('status'), 'succeeded'));

    const payments = await paymentsQuery.collect();

    // Filter by date range if provided
    const filteredPayments = payments.filter((payment) => {
      if (args.startDate && payment.createdAt < args.startDate) return false;
      if (args.endDate && payment.createdAt > args.endDate) return false;
      return true;
    });

    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalFees = filteredPayments.reduce(
      (sum, payment) => sum + payment.application_fee_amount,
      0
    );
    const netRevenue = filteredPayments.reduce((sum, payment) => sum + payment.net_amount, 0);

    return {
      totalPayments: filteredPayments.length,
      totalRevenue,
      totalFees,
      netRevenue,
      averagePayment: filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0,
      successfulPayments: filteredPayments.length,
      period: {
        start: args.startDate || 0,
        end: args.endDate || Date.now(),
      },
    };
  },
});

/**
 * Get platform-wide revenue analytics
 * 🔒 Authentication: Optional (admin use)
 */
export const getPlatformRevenue = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_status', (q) => q.eq('status', 'succeeded'))
      .collect();

    // Filter by date range if provided
    const filteredPayments = payments.filter((payment) => {
      if (args.startDate && payment.createdAt < args.startDate) return false;
      if (args.endDate && payment.createdAt > args.endDate) return false;
      return true;
    });

    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalFees = filteredPayments.reduce(
      (sum, payment) => sum + payment.application_fee_amount,
      0
    );
    const netRevenue = filteredPayments.reduce((sum, payment) => sum + payment.net_amount, 0);

    return {
      totalPayments: filteredPayments.length,
      totalRevenue,
      totalFees, // Platform's earnings
      netRevenue, // Total paid to all clients
      averagePayment: filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0,
      successfulPayments: filteredPayments.length,
      period: {
        start: args.startDate || 0,
        end: args.endDate || Date.now(),
      },
    };
  },
});

/**
 * Get payment statistics for a connected account
 * 🔒 Authentication: Optional
 */
export const getAccountPaymentStats = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { connectedAccountId }) => {
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', connectedAccountId)
      )
      .collect();

    const succeeded = payments.filter((p) => p.status === 'succeeded').length;
    const failed = payments.filter((p) => p.status === 'failed').length;
    const refunded = payments.filter((p) => p.refunded).length;
    const subscriptions = payments.filter((p) => p.paymentType === 'subscription').length;
    const oneTime = payments.filter((p) => p.paymentType === 'one_time').length;

    return {
      total: payments.length,
      succeeded,
      failed,
      refunded,
      subscriptions,
      oneTime,
      successRate: payments.length > 0 ? (succeeded / payments.length) * 100 : 0,
    };
  },
});

/**
 * Get comprehensive analytics for a connected account
 * 🔒 Authentication: Optional
 */
export const getAccountAnalytics = query({
  args: {
    accountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { accountId }) => {
    const payments = await ctx.db
      .query('clientPayments')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', accountId)
      )
      .collect();

    const successfulPayments = payments.filter((p) => p.status === 'succeeded');

    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalApplicationFees = successfulPayments.reduce(
      (sum, payment) => sum + payment.application_fee_amount,
      0
    );
    const netRevenue = successfulPayments.reduce((sum, payment) => sum + payment.net_amount, 0);

    return {
      totalRevenue,
      totalApplicationFees,
      netRevenue,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter((p) => p.status === 'failed').length,
      refundedPayments: payments.filter((p) => p.refunded).length,
      subscriptions: payments.filter((p) => p.paymentType === 'subscription').length,
      oneTimePayments: payments.filter((p) => p.paymentType === 'one_time').length,
      averagePayment: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
      successRate: payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0,
    };
  },
});

/**
 * Get platform-wide analytics across all connected accounts
 * 🔒 Authentication: Optional (admin use)
 */
export const getPlatformAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query('clientPayments').collect();
    const accounts = await ctx.db.query('connectedAccounts').collect();

    const successfulPayments = payments.filter((p) => p.status === 'succeeded');
    const activeAccounts = accounts.filter((a) => a.accountStatus === 'active');

    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalApplicationFees = successfulPayments.reduce(
      (sum, payment) => sum + payment.application_fee_amount,
      0
    );
    const netRevenue = successfulPayments.reduce((sum, payment) => sum + payment.net_amount, 0);

    return {
      totalRevenue,
      totalApplicationFees,
      netRevenue,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter((p) => p.status === 'failed').length,
      activeAccountCount: activeAccounts.length,
      totalAccountCount: accounts.length,
      averagePayment: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
      averageRevenuePerAccount: activeAccounts.length > 0 ? totalRevenue / activeAccounts.length : 0,
    };
  },
});

// ============================================
// Event Queries
// ============================================

/**
 * Get events for a connected account
 * 🔒 Authentication: Optional
 */
export const getEventsByAccount = query({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const events = await ctx.db
      .query('connectEvents')
      .withIndex('by_connected_account_id', (q) =>
        q.eq('connectedAccountId', args.connectedAccountId)
      )
      .order('desc')
      .take(limit);
    return events;
  },
});

/**
 * Get events by type
 * 🔒 Authentication: Optional (admin use)
 */
export const getEventsByType = query({
  args: {
    eventType: vStripeEventType(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const events = await ctx.db
      .query('connectEvents')
      .withIndex('by_event_type', (q) => q.eq('eventType', args.eventType))
      .order('desc')
      .take(limit);
    return events;
  },
});

/**
 * Get unprocessed events
 * 🔒 Authentication: Optional (admin use)
 */
export const getUnprocessedEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query('connectEvents')
      .withIndex('by_processed', (q) => q.eq('processed', false))
      .collect();
    return events;
  },
});