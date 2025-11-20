// convex/lib/boilerplate/stripe/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';

/**
 * Upsert Stripe customer
 * 🔒 Authentication: Required
 */
export const upsertCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedStripeCustomerId = args.stripeCustomerId.trim();
    const trimmedEmail = args.email.trim();
    const trimmedName = args.name?.trim();

    // 3. Find existing customer
    const now = Date.now();
    const existing = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .first();

    // 4. Update or insert customer
    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: trimmedStripeCustomerId,
        email: trimmedEmail,
        name: trimmedName,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 5. Create audit log for update
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.customer.update',
        entityType: 'stripe_customers',
        entityId: existing._id,
        entityTitle: trimmedEmail,
        description: `Updated Stripe customer: ${trimmedEmail}`,
        metadata: {
          stripeCustomerId: trimmedStripeCustomerId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // 6. Insert new customer
      const customerId = await ctx.db.insert('stripeCustomers', {
        authUserId: user.authUserId,
        stripeCustomerId: trimmedStripeCustomerId,
        email: trimmedEmail,
        name: trimmedName,
        metadata: args.metadata,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 7. Create audit log for creation
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.customer.create',
        entityType: 'stripe_customers',
        entityId: customerId,
        entityTitle: trimmedEmail,
        description: `Created Stripe customer: ${trimmedEmail}`,
        metadata: {
          stripeCustomerId: trimmedStripeCustomerId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return customerId;
    }
  },
});

/**
 * Delete Stripe customer
 * 🔒 Authentication: Required
 */
export const deleteCustomer = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Find customer
    const customer = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .first();

    if (customer) {
      // 3. Soft delete customer
      const now = Date.now();
      await ctx.db.patch(customer._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 4. Create audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.customer.delete',
        entityType: 'stripe_customers',
        entityId: customer._id,
        entityTitle: customer.email,
        description: `Deleted Stripe customer: ${customer.email}`,
        metadata: {
          stripeCustomerId: customer.stripeCustomerId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // 5. Return success
    return { success: true };
  },
});

/**
 * Upsert Stripe subscription
 * 🔒 Authentication: Required
 */
export const upsertSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    stripeProductId: v.string(),
    status: v.union(
      v.literal('active'),
      v.literal('canceled'),
      v.literal('incomplete'),
      v.literal('incomplete_expired'),
      v.literal('past_due'),
      v.literal('trialing'),
      v.literal('unpaid')
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedStripeCustomerId = args.stripeCustomerId.trim();
    const trimmedStripeSubscriptionId = args.stripeSubscriptionId.trim();
    const trimmedStripePriceId = args.stripePriceId.trim();
    const trimmedStripeProductId = args.stripeProductId.trim();

    // 3. Find existing subscription
    const now = Date.now();
    const existing = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', trimmedStripeSubscriptionId)
      )
      .first();

    // 4. Update or insert subscription
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        canceledAt: args.canceledAt,
        trialStart: args.trialStart,
        trialEnd: args.trialEnd,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 5. Create audit log for update
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.subscription.update',
        entityType: 'stripe_subscriptions',
        entityId: existing._id,
        entityTitle: trimmedStripeSubscriptionId,
        description: `Updated Stripe subscription: ${trimmedStripeSubscriptionId}`,
        metadata: {
          status: args.status,
          stripeProductId: trimmedStripeProductId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // 6. Insert new subscription
      const subscriptionId = await ctx.db.insert('stripeSubscriptions', {
        authUserId: user.authUserId,
        stripeCustomerId: trimmedStripeCustomerId,
        stripeSubscriptionId: trimmedStripeSubscriptionId,
        stripePriceId: trimmedStripePriceId,
        stripeProductId: trimmedStripeProductId,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        canceledAt: args.canceledAt,
        trialStart: args.trialStart,
        trialEnd: args.trialEnd,
        metadata: args.metadata,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 7. Create audit log for creation
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.subscription.create',
        entityType: 'stripe_subscriptions',
        entityId: subscriptionId,
        entityTitle: trimmedStripeSubscriptionId,
        description: `Created Stripe subscription: ${trimmedStripeSubscriptionId}`,
        metadata: {
          status: args.status,
          stripeProductId: trimmedStripeProductId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return subscriptionId;
    }
  },
});

