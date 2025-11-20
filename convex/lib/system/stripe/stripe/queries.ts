// convex/lib/boilerplate/stripe/stripe/queries.ts
// Query operations for stripe module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser, requireCurrentUser } from '@/shared/auth.helper';
import { STRIPE_CONSTANTS } from './constants';
import {
  canViewCustomer,
  canViewSubscription,
  canViewPayment,
  canViewAnalytics,
  filterCustomersByAccess,
  filterSubscriptionsByAccess,
  filterPaymentsByAccess,
} from './permissions';
import { calculateMRR, calculateARR } from './utils';

/**
 * Get customer by ID
 * Authentication: Required
 * Authorization: Owner or Admin
 */
export const getCustomer = query({
  args: {
    customerId: v.id('stripeCustomers'),
  },
  handler: async (ctx, { customerId }) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Fetch customer
    const customer = await ctx.db.get(customerId);

    if (!customer) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    // 3. Soft delete filtering
    if (customer.deletedAt) {
      return null;
    }

    // 4. Authorization
    if (!(await canViewCustomer(ctx, customer))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    return customer;
  },
});

/**
 * Get customer by user ID
 * Authentication: Optional
 * Authorization: Current user
 */
export const getCustomerByUserId = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    // 2. Query by auth user ID
    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return customer;
  },
});

/**
 * Get customer by Stripe ID
 * Authentication: Required
 * Authorization: Admin only
 */
export const getCustomerByStripeId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { stripeCustomerId }) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Query
    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_stripe_customer_id', (q) =>
        q.eq('stripeCustomerId', stripeCustomerId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!customer) {
      return null;
    }

    // 3. Authorization
    if (!(await canViewCustomer(ctx, customer))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    return customer;
  },
});

/**
 * List all customers
 * Authentication: Required
 * Authorization: Admin only for all, users see their own
 */
export const listCustomers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;
    const customers = await ctx.db
      .query('stripeCustomers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    // 3. Access control filtering
    return await filterCustomersByAccess(ctx, customers);
  },
});

/**
 * Get subscription by ID
 * Authentication: Required
 * Authorization: Owner or Admin
 */
export const getSubscription = query({
  args: {
    subscriptionId: v.id('stripeSubscriptions'),
  },
  handler: async (ctx, { subscriptionId }) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Fetch subscription
    const subscription = await ctx.db.get(subscriptionId);

    if (!subscription) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    // 3. Soft delete filtering
    if (subscription.deletedAt) {
      return null;
    }

    // 4. Authorization
    if (!(await canViewSubscription(ctx, subscription))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    return subscription;
  },
});

/**
 * Get active subscription for current user
 * Authentication: Optional
 * Authorization: Current user
 */
export const getActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    // 2. Query for active subscription
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_auth_user_id_status', (q) =>
        q.eq('authUserId', user.authUserId).eq('status', 'active')
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (subscription) {
      return subscription;
    }

    // 3. Fallback to trialing subscription
    const trialingSubscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_auth_user_id_status', (q) =>
        q.eq('authUserId', user.authUserId).eq('status', 'trialing')
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return trialingSubscription;
  },
});

/**
 * Get subscriptions by user ID
 * Authentication: Required
 * Authorization: Current user
 */
export const getSubscriptionsByUserId = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Query
    const subscriptions = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect();

    return subscriptions;
  },
});

/**
 * Get subscription by Stripe ID
 * Authentication: Required
 * Authorization: Owner or Admin
 */
export const getSubscriptionByStripeId = query({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Query
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', stripeSubscriptionId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      return null;
    }

    // 3. Authorization
    if (!(await canViewSubscription(ctx, subscription))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    return subscription;
  },
});

/**
 * List all subscriptions
 * Authentication: Required
 * Authorization: Admin only for all, users see their own
 */
export const listSubscriptions = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('canceled'),
        v.literal('incomplete'),
        v.literal('incomplete_expired'),
        v.literal('past_due'),
        v.literal('trialing'),
        v.literal('unpaid')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;

    let subscriptions;
    if (args.status) {
      subscriptions = await ctx.db
        .query('stripeSubscriptions')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    } else {
      subscriptions = await ctx.db
        .query('stripeSubscriptions')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    }

    // 3. Access control filtering
    return await filterSubscriptionsByAccess(ctx, subscriptions);
  },
});

/**
 * Get payment by ID
 * Authentication: Required
 * Authorization: Owner or Admin
 */
export const getPayment = query({
  args: {
    paymentId: v.id('stripePayments'),
  },
  handler: async (ctx, { paymentId }) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Fetch payment
    const payment = await ctx.db.get(paymentId);

    if (!payment) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    // 3. Soft delete filtering
    if (payment.deletedAt) {
      return null;
    }

    // 4. Authorization
    if (!(await canViewPayment(ctx, payment))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    return payment;
  },
});

/**
 * Get payments by user ID
 * Authentication: Required
 * Authorization: Current user
 */
export const getPaymentsByUserId = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;
    const payments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    return payments;
  },
});

/**
 * Get payment by intent ID
 * Authentication: Optional
 * Authorization: Owner or Admin
 */
