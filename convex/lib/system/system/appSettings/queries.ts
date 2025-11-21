// convex/lib/system/system/appSettings/queries.ts
// Read operations for appSettings module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterAppSettingsByAccess, requireViewAppSettingAccess } from './permissions';
import type { AppSettingListResponse } from './types';

export const getAppSettings = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<AppSettingListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    let appSettings = await ctx.db
      .query('appSettings')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    appSettings = await filterAppSettingsByAccess(ctx, appSettings, user);

    if (filters.category) {
      appSettings = appSettings.filter(item => item.category === filters.category);
    }

    if (filters.isPublic !== undefined) {
      appSettings = appSettings.filter(item => item.isPublic === filters.isPublic);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      appSettings = appSettings.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.key.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    const total = appSettings.length;
    const items = appSettings.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

export const getAppSetting = query({
  args: { appSettingId: v.id('appSettings') },
  handler: async (ctx, { appSettingId }) => {
    const user = await requireCurrentUser(ctx);
    const appSetting = await ctx.db.get(appSettingId);
    if (!appSetting || appSetting.deletedAt) {
      throw new Error('AppSetting not found');
    }
    await requireViewAppSettingAccess(ctx, appSetting, user);
    return appSetting;
  },
});

export const getAppSettingByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);
    const appSetting = await ctx.db
      .query('appSettings')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();
    if (!appSetting) {
      throw new Error('AppSetting not found');
    }
    await requireViewAppSettingAccess(ctx, appSetting, user);
    return appSetting;
  },
});
