// convex/lib/boilerplate/payments/mutations.ts

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { AUTUMN_CONSTANTS } from './constants';
import { validateSyncSubscriptionData, validateTrackUsageData } from './utils';

/**
 * Sync subscription from Autumn
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'payments:autumn:create' permission
 */
export const syncSubscriptionFromAutumn = mutation({
  args: {
    autumnCustomerId: v.optional(v.string()),
    autumnSubscriptionId: v.optional(v.string()),
    planId: v.string(),
    planName: v.string(),
    planType: v.union(v.literal('free'), v.literal('paid')),
    status: v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('cancelled'),
      v.literal('past_due'),
      v.literal('trialing')
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    trialEndDate: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    limits: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, AUTUMN_CONSTANTS.PERMISSIONS.CREATE);

    // 3. Validation
    const errors = validateSyncSubscriptionData(args);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const existingSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    const now = Date.now();

    if (existingSubscription) {
      // 4. Update existing subscription with trimmed strings
      await ctx.db.patch(existingSubscription._id, {
        autumnCustomerId: args.autumnCustomerId?.trim(),
        autumnSubscriptionId: args.autumnSubscriptionId?.trim(),
        planId: args.planId.trim(),
        planName: args.planName.trim(),
        planType: args.planType,
        status: args.status,
        startDate: args.startDate,
        endDate: args.endDate,
        trialEndDate: args.trialEndDate,
        currentPeriodEnd: args.currentPeriodEnd,
        features: args.features?.map(f => f.trim()),
        limits: args.limits,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: userProfile._id,
      });

      // 5. Audit log
      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: userProfile._id,
        userName: userProfile.name || userProfile.email || 'Unknown User',
        action: 'autumn.subscription_updated',
        entityType: 'subscription',
        entityId: existingSubscription._id,
        entityTitle: args.planName,
        description: `Updated subscription to ${args.planName} (${args.status})`,
        createdAt: now,
      });

      return existingSubscription._id;
    } else {
      // 4. Create new subscription with trimmed strings
      const publicId = await generateUniquePublicId(ctx, 'subscriptions');
      const subscriptionId = await ctx.db.insert('subscriptions', {
        publicId,
        userId: userProfile._id,
        authUserId: userProfile.authUserId,
        autumnCustomerId: args.autumnCustomerId?.trim(),
        autumnSubscriptionId: args.autumnSubscriptionId?.trim(),
        planId: args.planId.trim(),
        planName: args.planName.trim(),
        planType: args.planType,
        status: args.status,
        startDate: args.startDate,
        endDate: args.endDate,
        trialEndDate: args.trialEndDate,
        currentPeriodEnd: args.currentPeriodEnd,
        features: args.features?.map(f => f.trim()),
        limits: args.limits,
        usage: {
          aiRequests: 0,
          projects: 0,
          storage: 0,
          lastResetAt: now,
        },
        metadata: args.metadata,
        createdAt: now,
        createdBy: userProfile._id,
        updatedAt: now,
        updatedBy: userProfile._id,
      });

      // 5. Audit log
      await ctx.db.insert('auditLogs', {
        id: crypto.randomUUID(),
        userId: userProfile._id,
        userName: userProfile.name || userProfile.email || 'Unknown User',
        action: 'autumn.subscription_created',
        entityType: 'subscription',
        entityId: subscriptionId,
        entityTitle: args.planName,
        description: `Created subscription: ${args.planName} (${args.status})`,
        createdAt: now,
      });

      return subscriptionId;
    }
  },
});

/**
 * Update subscription status
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'payments:autumn:update' permission
 */
export const updateSubscriptionStatus = mutation({
  args: {
    status: v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('cancelled'),
      v.literal('past_due'),
      v.literal('trialing')
    ),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, AUTUMN_CONSTANTS.PERMISSIONS.UPDATE);

    // 3. Get subscription and check existence
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    const now = Date.now();

    // 4. Update subscription
    await ctx.db.patch(subscription._id, {
      status: args.status,
      endDate: args.endDate,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'autumn.subscription_status_updated',
      entityType: 'subscription',
      entityId: subscription._id,
      entityTitle: subscription.planName,
      description: `Updated subscription status to ${args.status}`,
      createdAt: now,
    });

    // 6. Return subscription ID
    return subscription._id;
  },
});