/**
 * Update subscription status
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const updateSubscriptionStatus = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal('active'),
      v.literal('canceled'),
      v.literal('incomplete'),
      v.literal('incomplete_expired'),
      v.literal('past_due'),
      v.literal('trialing'),
      v.literal('unpaid')
    ),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.number()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. No authentication (webhook-triggered)

    // 2. Trim string fields
    const trimmedStripeSubscriptionId = args.stripeSubscriptionId.trim();
    const { stripeSubscriptionId, ...updates } = args;

    // 3. Find subscription
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', trimmedStripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      throw new Error(`Subscription not found: ${trimmedStripeSubscriptionId}`);
    }

    // 4. Update subscription status
    const now = Date.now();
    await ctx.db.patch(subscription._id, {
      ...updates,
      updatedAt: now,
      updatedBy: undefined,
    });

    // 5. Return subscription ID
    return subscription._id;
  },
});

/**
 * Delete subscription
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const deleteSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    // 1. No authentication (webhook-triggered)

    // 2. Trim string fields
    const trimmedStripeSubscriptionId = stripeSubscriptionId.trim();

    // 3. Find subscription
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', trimmedStripeSubscriptionId)
      )
      .first();

    if (subscription) {
      // 4. Soft delete subscription
      const now = Date.now();
      await ctx.db.patch(subscription._id, {
        deletedAt: now,
        deletedBy: undefined,
        updatedAt: now,
        updatedBy: undefined,
      });
    }

    // 5. Return success
    return { success: true };
  },
});

/**
 * Upsert payment
 * 🔒 Authentication: Required
 */
export const upsertPayment = mutation({
  args: {
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.string(),
    stripeChargeId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('canceled'),
      v.literal('refunded')
    ),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedStripeCustomerId = args.stripeCustomerId?.trim();
    const trimmedStripePaymentIntentId = args.stripePaymentIntentId.trim();
    const trimmedStripeChargeId = args.stripeChargeId?.trim();
    const trimmedCurrency = args.currency.trim();
    const trimmedDescription = args.description?.trim();

    // 3. Find existing payment
    const now = Date.now();
    const existing = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedStripePaymentIntentId)
      )
      .first();

    // 4. Update or insert payment
    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeChargeId: trimmedStripeChargeId,
        status: args.status,
        description: trimmedDescription,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 5. Create audit log for update
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.payment.update',
        entityType: 'stripe_payments',
        entityId: existing._id,
        entityTitle: trimmedStripePaymentIntentId,
        description: `Updated Stripe payment: ${trimmedStripePaymentIntentId}`,
        metadata: {
          status: args.status,
          amount: args.amount,
          currency: trimmedCurrency,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // 6. Insert new payment
      const paymentId = await ctx.db.insert('stripePayments', {
        authUserId: user.authUserId,
        stripeCustomerId: trimmedStripeCustomerId,
        stripePaymentIntentId: trimmedStripePaymentIntentId,
        stripeChargeId: trimmedStripeChargeId,
        amount: args.amount,
        currency: trimmedCurrency,
        status: args.status,
        description: trimmedDescription,
        refunded: undefined,
        refundAmount: undefined,
        refundDate: undefined,
        metadata: args.metadata,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 7. Create audit log for creation
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.payment.create',
        entityType: 'stripe_payments',
        entityId: paymentId,
        entityTitle: trimmedStripePaymentIntentId,
        description: `Created Stripe payment: ${trimmedStripePaymentIntentId}`,
        metadata: {
          status: args.status,
          amount: args.amount,
          currency: trimmedCurrency,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return paymentId;
    }
  },
});

/**
 * Update payment status
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const updatePaymentStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('canceled'),
      v.literal('refunded')
    ),
    stripeChargeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. No authentication (webhook-triggered)

    // 2. Trim string fields
    const trimmedStripePaymentIntentId = args.stripePaymentIntentId.trim();
    const trimmedStripeChargeId = args.stripeChargeId?.trim();
    const { stripePaymentIntentId, stripeChargeId, ...updates } = args;

    // 3. Find payment
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedStripePaymentIntentId)
      )
      .first();

    if (!payment) {
      throw new Error(`Payment not found: ${trimmedStripePaymentIntentId}`);
    }

    // 4. Update payment status
    const now = Date.now();
    await ctx.db.patch(payment._id, {
      ...updates,
      stripeChargeId: trimmedStripeChargeId,
      updatedAt: now,
      updatedBy: undefined,
    });

    // 5. Return payment ID
    return payment._id;
  },
});

/**
 * Mark payment as refunded
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const markPaymentRefunded = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    refundAmount: v.number(),
  },
  handler: async (ctx, { stripePaymentIntentId, refundAmount }) => {
    // 1. No authentication (webhook-triggered)

    // 2. Trim string fields
    const trimmedStripePaymentIntentId = stripePaymentIntentId.trim();

    // 3. Find payment
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedStripePaymentIntentId)
      )
      .first();

    if (!payment) {
      throw new Error(`Payment not found: ${trimmedStripePaymentIntentId}`);
    }

    // 4. Mark payment as refunded
    const now = Date.now();
    await ctx.db.patch(payment._id, {
      status: 'refunded',
      refunded: true,
      refundAmount: refundAmount,
      refundDate: now,
      updatedAt: now,
      updatedBy: undefined,
    });

    // 5. Return payment ID
    return payment._id;
  },
});