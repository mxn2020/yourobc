// convex/lib/boilerplate/stripe/stripe/mutations.ts
// Mutation operations for stripe module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { STRIPE_CONSTANTS } from './constants';
import {
  assertCanUpdateCustomer,
  assertCanCancelSubscription,
  assertCanRefundPayment,
  isAdmin,
} from './permissions';
import {
  validateCustomerInput,
  validateSubscriptionInput,
  validatePaymentInput,
  generateCustomerPublicId,
  generateSubscriptionPublicId,
  generatePaymentPublicId,
  generateWebhookPublicId,
  trimObjectFields,
  canRefundPayment,
} from './utils';
import { stripeValidators } from '@/schema/boilerplate/stripe/stripe/validators';

/**
 * Upsert Stripe customer
 * Authentication: Required
 * Authorization: Current user (creates/updates own record)
 */
export const upsertCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 3. Validation
    const validation = validateCustomerInput({
      email: trimmedArgs.email,
      name: trimmedArgs.name,
      description: trimmedArgs.description,
      phone: trimmedArgs.phone,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors?.join(', ') || STRIPE_CONSTANTS.ERROR_MESSAGES.INVALID_INPUT);
    }

    // 4. Find existing customer
    const now = Date.now();
    const existing = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', user.authUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    // 5. Update or insert customer
    if (existing) {
      // Authorization check
      await assertCanUpdateCustomer(ctx, existing);

      await ctx.db.patch(existing._id, {
        stripeCustomerId: trimmedArgs.stripeCustomerId,
        email: trimmedArgs.email,
        name: trimmedArgs.name || existing.name,
        description: trimmedArgs.description,
        phone: trimmedArgs.phone,
        metadata: trimmedArgs.metadata || existing.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.customer.update',
        entityType: 'stripe_customers',
        entityId: existing._id,
        entityTitle: trimmedArgs.email,
        description: `Updated Stripe customer: ${trimmedArgs.email}`,
        metadata: {
          stripeCustomerId: trimmedArgs.stripeCustomerId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // Insert new customer
      const publicId = generateCustomerPublicId();
      const customerId = await ctx.db.insert('stripeCustomers', {
        publicId,
        ownerId: user._id,
        name: trimmedArgs.name || trimmedArgs.email,
        status: STRIPE_CONSTANTS.CUSTOMER_STATUSES.ACTIVE,
        authUserId: user.authUserId,
        stripeCustomerId: trimmedArgs.stripeCustomerId,
        email: trimmedArgs.email,
        description: trimmedArgs.description,
        phone: trimmedArgs.phone,
        metadata: trimmedArgs.metadata || {},
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.customer.create',
        entityType: 'stripe_customers',
        entityId: customerId,
        entityTitle: trimmedArgs.email,
        description: `Created Stripe customer: ${trimmedArgs.email}`,
        metadata: {
          stripeCustomerId: trimmedArgs.stripeCustomerId,
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
 * Delete Stripe customer (soft delete)
 * Authentication: Required
 * Authorization: Admin only
 */
export const deleteCustomer = mutation({
  args: {
    customerId: v.id('stripeCustomers'),
  },
  handler: async (ctx, { customerId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    if (!(await isAdmin(ctx))) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.ADMIN_ONLY);
    }

    // 3. Find customer
    const customer = await ctx.db.get(customerId);

    if (!customer || customer.deletedAt) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.CUSTOMER_NOT_FOUND);
    }

    // 4. Soft delete customer
    const now = Date.now();
    await ctx.db.patch(customer._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
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

    return { success: true };
  },
});

/**
 * Upsert Stripe subscription
 * Authentication: Required
 * Authorization: Current user (creates/updates own record)
 */
export const upsertSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    stripeProductId: v.string(),
    status: stripeValidators.subscriptionStatus,
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    productName: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 3. Validation
    const validation = validateSubscriptionInput({
      stripeCustomerId: trimmedArgs.stripeCustomerId,
      stripePriceId: trimmedArgs.stripePriceId,
      stripeProductId: trimmedArgs.stripeProductId,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors?.join(', ') || STRIPE_CONSTANTS.ERROR_MESSAGES.INVALID_INPUT);
    }

    // 4. Find existing subscription
    const now = Date.now();
    const existing = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', trimmedArgs.stripeSubscriptionId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    // 5. Update or insert subscription
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: trimmedArgs.status,
        currentPeriodStart: trimmedArgs.currentPeriodStart,
        currentPeriodEnd: trimmedArgs.currentPeriodEnd,
        cancelAtPeriodEnd: trimmedArgs.cancelAtPeriodEnd,
        canceledAt: trimmedArgs.canceledAt,
        trialStart: trimmedArgs.trialStart,
        trialEnd: trimmedArgs.trialEnd,
        productName: trimmedArgs.productName,
        amount: trimmedArgs.amount,
        currency: trimmedArgs.currency,
        metadata: trimmedArgs.metadata || existing.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.subscription.update',
        entityType: 'stripe_subscriptions',
        entityId: existing._id,
        entityTitle: trimmedArgs.stripeSubscriptionId,
        description: `Updated Stripe subscription: ${trimmedArgs.stripeSubscriptionId}`,
        metadata: {
          status: trimmedArgs.status,
          stripeProductId: trimmedArgs.stripeProductId,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // Insert new subscription
      const publicId = generateSubscriptionPublicId();
      const subscriptionId = await ctx.db.insert('stripeSubscriptions', {
        publicId,
        ownerId: user._id,
        name: trimmedArgs.productName || trimmedArgs.stripeProductId,
        status: trimmedArgs.status,
        authUserId: user.authUserId,
        stripeCustomerId: trimmedArgs.stripeCustomerId,
        stripeSubscriptionId: trimmedArgs.stripeSubscriptionId,
        stripePriceId: trimmedArgs.stripePriceId,
        stripeProductId: trimmedArgs.stripeProductId,
        productName: trimmedArgs.productName,
        amount: trimmedArgs.amount,
        currency: trimmedArgs.currency,
        currentPeriodStart: trimmedArgs.currentPeriodStart,
        currentPeriodEnd: trimmedArgs.currentPeriodEnd,
        cancelAtPeriodEnd: trimmedArgs.cancelAtPeriodEnd,
        canceledAt: trimmedArgs.canceledAt,
        trialStart: trimmedArgs.trialStart,
        trialEnd: trimmedArgs.trialEnd,
        metadata: trimmedArgs.metadata || {},
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.subscription.create',
        entityType: 'stripe_subscriptions',
        entityId: subscriptionId,
        entityTitle: trimmedArgs.stripeSubscriptionId,
        description: `Created Stripe subscription: ${trimmedArgs.stripeSubscriptionId}`,
        metadata: {
          status: trimmedArgs.status,
          stripeProductId: trimmedArgs.stripeProductId,
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
 * Update subscription status (webhook-triggered)
 * Authentication: Not required (webhook)
 * Authorization: N/A (webhook)
 */
export const updateSubscriptionStatus = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: stripeValidators.subscriptionStatus,
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.number()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 2. Find subscription
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', trimmedArgs.stripeSubscriptionId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      throw new Error(
        `${STRIPE_CONSTANTS.ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND}: ${trimmedArgs.stripeSubscriptionId}`
      );
    }

    // 3. Update subscription status
    const now = Date.now();
    const updates: any = {
      status: trimmedArgs.status,
      updatedAt: now,
    };

    if (trimmedArgs.cancelAtPeriodEnd !== undefined) {
      updates.cancelAtPeriodEnd = trimmedArgs.cancelAtPeriodEnd;
    }
    if (trimmedArgs.canceledAt !== undefined) {
      updates.canceledAt = trimmedArgs.canceledAt;
    }
    if (trimmedArgs.currentPeriodStart !== undefined) {
      updates.currentPeriodStart = trimmedArgs.currentPeriodStart;
    }
    if (trimmedArgs.currentPeriodEnd !== undefined) {
      updates.currentPeriodEnd = trimmedArgs.currentPeriodEnd;
    }

    await ctx.db.patch(subscription._id, updates);

    return subscription._id;
  },
});

/**
 * Cancel subscription
 * Authentication: Required
 * Authorization: Owner or Admin
 */
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id('stripeSubscriptions'),
    cancelReason: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Find subscription
    const subscription = await ctx.db.get(args.subscriptionId);

    if (!subscription || subscription.deletedAt) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    // 3. Authorization
    await assertCanCancelSubscription(ctx, subscription);

    // 4. Check if already canceled
    if (subscription.status === 'canceled') {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.SUBSCRIPTION_ALREADY_CANCELED);
    }

    // 5. Update subscription
    const now = Date.now();
    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? true,
      canceledAt: now,
      cancelReason: args.cancelReason?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'stripe.subscription.cancel',
      entityType: 'stripe_subscriptions',
      entityId: subscription._id,
      entityTitle: subscription.stripeSubscriptionId,
      description: `Canceled Stripe subscription: ${subscription.stripeSubscriptionId}`,
      metadata: {
        cancelReason: args.cancelReason,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? true,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return { success: true };
  },
});

/**
 * Delete subscription (soft delete)
 * Authentication: Not required (webhook)
 * Authorization: N/A (webhook)
 */
export const deleteSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    // 1. Find subscription
    const subscription = await ctx.db
      .query('stripeSubscriptions')
      .withIndex('by_stripe_subscription_id', (q) =>
        q.eq('stripeSubscriptionId', stripeSubscriptionId.trim())
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (subscription) {
      // 2. Soft delete subscription
      const now = Date.now();
      await ctx.db.patch(subscription._id, {
        deletedAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Upsert payment
 * Authentication: Required
 * Authorization: Current user (creates/updates own record)
 */
export const upsertPayment = mutation({
  args: {
    stripeCustomerId: v.optional(v.string()),
    stripePaymentIntentId: v.string(),
    stripeChargeId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: stripeValidators.paymentStatus,
    description: v.optional(v.string()),
    receiptEmail: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 3. Validation
    const validation = validatePaymentInput({
      amount: trimmedArgs.amount,
      currency: trimmedArgs.currency,
      description: trimmedArgs.description,
      receiptEmail: trimmedArgs.receiptEmail,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors?.join(', ') || STRIPE_CONSTANTS.ERROR_MESSAGES.INVALID_INPUT);
    }

    // 4. Find existing payment
    const now = Date.now();
    const existing = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedArgs.stripePaymentIntentId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    // 5. Update or insert payment
    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeChargeId: trimmedArgs.stripeChargeId,
        status: trimmedArgs.status,
        description: trimmedArgs.description,
        receiptEmail: trimmedArgs.receiptEmail,
        metadata: trimmedArgs.metadata || existing.metadata,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.payment.update',
        entityType: 'stripe_payments',
        entityId: existing._id,
        entityTitle: trimmedArgs.stripePaymentIntentId,
        description: `Updated Stripe payment: ${trimmedArgs.stripePaymentIntentId}`,
        metadata: {
          status: trimmedArgs.status,
          amount: trimmedArgs.amount,
          currency: trimmedArgs.currency,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      return existing._id;
    } else {
      // Insert new payment
      const publicId = generatePaymentPublicId();
      const paymentId = await ctx.db.insert('stripePayments', {
        publicId,
        ownerId: user._id,
        name: trimmedArgs.description || trimmedArgs.stripePaymentIntentId,
        status: trimmedArgs.status,
        authUserId: user.authUserId,
        stripeCustomerId: trimmedArgs.stripeCustomerId,
        stripePaymentIntentId: trimmedArgs.stripePaymentIntentId,
        stripeChargeId: trimmedArgs.stripeChargeId,
        amount: trimmedArgs.amount,
        currency: trimmedArgs.currency,
        description: trimmedArgs.description,
        receiptEmail: trimmedArgs.receiptEmail,
        metadata: trimmedArgs.metadata || {},
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Audit log
      const userName = (user.name || user.email || 'User').trim();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName,
        action: 'stripe.payment.create',
        entityType: 'stripe_payments',
        entityId: paymentId,
        entityTitle: trimmedArgs.stripePaymentIntentId,
        description: `Created Stripe payment: ${trimmedArgs.stripePaymentIntentId}`,
        metadata: {
          status: trimmedArgs.status,
          amount: trimmedArgs.amount,
          currency: trimmedArgs.currency,
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
 * Update payment status (webhook-triggered)
 * Authentication: Not required (webhook)
 * Authorization: N/A (webhook)
 */
export const updatePaymentStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: stripeValidators.paymentStatus,
    stripeChargeId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    errorCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 2. Find payment
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedArgs.stripePaymentIntentId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!payment) {
      throw new Error(
        `${STRIPE_CONSTANTS.ERROR_MESSAGES.PAYMENT_NOT_FOUND}: ${trimmedArgs.stripePaymentIntentId}`
      );
    }

    // 3. Update payment status
    const now = Date.now();
    const updates: any = {
      status: trimmedArgs.status,
      updatedAt: now,
    };

    if (trimmedArgs.stripeChargeId) {
      updates.stripeChargeId = trimmedArgs.stripeChargeId;
    }
    if (trimmedArgs.status === 'succeeded') {
      updates.succeededAt = now;
    } else if (trimmedArgs.status === 'failed') {
      updates.failedAt = now;
      updates.errorMessage = trimmedArgs.errorMessage;
      updates.errorCode = trimmedArgs.errorCode;
    } else if (trimmedArgs.status === 'processing') {
      updates.processingAt = now;
    }

    await ctx.db.patch(payment._id, updates);

    return payment._id;
  },
});

/**
 * Mark payment as refunded (webhook-triggered)
 * Authentication: Not required (webhook)
 * Authorization: N/A (webhook)
 */
export const markPaymentRefunded = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    refundAmount: v.number(),
    refundReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 2. Find payment
    const payment = await ctx.db
      .query('stripePayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', trimmedArgs.stripePaymentIntentId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!payment) {
      throw new Error(
        `${STRIPE_CONSTANTS.ERROR_MESSAGES.PAYMENT_NOT_FOUND}: ${trimmedArgs.stripePaymentIntentId}`
      );
    }

    // 3. Mark payment as refunded
    const now = Date.now();
    const currentRefundAmount = payment.refundAmount || 0;
    const totalRefunded = currentRefundAmount + trimmedArgs.refundAmount;

    await ctx.db.patch(payment._id, {
      status: totalRefunded >= payment.amount ? 'refunded' : payment.status,
      refunded: true,
      refundAmount: totalRefunded,
      refundDate: now,
      refundReason: trimmedArgs.refundReason,
      updatedAt: now,
    });

    return payment._id;
  },
});

/**
 * Process webhook event
 * Authentication: Not required (webhook)
 * Authorization: N/A (webhook)
 */
export const processWebhookEvent = mutation({
  args: {
    stripeEventId: v.string(),
    eventType: v.string(),
    eventData: v.any(),
    apiVersion: v.optional(v.string()),
    livemode: v.optional(v.boolean()),
    account: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedArgs = trimObjectFields(args);

    // 2. Check for duplicate event (idempotency)
    const existing = await ctx.db
      .query('stripeWebhookEvents')
      .withIndex('by_stripe_event_id', (q) =>
        q.eq('stripeEventId', trimmedArgs.stripeEventId)
      )
      .first();

    if (existing) {
      // Event already processed
      return { success: true, eventId: existing._id, duplicate: true };
    }

    // 3. Insert webhook event
    const now = Date.now();
    const publicId = generateWebhookPublicId();
    const eventId = await ctx.db.insert('stripeWebhookEvents', {
      publicId,
      name: trimmedArgs.eventType,
      status: STRIPE_CONSTANTS.WEBHOOK_STATUSES.PENDING,
      stripeEventId: trimmedArgs.stripeEventId,
      eventType: trimmedArgs.eventType,
      eventData: trimmedArgs.eventData,
      apiVersion: trimmedArgs.apiVersion,
      livemode: trimmedArgs.livemode ?? false,
      account: trimmedArgs.account,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, eventId, duplicate: false };
  },
});

/**
 * Update webhook event status
 * Authentication: Not required (internal)
 * Authorization: N/A (internal)
 */
export const updateWebhookEventStatus = mutation({
  args: {
    eventId: v.id('stripeWebhookEvents'),
    status: stripeValidators.webhookStatus,
    errorMessage: v.optional(v.string()),
    errorStack: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Find webhook event
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error(STRIPE_CONSTANTS.ERROR_MESSAGES.WEBHOOK_NOT_FOUND);
    }

    // 2. Update webhook event status
    const now = Date.now();
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === 'processing') {
      updates.processingAttempts = (event.processingAttempts || 0) + 1;
      updates.lastProcessingAttempt = now;
    } else if (args.status === 'succeeded') {
      updates.processedAt = now;
    } else if (args.status === 'failed') {
      updates.errorMessage = args.errorMessage;
      updates.errorStack = args.errorStack;
    }

    await ctx.db.patch(event._id, updates);

    return { success: true };
  },
});