/**
 * Track usage for a feature
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'payments:autumn:track_usage' permission
 */
export const trackUsage = mutation({
  args: {
    featureKey: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    context: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, AUTUMN_CONSTANTS.PERMISSIONS.TRACK_USAGE);

    // 3. Validation
    const errors = validateTrackUsageData(args);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. Get subscription and check existence
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    const now = Date.now();

    // 5. Insert usage log with trimmed strings
    const usageLogId = await ctx.db.insert('usageLogs', {
      userId: userProfile._id,
      authUserId: userProfile.authUserId,
      subscriptionId: subscription._id,
      featureKey: args.featureKey.trim(),
      quantity: args.quantity,
      unit: args.unit?.trim(),
      context: args.context?.trim(),
      metadata: args.metadata,
      trackedToAutumn: false,
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 6. Update subscription usage
    const currentUsage = subscription.usage || {};
    const featureUsage = currentUsage[args.featureKey as keyof typeof currentUsage] || 0;
    const newUsage = typeof featureUsage === 'number' ? featureUsage + args.quantity : args.quantity;

    await ctx.db.patch(subscription._id, {
      usage: {
        ...currentUsage,
        [args.featureKey]: newUsage,
      },
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 7. Return usage response
    return {
      usageLogId,
      currentUsage: newUsage,
      limit: subscription.limits?.[args.featureKey as keyof NonNullable<typeof subscription.limits>],
    };
  },
});

/**
 * Reset usage counters
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'payments:autumn:update' permission
 */
export const resetUsage = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, AUTUMN_CONSTANTS.PERMISSIONS.UPDATE);

    // 3. Get subscription and check existence
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    const now = Date.now();

    // 4. Reset usage
    await ctx.db.patch(subscription._id, {
      usage: {
        aiRequests: 0,
        projects: 0,
        storage: 0,
        lastResetAt: now,
      },
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'autumn.usage_reset',
      entityType: 'subscription',
      entityId: subscription._id,
      entityTitle: subscription.planName,
      description: `Reset usage counters for ${subscription.planName}`,
      createdAt: now,
    });

    // 6. Return subscription ID
    return subscription._id;
  },
});

/**
 * Log a payment event
 * 🔒 Authentication: Required
 */
export const logPaymentEvent = mutation({
  args: {
    eventType: v.union(
      v.literal('subscription_created'),
      v.literal('subscription_updated'),
      v.literal('subscription_cancelled'),
      v.literal('payment_succeeded'),
      v.literal('payment_failed'),
      v.literal('trial_started'),
      v.literal('trial_ended'),
      v.literal('plan_upgraded'),
      v.literal('plan_downgraded'),
      v.literal('usage_tracked'),
      v.literal('limit_exceeded'),
      v.literal('other')
    ),
    eventData: v.optional(v.any()),
    source: v.union(v.literal('autumn'), v.literal('app')),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Get subscription
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    const now = Date.now();

    // 3. Insert payment event
    const eventId = await ctx.db.insert('paymentEvents', {
      userId: userProfile._id,
      authUserId: userProfile.authUserId,
      subscriptionId: subscription?._id,
      eventType: args.eventType,
      eventData: args.eventData,
      source: args.source,
      processed: false,
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 4. Return event ID
    return eventId;
  },
});

/**
 * Mark a payment event as processed
 * 🔒 Authentication: Required
 */
export const markEventProcessed = mutation({
  args: {
    eventId: v.id('paymentEvents'),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, error }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Get event for audit log
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error('Payment event not found');
    }

    // 3. Update event
    await ctx.db.patch(eventId, {
      processed: true,
      error: error?.trim(),
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'autumn.event_processed',
      entityType: 'payment_event',
      entityId: eventId,
      entityTitle: event.eventType,
      description: `Marked payment event as processed: ${event.eventType}`,
      metadata: { eventType: event.eventType, error: error },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return eventId;
  },
});