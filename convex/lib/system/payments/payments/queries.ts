// convex/lib/boilerplate/payments/payments/queries.ts
// Query operations for payments module

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { PAYMENTS_CONSTANTS } from './constants';
import { hasFeatureAccess, isUsageLimitExceeded } from './utils';
import { filterSubscriptionsByAccess, filterUsageLogsByAccess, filterPaymentEventsByAccess } from './permissions';
import type { SubscriptionStats, UsageStats, FeatureAccessCheck } from './types';

// ============================================
// Subscription Queries
// ============================================

/**
 * Get current user's subscription
 * Authentication: Optional (returns null if not authenticated)
 * Soft delete: Filtered
 */
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return null;
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return subscription;
  },
});

/**
 * Get subscription by ID
 * Authentication: Required
 * Authorization: User must have access to view
 * Soft delete: Filtered
 */
export const getSubscription = query({
  args: {
    subscriptionId: v.id('subscriptions'),
  },
  handler: async (ctx, { subscriptionId }) => {
    const userProfile = await requireCurrentUser(ctx);

    const subscription = await ctx.db.get(subscriptionId);

    if (!subscription || subscription.deletedAt) {
      return null;
    }

    // Check access
    const hasAccess = subscription.ownerId === userProfile._id ||
      userProfile.role === 'admin' ||
      userProfile.role === 'superadmin';

    if (!hasAccess) {
      throw new Error('You do not have permission to view this subscription');
    }

    return subscription;
  },
});

/**
 * Get subscription by public ID
 * Authentication: Required
 * Authorization: User must have access to view
 * Soft delete: Filtered
 */
export const getSubscriptionByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const userProfile = await requireCurrentUser(ctx);

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      return null;
    }

    // Check access
    const hasAccess = subscription.ownerId === userProfile._id ||
      userProfile.role === 'admin' ||
      userProfile.role === 'superadmin';

    if (!hasAccess) {
      throw new Error('You do not have permission to view this subscription');
    }

    return subscription;
  },
});

/**
 * List user's subscriptions
 * Authentication: Required
 * Soft delete: Filtered
 * Access control: Filtered by ownership
 */
export const listSubscriptions = query({
  args: {
    status: v.optional(v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('cancelled'),
      v.literal('past_due'),
      v.literal('trialing')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    let query = ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined));

    if (status) {
      query = query.filter((q) => q.eq(q.field('status'), status));
    }

    const subscriptions = await query
      .order('desc')
      .take(limit || 100);

    return subscriptions;
  },
});

/**
 * Get all subscriptions (admin only)
 * Authentication: Required
 * Authorization: Admin only
 * Soft delete: Filtered
 */
export const listAllSubscriptions = query({
  args: {
    status: v.optional(v.union(
      v.literal('active'),
      v.literal('inactive'),
      v.literal('cancelled'),
      v.literal('past_due'),
      v.literal('trialing')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    // Only admins can list all subscriptions
    if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
      throw new Error('You do not have permission to list all subscriptions');
    }

    let query = ctx.db
      .query('subscriptions')
      .filter((q) => q.eq(q.field('deletedAt'), undefined));

    if (status) {
      query = query.filter((q) => q.eq(q.field('status'), status));
    }

    const subscriptions = await query
      .order('desc')
      .take(limit || 1000);

    return subscriptions;
  },
});

// ============================================
// Feature Access Queries
// ============================================

/**
 * Check if user has access to a feature
 * Authentication: Optional (returns no access if not authenticated)
 * Soft delete: Filtered
 */
export const checkFeatureAccess = query({
  args: {
    featureKey: v.string(),
  },
  handler: async (ctx, { featureKey }): Promise<FeatureAccessCheck> => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return {
        hasAccess: false,
        reason: 'Not authenticated',
      };
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No active subscription',
      };
    }

    return hasFeatureAccess(subscription, featureKey);
  },
});

/**
 * Check if usage limit is exceeded
 * Authentication: Optional (returns exceeded if not authenticated)
 * Soft delete: Filtered
 */
