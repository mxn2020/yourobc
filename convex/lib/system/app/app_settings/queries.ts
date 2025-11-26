// convex/lib/system/app_settings/queries.ts

import { MutationCtx, QueryCtx, query } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import {
  transformSettingsArrayToObject,
  mergeSettingsWithDefaults,
  sanitizeSettingValue,
} from './utils';
import { AppSettingCategory, appSettingsValidators } from '@/schema/system/app/app_settings';

/**
 * Checks whether the current user is admin/superadmin.
 * Keps old behavior but in new file/pattern.
 */
async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const authUserId = identity.subject;
  const user = await ctx.db
    .query('userProfiles')
    .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
    .first();

  return user?.role === 'admin' || user?.role === 'superadmin';
}


/**
 * List settings (admin sees all, non-admin sees public only).
 * New pattern uses cursor-based pagination.
 */
export const getAppSettings = query({
  args: {
    category: v.optional(appSettingsValidators.category),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    search: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  handler: async (ctx, { category, limit = 50, cursor, search, sortOrder = 'desc' }) => {
    const userIsAdmin = await isAdmin(ctx);

    // Build initializer FIRST (so withIndex is allowed)
    const base = category
      ? ctx.db
          .query('appSettings')
          .withIndex('by_category', (iq) => iq.eq('category', category))
      : ctx.db.query('appSettings');

    // Now you can chain safely
    const q = base.filter(notDeleted).order(sortOrder);

    const page = await q.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    let items = page.page.filter((s) => userIsAdmin || s.isPublic);

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.key.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term) ||
          (s.description?.toLowerCase().includes(term) ?? false)
      );
    }

    const sanitized = items.map((s) => ({
      ...s,
      value: userIsAdmin ? s.value : sanitizeSettingValue(s.value),
    }));

    return {
      items: sanitized,
      total: sanitized.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});


/**
 * Get a single setting by id (admin only).
 */
export const getAppSetting = query({
  args: { id: v.id('appSettings') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');
    return doc;
  },
});

/**
 * Get a single setting by key (public allowed if isPublic).
 */
export const getAppSettingByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const setting = await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .first();

    if (!setting) return null;

    const userIsAdmin = await isAdmin(ctx);
    if (!setting.isPublic && !userIsAdmin) {
      throw new Error('Unauthorized to access this setting');
    }

    return {
      ...setting,
      value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value),
    };
  },
});

/**
 * Helpers for category-scoped settings.
 */
function categoryArgs(category: AppSettingCategory) {
  return {
    args: {},
    handler: async (ctx: any) => {
      const settings = await ctx.db
        .query('appSettings')
        .withIndex('by_category', (q: any) => q.eq('category', category))
        .filter(notDeleted)
        .collect();

      const userIsAdmin = await isAdmin(ctx);
      const filtered = settings.filter((s: any) => userIsAdmin || s.isPublic);
      const obj = transformSettingsArrayToObject(
        filtered.map((s: any) => ({
          ...s,
          value: userIsAdmin ? s.value : sanitizeSettingValue(s.value),
        }))
      );

      return mergeSettingsWithDefaults(obj, category);
    },
  };
}

function categoryKeyArgs(category: AppSettingCategory) {
  return {
    args: { key: v.string() },
    handler: async (ctx: any, { key }: { key: string }) => {
      const setting = await ctx.db
        .query('appSettings')
        .withIndex('by_key', (q: any) => q.eq('key', key))
        .filter(notDeleted)
        .filter((q: any) => q.eq(q.field('category'), category))
        .first();

      if (!setting) return null;

      const userIsAdmin = await isAdmin(ctx);
      if (!setting.isPublic && !userIsAdmin) {
        throw new Error('Unauthorized to access this setting');
      }

      return {
        ...setting,
        value: userIsAdmin ? setting.value : sanitizeSettingValue(setting.value),
      };
    },
  };
}

export const getAISettings = query(categoryArgs('ai'));
export const getAISetting = query(categoryKeyArgs('ai'));

export const getGeneralSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'general'))
      .filter(notDeleted)
      .collect();

    const obj = transformSettingsArrayToObject(settings);
    return mergeSettingsWithDefaults(obj, 'general');
  },
});

export const getGeneralSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .filter((q) => q.eq(q.field('category'), 'general'))
      .first();
  },
});

export const getSecuritySettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'security'))
      .filter(notDeleted)
      .collect();

    const obj = transformSettingsArrayToObject(settings);
    return mergeSettingsWithDefaults(obj, 'security');
  },
});

export const getSecuritySetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .filter((q) => q.eq(q.field('category'), 'security'))
      .first();
  },
});

