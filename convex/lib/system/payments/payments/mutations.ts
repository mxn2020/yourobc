// convex/lib/boilerplate/payments/payments/mutations.ts
// Mutation operations for payments module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { PAYMENTS_CONSTANTS } from './constants';
import {
  validateCreateSubscriptionData,
  validateUpdateSubscriptionData,
  validateTrackUsageData,
  initializeDefaultUsage,
} from './utils';
import {
  requireEditSubscriptionAccess,
  requireDeleteSubscriptionAccess,
  requireTrackUsageAccess,
} from './permissions';
import type { UsageResponse } from './types';

// ============================================
// Subscription Mutations
// ============================================

/**
 * Create a new subscription
 * Authentication: Required
 * Authorization: User must be authenticated
 * Validation: Required fields validated
 * Audit: Logged
 */
export const createSubscription = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    autumnCustomerId: v.optional(v.string()),
    autumnSubscriptionId: v.optional(v.string()),
    planId: v.string(),
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

    // 2. Validation
    const errors = validateCreateSubscriptionData(args);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    // 3. Create subscription with trimmed strings
    const publicId = await generateUniquePublicId(ctx, 'subscriptions');
    const subscriptionId = await ctx.db.insert('subscriptions', {
      publicId,
      ownerId: userProfile._id,
      name: args.name.trim(),
      description: args.description?.trim(),
      authUserId: userProfile.authUserId,
      autumnCustomerId: args.autumnCustomerId?.trim(),
      autumnSubscriptionId: args.autumnSubscriptionId?.trim(),
      planId: args.planId.trim(),
      planType: args.planType,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      trialEndDate: args.trialEndDate,
      currentPeriodEnd: args.currentPeriodEnd,
      features: args.features?.map((f) => f.trim()),
      limits: args.limits,
      usage: initializeDefaultUsage(),
      metadata: args.metadata || {},
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'subscription_created',
      entityType: 'subscription',
      entityId: subscriptionId,
      entityTitle: args.name,
      description: `Created subscription: ${args.name} (${args.status})`,
      metadata: { planId: args.planId, planType: args.planType, status: args.status },
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Update an existing subscription
 * Authentication: Required
 * Authorization: User must have edit access
 * Validation: Updated fields validated
 * Audit: Logged
 * Soft delete: No operation on deleted records
 */
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.id('subscriptions'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    autumnCustomerId: v.optional(v.string()),
    autumnSubscriptionId: v.optional(v.string()),
    planId: v.optional(v.string()),
    planType: v.optional(v.union(v.literal('free'), v.literal('paid'))),
    status: v.optional(v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('cancelled'),
      v.literal('past_due'),
      v.literal('trialing')
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    trialEndDate: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    limits: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { subscriptionId, ...updates }) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Get subscription and check existence
    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    // 3. Authorization
    await requireEditSubscriptionAccess(subscription, userProfile);

    // 4. Validation
    const errors = validateUpdateSubscriptionData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    // 5. Prepare update object with trimmed strings
    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: userProfile._id,
    };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim();
    if (updates.autumnCustomerId !== undefined) updateData.autumnCustomerId = updates.autumnCustomerId?.trim();
    if (updates.autumnSubscriptionId !== undefined) updateData.autumnSubscriptionId = updates.autumnSubscriptionId?.trim();
    if (updates.planId !== undefined) updateData.planId = updates.planId.trim();
    if (updates.planType !== undefined) updateData.planType = updates.planType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.trialEndDate !== undefined) updateData.trialEndDate = updates.trialEndDate;
    if (updates.currentPeriodEnd !== undefined) updateData.currentPeriodEnd = updates.currentPeriodEnd;
    if (updates.features !== undefined) updateData.features = updates.features.map((f) => f.trim());
    if (updates.limits !== undefined) updateData.limits = updates.limits;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    // 6. Update subscription
    await ctx.db.patch(subscriptionId, updateData);

    // 7. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'subscription_updated',
      entityType: 'subscription',
      entityId: subscriptionId,
      entityTitle: subscription.name,
      description: `Updated subscription: ${subscription.name}`,
      metadata: { updates: Object.keys(updates) },
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Delete a subscription (soft delete)
 * Authentication: Required
 * Authorization: Admin only
 * Audit: Logged
 * Soft delete: Sets deletedAt timestamp
 */
export const deleteSubscription = mutation({
  args: {
    subscriptionId: v.id('subscriptions'),
  },
  handler: async (ctx, { subscriptionId }) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Get subscription and check existence
    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    // 3. Authorization
    await requireDeleteSubscriptionAccess(subscription, userProfile);

    const now = Date.now();

    // 4. Soft delete
    await ctx.db.patch(subscriptionId, {
      deletedAt: now,
      deletedBy: userProfile._id,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'subscription_deleted',
      entityType: 'subscription',
      entityId: subscriptionId,
      entityTitle: subscription.name,
      description: `Deleted subscription: ${subscription.name}`,
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Restore a deleted subscription
 * Authentication: Required
 * Authorization: Admin only
 * Audit: Logged
 */
export const restoreSubscription = mutation({
  args: {
    subscriptionId: v.id('subscriptions'),
  },
  handler: async (ctx, { subscriptionId }) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Get subscription
    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.deletedAt) {
      throw new Error('Subscription is not deleted');
    }

    // 3. Authorization
    await requireDeleteSubscriptionAccess(subscription, userProfile);

    const now = Date.now();

    // 4. Restore
    await ctx.db.patch(subscriptionId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'subscription_restored',
      entityType: 'subscription',
      entityId: subscriptionId,
      entityTitle: subscription.name,
      description: `Restored subscription: ${subscription.name}`,
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

// ============================================
// Usage Tracking Mutations
// ============================================

/**
 * Track usage for a feature
 * Authentication: Required
 * Authorization: User must have track usage permission
 * Validation: Required fields validated
 * Audit: Logged via usage log creation
 */
export const trackUsage = mutation({
  args: {
    featureKey: v.string(),
    quantity: v.number(),
    unit: v.optional(v.string()),
    context: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<UsageResponse> => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Authorization
    await requireTrackUsageAccess(userProfile);

    // 3. Validation
    const errors = validateTrackUsageData(args);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. Get subscription and check existence
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = Date.now();

    // 5. Create usage log with trimmed strings
    const publicId = await generateUniquePublicId(ctx, 'usageLogs');
    const usageLogId = await ctx.db.insert('usageLogs', {
      publicId,
      ownerId: userProfile._id,
      name: `${args.featureKey} usage`,
      description: args.context?.trim(),
      authUserId: userProfile.authUserId,
      subscriptionId: subscription._id,
      featureKey: args.featureKey.trim(),
      quantity: args.quantity,
      unit: args.unit?.trim(),
      context: args.context?.trim(),
      metadata: args.metadata || {},
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
    const limit = subscription.limits?.[args.featureKey as keyof NonNullable<typeof subscription.limits>];
    const remaining = limit !== undefined && typeof newUsage === 'number' ? Math.max(0, limit - newUsage) : undefined;

    return {
      usageLogId,
      currentUsage: newUsage,
      limit,
      remaining,
    };
  },
});

/**
 * Reset usage counters
 * Authentication: Required
 * Authorization: Admin only
 * Audit: Logged
 */
export const resetUsage = mutation({
  args: {
    subscriptionId: v.optional(v.id('subscriptions')),
  },
  handler: async (ctx, { subscriptionId }) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    let subscription;

    if (subscriptionId) {
      // Admin resetting a specific subscription
      if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
        throw new Error('You do not have permission to reset usage for other subscriptions');
      }

      subscription = await ctx.db.get(subscriptionId);
    } else {
      // User resetting their own subscription
      subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .first();
    }

    if (!subscription || subscription.deletedAt) {
      throw new Error('Subscription not found');
    }

    const now = Date.now();

    // 2. Reset usage
    await ctx.db.patch(subscription._id, {
      usage: {
        ...initializeDefaultUsage(),
        lastResetAt: now,
      },
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 3. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'usage_reset',
      entityType: 'subscription',
      entityId: subscription._id,
      entityTitle: subscription.name,
      description: `Reset usage counters for ${subscription.name}`,
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return subscription._id;
  },
});

// ============================================
// Payment Event Mutations
// ============================================

/**
 * Log a payment event
 * Authentication: Required
 * Audit: Logged via event creation
 */
export const logPaymentEvent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
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
    subscriptionId: v.optional(v.id('subscriptions')),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Create payment event with trimmed strings
    const publicId = await generateUniquePublicId(ctx, 'paymentEvents');
    const eventId = await ctx.db.insert('paymentEvents', {
      publicId,
      ownerId: userProfile._id,
      name: args.name.trim(),
      description: args.description?.trim(),
      authUserId: userProfile.authUserId,
      subscriptionId: args.subscriptionId,
      eventType: args.eventType,
      eventData: args.eventData,
      source: args.source,
      status: PAYMENTS_CONSTANTS.PAYMENT_EVENT_STATUS.PENDING,
      processed: false,
      metadata: args.metadata || {},
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    return eventId;
  },
});

/**
 * Mark a payment event as processed
 * Authentication: Required
 * Authorization: Admin only
 * Audit: Logged
 */
export const markEventProcessed = mutation({
  args: {
    eventId: v.id('paymentEvents'),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, error }) => {
    // 1. Authentication
    const userProfile = await requireCurrentUser(ctx);

    // 2. Get event
    const event = await ctx.db.get(eventId);
    if (!event || event.deletedAt) {
      throw new Error('Payment event not found');
    }

    // 3. Authorization (admin only)
    if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
      throw new Error('You do not have permission to mark events as processed');
    }

    const now = Date.now();
    const status = error ? PAYMENTS_CONSTANTS.PAYMENT_EVENT_STATUS.FAILED : PAYMENTS_CONSTANTS.PAYMENT_EVENT_STATUS.PROCESSED;

    // 4. Update event
    await ctx.db.patch(eventId, {
      status,
      processed: true,
      error: error?.trim(),
      updatedAt: now,
      updatedBy: userProfile._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: userProfile._id,
      userName: userProfile.name || userProfile.email || 'Unknown User',
      action: 'payment_event_processed',
      entityType: 'payment_event',
      entityId: eventId,
      entityTitle: event.name,
      description: `Marked payment event as processed: ${event.name}`,
      metadata: { eventType: event.eventType, status, error },
      createdAt: now,
      createdBy: userProfile._id,
      updatedAt: now,
    });

    return eventId;
  },
});
