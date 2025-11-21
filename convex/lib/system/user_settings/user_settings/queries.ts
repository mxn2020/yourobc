// convex/lib/system/user_settings/user_settings/queries.ts
// Read operations for user_settings module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { getDefaultUserSettings } from './utils';
import { requireViewUserSettingsAccess } from './permissions';

/**
 * Get user settings
 */
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // Return settings or defaults
    return settings || getDefaultUserSettings();
  },
});

/**
 * Get a specific user setting by key
 */
export const getUserSetting = query({
  args: {
    key: v.string()
  },
  handler: async (ctx, { key }) => {
    const user = await requireCurrentUser(ctx);

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!settings) return null;

    await requireViewUserSettingsAccess(ctx, settings, user);

    return (settings as Record<string, any>)[key] || null;
  },
});

/**
 * Get user settings by public ID
 */
export const getUserSettingsByPublicId = query({
  args: {
    publicId: v.string()
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!settings) {
      throw new Error('Settings not found');
    }

    await requireViewUserSettingsAccess(ctx, settings, user);

    return settings;
  },
});