export const getNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'notifications'))
      .filter(notDeleted)
      .collect();

    const obj = transformSettingsArrayToObject(settings);
    return mergeSettingsWithDefaults(obj, 'notifications');
  },
});

export const getNotificationSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .filter((q) => q.eq(q.field('category'), 'notifications'))
      .first();
  },
});

export const getBillingSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'billing'))
      .filter(notDeleted)
      .collect();

    const obj = transformSettingsArrayToObject(settings);
    return mergeSettingsWithDefaults(obj, 'billing');
  },
});

export const getBillingSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .filter((q) => q.eq(q.field('category'), 'billing'))
      .first();
  },
});

export const getIntegrationSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const settings = await ctx.db
      .query('appSettings')
      .withIndex('by_category', (q) => q.eq('category', 'integrations'))
      .filter(notDeleted)
      .collect();

    const obj = transformSettingsArrayToObject(settings);
    return mergeSettingsWithDefaults(obj, 'integrations');
  },
});

export const getIntegrationSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query('appSettings')
      .withIndex('by_key', (q) => q.eq('key', key))
      .filter(notDeleted)
      .filter((q) => q.eq(q.field('category'), 'integrations'))
      .first();
  },
});

/**
 * Public-only settings, optional category.
 * Returns object keyed by setting key, sanitized.
 */
export const getPublicSettings = query({
  args: {
    category: v.optional(appSettingsValidators.category),
  },
  handler: async (ctx, { category }) => {
    // Build initializer first so withIndex is legal
    const base = category
      ? ctx.db
          .query('appSettings')
          .withIndex('by_category', (iq) => iq.eq('category', category))
      : ctx.db.query('appSettings');

    // Then filters
    const q = base
      .filter(notDeleted)
      .filter((q2) => q2.eq(q2.field('isPublic'), true));

    const settings = await q.collect();

    const sanitized = settings.map((s) => ({
      ...s,
      value: sanitizeSettingValue(s.value),
    }));

    return transformSettingsArrayToObject(sanitized);
  },
});

/**
 * Admin stats about settings.
 */
export const getSettingsStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allSettings = await ctx.db
      .query('appSettings')
      .filter(notDeleted)
      .take(1000);

    const now = Date.now();

    const stats = {
      totalSettings: allSettings.length,
      publicSettings: allSettings.filter((s) => s.isPublic).length,
      privateSettings: allSettings.filter((s) => !s.isPublic).length,
      categoryCounts: {} as Record<string, number>,
      recentlyUpdated: allSettings.filter((s) => s.updatedAt && now - s.updatedAt < 24 * 60 * 60 * 1000).length,
      oldestSetting: allSettings.length > 0 ? Math.min(...allSettings.map((s) => s.createdAt)) : 0,
      newestSetting: allSettings.length > 0 ? Math.max(...allSettings.map((s) => s.createdAt)) : 0,
      dataLimited: allSettings.length >= 1000,
    };

    for (const s of allSettings) {
      stats.categoryCounts[s.category] = (stats.categoryCounts[s.category] || 0) + 1;
    }

    return stats;
  },
});

/**
 * Search across settings (admin sees private, others public only).
 */
export const searchSettings = query({
  args: {
    searchTerm: v.string(),
    categories: v.optional(v.array(appSettingsValidators.category)),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, categories, limit = 20 }) => {
    const userIsAdmin = await isAdmin(ctx);

    let settings: any[];

    if (categories?.length === 1) {
      settings = await ctx.db
        .query('appSettings')
        .withIndex('by_category', (q) => q.eq('category', categories[0]))
        .filter(notDeleted)
        .collect();
    } else {
      settings = await ctx.db
        .query('appSettings')
        .filter(notDeleted)
        .take(500);

      if (categories?.length) {
        settings = settings.filter((s) => categories.includes(s.category));
      }
    }

    const term = searchTerm.toLowerCase();

    const filtered = settings
      .filter((s) => userIsAdmin || s.isPublic)
      .filter((s) =>
        s.key.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        (s.description?.toLowerCase().includes(term) ?? false) ||
        (typeof s.value === 'string' && s.value.toLowerCase().includes(term))
      )
      .slice(0, limit);

    return filtered.map((s) => ({
      ...s,
      value: userIsAdmin ? s.value : sanitizeSettingValue(s.value),
    }));
  },
});

/**
 * Settings history from auditLogs (admin only).
 */
export const getSettingsHistory = query({
  args: {
    key: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { key, limit = 50 }) => {
    await requireAdmin(ctx);

    let q = ctx.db
      .query('auditLogs')
      .filter((q) => q.eq(q.field('entityType'), 'settings'));

    if (key) {
      q = q.filter((q) => q.eq(q.field('entityId'), key));
    }

    const logs = await q.order('desc').take(limit);
    return logs;
  },
});