export const isUsageLimitExceededQuery = query({
  args: {
    featureKey: v.string(),
  },
  handler: async (ctx, { featureKey }) => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return {
        exceeded: true,
        reason: 'Not authenticated',
      };
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      return {
        exceeded: true,
        reason: 'No subscription found',
      };
    }

    const usage = subscription.usage || {};
    const limits = subscription.limits || {};

    const limit = limits[featureKey as keyof typeof limits];
    const currentUsage = usage[featureKey as keyof typeof usage] || 0;

    if (limit === undefined) {
      return {
        exceeded: false,
        currentUsage: typeof currentUsage === 'number' ? currentUsage : 0,
      };
    }

    const exceeded = typeof currentUsage === 'number' && currentUsage >= limit;

    return {
      exceeded,
      currentUsage: typeof currentUsage === 'number' ? currentUsage : 0,
      limit,
      remaining: typeof currentUsage === 'number' ? Math.max(0, limit - currentUsage) : 0,
    };
  },
});

// ============================================
// Usage Queries
// ============================================

/**
 * Get user's usage statistics
 * Authentication: Optional (returns null if not authenticated)
 * Soft delete: Filtered
 */
export const getUserUsageStats = query({
  args: {
    featureKey: v.optional(v.string()),
  },
  handler: async (ctx, { featureKey }): Promise<UsageStats | null> => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return null;
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!subscription) {
      return null;
    }

    const usage = subscription.usage || {};
    const limits = subscription.limits || {};

    if (featureKey) {
      const currentUsage = usage[featureKey as keyof typeof usage] || 0;
      const limit = limits[featureKey as keyof typeof limits];

      return {
        featureKey,
        currentUsage: typeof currentUsage === 'number' ? currentUsage : 0,
        limit,
        remaining:
          limit !== undefined && typeof currentUsage === 'number'
            ? Math.max(0, limit - currentUsage)
            : undefined,
        lastResetAt: usage.lastResetAt,
      };
    }

    return {
      currentUsage: 0,
      usage,
      limits,
      planId: subscription.planId,
      planName: subscription.name,
      status: subscription.status,
      lastResetAt: usage.lastResetAt,
    };
  },
});

/**
 * Get user's usage logs
 * Authentication: Required
 * Soft delete: Filtered
 * Access control: Filtered by ownership
 */
export const getUserUsageLogs = query({
  args: {
    featureKey: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { featureKey, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    let query = ctx.db
      .query('usageLogs')
      .withIndex('by_owner', (q) => q.eq('ownerId', userProfile._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined));

    const logs = await query
      .order('desc')
      .take(limit || 1000);

    if (featureKey) {
      return logs.filter((log) => log.featureKey === featureKey);
    }

    return logs;
  },
});

// ============================================
// Payment Event Queries
// ============================================

/**
 * Get user's payment events
 * Authentication: Required
 * Soft delete: Filtered
 * Access control: Filtered by ownership
 */
export const getUserPaymentEvents = query({
  args: {
    eventType: v.optional(v.union(
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
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { eventType, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    let query = ctx.db
      .query('paymentEvents')
      .filter((q) => q.and(
        q.eq(q.field('ownerId'), userProfile._id),
        q.eq(q.field('deletedAt'), undefined)
      ));

    const events = await query
      .order('desc')
      .take(limit || 500);

    if (eventType) {
      return events.filter((event) => event.eventType === eventType);
    }

    return events;
  },
});

// ============================================
// Statistics Queries
// ============================================

/**
 * Get subscription statistics (admin only)
 * Authentication: Required
 * Authorization: Admin only
 * Soft delete: Filtered
 */
export const getSubscriptionStats = query({
  args: {
    planId: v.optional(v.string()),
  },
  handler: async (ctx, { planId }): Promise<SubscriptionStats> => {
    const userProfile = await requireCurrentUser(ctx);

    // Only admins can view stats
    if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
      throw new Error('You do not have permission to view subscription statistics');
    }

    let subscriptions;

    if (planId) {
      subscriptions = await ctx.db
        .query('subscriptions')
        .withIndex('by_plan_id', (q) => q.eq('planId', planId))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    } else {
      subscriptions = await ctx.db
        .query('subscriptions')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    const stats: SubscriptionStats = {
      total: subscriptions.length,
      active: 0,
      trialing: 0,
      cancelled: 0,
      past_due: 0,
      inactive: 0,
      byPlan: {},
    };

    subscriptions.forEach((sub) => {
      if (sub.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE) stats.active++;
      else if (sub.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING) stats.trialing++;
      else if (sub.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED) stats.cancelled++;
      else if (sub.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.PAST_DUE) stats.past_due++;
      else stats.inactive++;

      stats.byPlan[sub.planId] = (stats.byPlan[sub.planId] || 0) + 1;
    });

    return stats;
  },
});
