// convex/lib/boilerplate/stripe/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';

/**
 * Get customer by user ID
 * 🔒 Authentication: Optional
 */
export const getCustomerByUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      return null;
    }

    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .first();
    return customer;
  },
});

/**
 * Get customer by Stripe ID
 * 🔒 Authentication: Optional
 */
export const getCustomerByStripeId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { stripeCustomerId }) => {
    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_stripe_customer_id', (q) => q.eq('stripeCustomerId', stripeCustomerId))
      .first();
    return customer;
  },
});

/**
 * Get customer by email
 * 🔒 Authentication: Optional
 */
export const getCustomerByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    return customer;
  },
});

/**
 * Get active subscription
 * 🔒 Authentication: Optional
 */
export const getActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_auth_user_id_status', (q) => 
        q.eq('authUserId', user.authUserId).eq('status', 'active')
      )
      .first();

    if (!subscription) {
      const trialingSubscription = await ctx.db
        .query('stripeSubscriptions')
        .withIndex('by_auth_user_id_status', (q) => 
          q.eq('authUserId', user.authUserId).eq('status', 'trialing')
        )
        .first();
      return trialingSubscription;
    }

    return subscription;
  },
});

/**
 * Get subscriptions by user ID
 * 🔒 Authentication: Required
 */
export const getSubscriptionsByUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const subscriptions = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .order('desc')
      .collect();
    return subscriptions;
  },
});

/**
 * Get subscription by Stripe ID
 * 🔒 Authentication: Optional
 */
export const getSubscriptionByStripeId = query({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', stripeSubscriptionId)
      )
      .first();
    return subscription;
  },
});

/**
 * Get all active subscriptions
 * 🔒 Authentication: Optional (admin use)
 */
export const getAllActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();
    return subscriptions;
  },
});

/**
 * Get payments by user ID
 * 🔒 Authentication: Required
 */
export const getPaymentsByUserId = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const limit = args.limit || 50;

    const payments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .order('desc')
      .take(limit);
    return payments;
  },
});

/**
 * Get payment by intent ID
 * 🔒 Authentication: Optional
 */
export const getPaymentByIntentId = query({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, { paymentIntentId }) => {
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', paymentIntentId)
      )
      .first();
    return payment;
  },
});

/**
 * Get successful payments by user ID
 * 🔒 Authentication: Required
 */
export const getSuccessfulPaymentsByUserId = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const limit = args.limit || 50;

    const allPayments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .order('desc')
      .collect();

    const successfulPayments = allPayments
      .filter((p) => p.status === 'succeeded')
      .slice(0, limit);

    return successfulPayments;
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
      v.literal('canceled'),
      v.literal('refunded')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const payments = await ctx.db
      .query('stripePayments')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .order('desc')
      .take(limit);
    return payments;
  },
});

/**
 * Get user revenue analytics
 * 🔒 Authentication: Required
 */
export const getUserRevenueAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const payments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .collect();

    const successfulPayments = payments.filter((p) => p.status === 'succeeded');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const refundedPayments = payments.filter((p) => p.refunded);
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    return {
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter((p) => p.status === 'failed').length,
      refundedPayments: refundedPayments.length,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
    };
  },
});

/**
 * Get platform revenue analytics
 * 🔒 Authentication: Optional (admin use)
 */
export const getPlatformRevenueAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query('stripePayments').collect();
    const subscriptions = await ctx.db.query('stripeSubscriptions').collect();
    const customers = await ctx.db.query('stripeCustomers').collect();

    const successfulPayments = payments.filter((p) => p.status === 'succeeded');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const refundedPayments = payments.filter((p) => p.refunded);
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'active' || s.status === 'trialing'
    );

    return {
      totalCustomers: customers.length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      averagePayment: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
    };
  },
});