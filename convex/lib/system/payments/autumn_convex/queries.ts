// convex/lib/boilerplate/payments/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';

/**
 * Get current user's subscription
 * 🔒 Authentication: Optional (returns null if not authenticated)
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
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    return subscription;
  },
});

/**
 * Get subscription by ID
 * 🔒 Authentication: Optional
 */
export const getSubscriptionById = query({
  args: {
    subscriptionId: v.id('subscriptions'),
  },
  handler: async (ctx, { subscriptionId }) => {
    // ✅ Direct O(1) lookup
    return await ctx.db.get(subscriptionId);
  },
});

/**
 * Get subscription by public ID
 * 🔒 Authentication: Optional
 */
export const getSubscriptionByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();
  },
});

/**
 * Check if user has access to a feature
 * 🔒 Authentication: Optional (returns no access if not authenticated)
 */
export const checkFeatureAccess = query({
  args: {
    featureKey: v.string(),
  },
  handler: async (ctx, { featureKey }) => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return {
        hasAccess: false,
        reason: 'Not authenticated',
      };
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .first();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No active subscription',
      };
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return {
        hasAccess: false,
        reason: `Subscription is ${subscription.status}`,
      };
    }

    const features = subscription.features || [];
    if (!features.includes(featureKey)) {
      return {
        hasAccess: false,
        reason: 'Feature not included in plan',
      };
    }

    const limits = subscription.limits || {};
    const usage = subscription.usage || {};

    const limit = limits[featureKey as keyof typeof limits];
    const currentUsage = usage[featureKey as keyof typeof usage] || 0;

    if (limit !== undefined && typeof currentUsage === 'number' && currentUsage >= limit) {
      return {
        hasAccess: false,
        reason: 'Usage limit exceeded',
        currentUsage,
        limit,
        remaining: 0,
      };
    }

    return {
      hasAccess: true,
      currentUsage: typeof currentUsage === 'number' ? currentUsage : 0,
      limit,
      remaining:
        limit !== undefined && typeof currentUsage === 'number'
          ? limit - currentUsage
          : undefined,
    };
  },
});

/**
 * Get user's usage statistics
 * 🔒 Authentication: Optional (returns null if not authenticated)
 */
export const getUserUsageStats = query({
  args: {
    featureKey: v.optional(v.string()),
  },
  handler: async (ctx, { featureKey }) => {
    const userProfile = await getCurrentUser(ctx);

    if (!userProfile) {
      return null;
    }

    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
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
      usage,
      limits,
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status,
      lastResetAt: usage.lastResetAt,
    };
  },
});

/**
 * Get user's usage logs
 * 🔒 Authentication: Required
 */
export const getUserUsageLogs = query({
  args: {
    featureKey: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { featureKey, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    const logs = await ctx.db
      .query('usageLogs')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .order('desc')
      .take(limit || 1000);

    if (featureKey) {
      return logs.filter((log) => log.featureKey === featureKey);
    }

    return logs;
  },
});

/**
 * Get user's payment events
 * 🔒 Authentication: Required
 */
export const getUserPaymentEvents = query({
  args: {
    eventType: v.optional(
      v.union(
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
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { eventType, limit }) => {
    const userProfile = await requireCurrentUser(ctx);

    const events = await ctx.db
      .query('paymentEvents')
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
      .order('desc')
      .take(limit || 500);

    if (eventType) {
      return events.filter((event) => event.eventType === eventType);
    }

    return events;
  },
});

/**
 * Get all active subscriptions
 * 🔒 Authentication: Optional (admin-level query)
 */
export const getAllActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query('subscriptions')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    return subscriptions;
  },
});

/**
 * Get subscription statistics
 * 🔒 Authentication: Optional (admin-level query)
 */
export const getSubscriptionStats = query({
  args: {
    planId: v.optional(v.string()),
  },
  handler: async (ctx, { planId }) => {
    let subscriptions;

    if (planId) {
      subscriptions = await ctx.db
        .query('subscriptions')
        .withIndex('by_plan_id', (q) => q.eq('planId', planId))
        .collect();
    } else {
      subscriptions = await ctx.db.query('subscriptions').collect();
    }

    const stats = {
      total: subscriptions.length,
      active: 0,
      trialing: 0,
      cancelled: 0,
      past_due: 0,
      inactive: 0,
      byPlan: {} as Record<string, number>,
    };

    subscriptions.forEach((sub) => {
      if (sub.status === 'active') stats.active++;
      else if (sub.status === 'trialing') stats.trialing++;
      else if (sub.status === 'cancelled') stats.cancelled++;
      else if (sub.status === 'past_due') stats.past_due++;
      else stats.inactive++;

      stats.byPlan[sub.planId] = (stats.byPlan[sub.planId] || 0) + 1;
    });

    return stats;
  },
});

/**
 * Check if usage limit is exceeded
 * 🔒 Authentication: Optional (returns exceeded if not authenticated)
 */
export const isUsageLimitExceeded = query({
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
      .withIndex('by_user_id', (q) => q.eq('userId', userProfile._id))
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