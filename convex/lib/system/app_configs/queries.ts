// convex/lib/system/app_configs/queries.ts
// Query functions for appConfigs module

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { getUserByClerkId } from '@/lib/system/user_profiles/user_profiles/queries';
import { requireViewAppConfigsAccess } from './permissions';

/**
 * Get all app configs
 */
export const getAppConfigs = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewAppConfigsAccess(user);

    return await ctx.db
      .query('appConfigs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});

/**
 * Get config by feature and key
 */
export const getConfigByFeatureKey = query({
  args: { feature: v.string(), key: v.string() },
  handler: async (ctx, { feature, key }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewAppConfigsAccess(user);

    return await ctx.db
      .query('appConfigs')
      .withIndex('by_feature_key', (q) => q.eq('feature', feature).eq('key', key))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();
  },
});

/**
 * Get configs by feature
 */
export const getConfigsByFeature = query({
  args: { feature: v.string() },
  handler: async (ctx, { feature }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewAppConfigsAccess(user);

    return await ctx.db
      .query('appConfigs')
      .withIndex('by_feature', (q) => q.eq('feature', feature))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});

/**
 * Get visible configs (for admin UI)
 */
export const getVisibleConfigs = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewAppConfigsAccess(user);

    return await ctx.db
      .query('appConfigs')
      .withIndex('by_visible', (q) => q.eq('isVisible', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});