export const getPaymentByIntentId = query({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, { paymentIntentId }) => {
    // 1. Query
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', paymentIntentId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!payment) {
      return null;
    }

    // 2. Authorization (optional - webhook access)
    const user = await getCurrentUser(ctx);
    if (user && payment.authUserId) {
      if (!(await canViewPayment(ctx, payment))) {
        throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.NOT_AUTHORIZED);
      }
    }

    return payment;
  },
});

/**
 * List all payments
 * Authentication: Required
 * Authorization: Admin only for all, users see their own
 */
export const listPayments = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('processing'),
        v.literal('succeeded'),
        v.literal('failed'),
        v.literal('canceled'),
        v.literal('refunded')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    await requireCurrentUser(ctx);

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;

    let payments;
    if (args.status) {
      payments = await ctx.db
        .query('stripePayments')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    } else {
      payments = await ctx.db
        .query('stripePayments')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    }

    // 3. Access control filtering
    return await filterPaymentsByAccess(ctx, payments);
  },
});

/**
 * Get successful payments by user ID
 * Authentication: Required
 * Authorization: Current user
 */
export const getSuccessfulPaymentsByUserId = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;
    const allPayments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect();

    // 3. Filter by status
    const successfulPayments = allPayments
      .filter((p) => p.status === 'succeeded')
      .slice(0, limit);

    return successfulPayments;
  },
});

/**
 * Get user revenue analytics
 * Authentication: Required
 * Authorization: Current user
 */
export const getUserRevenueAnalytics = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Query payments
    const payments = await ctx.db
      .query('stripePayments')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // 3. Calculate analytics
    const successfulPayments = payments.filter((p) => p.status === 'succeeded');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const refundedPayments = payments.filter((p) => p.refunded);
    const totalRefunded = refundedPayments.reduce(
      (sum, p) => sum + (p.refundAmount || 0),
      0
    );

    return {
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter((p) => p.status === 'failed').length,
      refundedPayments: refundedPayments.length,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      averagePayment:
        successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
    };
  },
});

/**
 * Get platform revenue analytics
 * Authentication: Required
 * Authorization: Admin only
 */
export const getPlatformRevenueAnalytics = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication & Authorization
    await requireCurrentUser(ctx);

    if (!(await canViewAnalytics(ctx))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
    }

    // 2. Query all entities
    const payments = await ctx.db
      .query('stripePayments')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const subscriptions = await ctx.db
      .query('stripeSubscriptions')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const customers = await ctx.db
      .query('stripeCustomers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // 3. Calculate analytics
    const successfulPayments = payments.filter((p) => p.status === 'succeeded');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const refundedPayments = payments.filter((p) => p.refunded);
    const totalRefunded = refundedPayments.reduce(
      (sum, p) => sum + (p.refundAmount || 0),
      0
    );

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
      averagePayment:
        successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
    };
  },
});

/**
 * Get subscription analytics
 * Authentication: Required
 * Authorization: Admin only
 */
export const getSubscriptionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication & Authorization
    await requireCurrentUser(ctx);

    if (!(await canViewAnalytics(ctx))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
    }

    // 2. Query subscriptions
    const subscriptions = await ctx.db
      .query('stripeSubscriptions')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // 3. Calculate analytics
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
    const trialingSubscriptions = subscriptions.filter((s) => s.status === 'trialing');
    const canceledSubscriptions = subscriptions.filter((s) => s.status === 'canceled');
    const pastDueSubscriptions = subscriptions.filter((s) => s.status === 'past_due');

    const mrr = calculateMRR(subscriptions);
    const arr = calculateARR(mrr);

    return {
      activeSubscriptions: activeSubscriptions.length,
      trialingSubscriptions: trialingSubscriptions.length,
      canceledSubscriptions: canceledSubscriptions.length,
      pastDueSubscriptions: pastDueSubscriptions.length,
      monthlyRecurringRevenue: mrr,
      annualRecurringRevenue: arr,
      churnRate:
        subscriptions.length > 0
          ? canceledSubscriptions.length / subscriptions.length
          : 0,
    };
  },
});

/**
 * Get webhook event by ID
 * Authentication: Required
 * Authorization: Admin only
 */
export const getWebhookEvent = query({
  args: {
    eventId: v.id('stripeWebhookEvents'),
  },
  handler: async (ctx, { eventId }) => {
    // 1. Authentication & Authorization
    await requireCurrentUser(ctx);

    if (!(await canViewAnalytics(ctx))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
    }

    // 2. Fetch webhook event
    const event = await ctx.db.get(eventId);

    if (!event || event.deletedAt) {
      return null;
    }

    return event;
  },
});

/**
 * List webhook events
 * Authentication: Required
 * Authorization: Admin only
 */
export const listWebhookEvents = query({
  args: {
    eventType: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('processing'),
        v.literal('succeeded'),
        v.literal('failed'),
        v.literal('retrying')
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    await requireCurrentUser(ctx);

    if (!(await canViewAnalytics(ctx))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
    }

    // 2. Query
    const limit = args.limit || STRIPE_CONSTANTS.DEFAULTS.PAGE_SIZE;

    let events;
    if (args.status) {
      events = await ctx.db
        .query('stripeWebhookEvents')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    } else if (args.eventType) {
      events = await ctx.db
        .query('stripeWebhookEvents')
        .withIndex('by_event_type', (q) => q.eq('eventType', args.eventType!))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    } else {
      events = await ctx.db
        .query('stripeWebhookEvents')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .order('desc')
        .take(limit);
    }

    return events;
  },
});
