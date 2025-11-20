// convex/lib/boilerplate/app_theme_settings/queries.ts
// Query functions for appThemeSettings module

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { getUserByClerkId } from '@/lib/system/user_profiles/user_profiles/queries';
import { requireViewThemeSettingsAccess } from './permissions';

/**
 * Get all theme settings
 */
export const getThemeSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewThemeSettingsAccess(user);

    return await ctx.db
      .query('appThemeSettings')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});

/**
 * Get theme setting by key
 */
export const getThemeSettingByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewThemeSettingsAccess(user);

    return await ctx.db
      .query('appThemeSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();
  },
});

/**
 * Get theme settings by category
 */
export const getThemeSettingsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) throw new Error('User not found');

    requireViewThemeSettingsAccess(user);

    return await ctx.db
      .query('appThemeSettings')
      .withIndex('by_category', (q) => q.eq('category', category))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});
