// convex/lib/boilerplate/user_settings/user_settings/queries.ts
// Read operations for user settings module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from '@/shared/auth.helper';
import { getDefaultUserSettings } from './utils';

/**
 * Get user settings
 * Authentication: Optional (returns defaults if not authenticated)
 * Authorization: Users can only access their own settings
 * Soft Delete Filtering: Applied (excludes soft-deleted records)
 */
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication (optional for this query)
    const user = await getCurrentUser(ctx);
    if (!user) return getDefaultUserSettings();

    // 2. Query with soft delete filtering
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. Return settings or defaults
    return settings || getDefaultUserSettings();
  },
});

/**
 * Get a specific user setting by key
 * Authentication: Optional
 * Authorization: Users can only access their own settings
 * Soft Delete Filtering: Applied
 */
export const getUserSetting = query({
  args: {
    key: v.string()
  },
  handler: async (ctx, { key }) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // 2. Query with soft delete filtering
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    if (!settings) return null;

    // 3. Return the specific setting value
    return (settings as Record<string, any>)[key] || null;
  },
});

/**
 * Get user settings by public ID
 * Authentication: Required
 * Authorization: Users can only access their own settings
 * Soft Delete Filtering: Applied
 */
export const getUserSettingsByPublicId = query({
  args: {
    publicId: v.string()
  },
  handler: async (ctx, { publicId }) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // 2. Query with soft delete filtering
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .unique();

    // 3. Authorization check
    if (!settings || settings.userId !== user._id) {
      return null;
    }

    return settings;
  },
});
