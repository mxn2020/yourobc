// convex/lib/system/app_theme_settings/queries.ts
// Read operations for appThemeSettings module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { filterThemeSettingsByAccess, requireViewThemeSettingAccess } from './permissions';
import { APP_THEME_SETTINGS_CONSTANTS } from './constants';
import type { AppThemeSettingListResponse, AppThemeSettingStatsResponse } from './types';

/**
 * Get paginated list of theme settings with filtering
 */
export const getThemeSettings = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        category: v.optional(v.array(v.string())),
        isEditable: v.optional(v.boolean()),
        searchQuery: v.optional(v.string()),
        modifiedAfter: v.optional(v.number()),
        modifiedBefore: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<AppThemeSettingListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = APP_THEME_SETTINGS_CONSTANTS.LIMITS.DEFAULT_PAGE_SIZE, offset = 0, filters = {} } = args;

    // Validate limit
    const effectiveLimit = Math.min(limit, APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_PAGE_SIZE);

    // Query with deletedAt filter
    let settings = await ctx.db
      .query('appThemeSettings')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    settings = await filterThemeSettingsByAccess(ctx, settings, user);

    // Apply category filter
    if (filters.category?.length) {
      settings = settings.filter((item) => filters.category!.includes(item.category));
    }

    // Apply isEditable filter
    if (filters.isEditable !== undefined) {
      settings = settings.filter((item) => item.isEditable === filters.isEditable);
    }

    // Apply modifiedAfter filter
    if (filters.modifiedAfter) {
      settings = settings.filter((item) => item.updatedAt && item.updatedAt >= filters.modifiedAfter!);
    }

    // Apply modifiedBefore filter
    if (filters.modifiedBefore) {
      settings = settings.filter((item) => item.updatedAt && item.updatedAt <= filters.modifiedBefore!);
    }

    // Apply search query filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      settings = settings.filter(
        (item) =>
          item.key.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by category, then key
    settings.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.key.localeCompare(b.key);
    });

    // Paginate
    const total = settings.length;
    const paginatedSettings = settings.slice(offset, offset + effectiveLimit);
    const hasMore = total > offset + effectiveLimit;

    return {
      items: paginatedSettings,
      total,
      hasMore,
    };
  },
});

/**
 * Get theme setting by ID
 */
export const getThemeSettingById = query({
  args: { settingId: v.id('appThemeSettings') },
  handler: async (ctx, { settingId }) => {
    const user = await requireCurrentUser(ctx);

    const setting = await ctx.db.get(settingId);
    if (!setting || setting.deletedAt) {
      return null;
    }

    await requireViewThemeSettingAccess(ctx, setting, user);

    return setting;
  },
});

/**
 * Get theme setting by key
 */
export const getThemeSettingByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const user = await requireCurrentUser(ctx);

    const setting = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!setting) {
      return null;
    }

    await requireViewThemeSettingAccess(ctx, setting, user);

    return setting;
  },
});

/**
 * Get theme settings by category
 */
export const getThemeSettingsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    const user = await requireCurrentUser(ctx);

    let settings = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_category', (q) => q.eq('category', category))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    settings = await filterThemeSettingsByAccess(ctx, settings, user);

    // Sort by key
    settings.sort((a, b) => a.key.localeCompare(b.key));

    return settings;
  },
});

/**
 * Get theme setting statistics
 */
export const getThemeSettingStats = query({
  handler: async (ctx): Promise<AppThemeSettingStatsResponse> => {
    const user = await requireCurrentUser(ctx);

    let settings = await ctx.db
      .query('appThemeSettings')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    settings = await filterThemeSettingsByAccess(ctx, settings, user);

    // Calculate stats
    const settingsByCategory: Record<string, number> = {};
    let editableSettings = 0;
    let recentlyModified = 0;

    const recentThreshold = Date.now() - APP_THEME_SETTINGS_CONSTANTS.LIMITS.RECENT_MODIFICATION_WINDOW;

    for (const setting of settings) {
      // Category stats
      settingsByCategory[setting.category] = (settingsByCategory[setting.category] || 0) + 1;

      // Count editable
      if (setting.isEditable) editableSettings++;

      // Count recently modified
      if (setting.updatedAt && setting.updatedAt >= recentThreshold) {
        recentlyModified++;
      }
    }

    return {
      totalSettings: settings.length,
      settingsByCategory,
      editableSettings,
      recentlyModified,
    };
  },
});
