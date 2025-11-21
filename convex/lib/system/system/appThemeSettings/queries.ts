// convex/lib/system/system/appThemeSettings/queries.ts
// Read operations for appThemeSettings module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterAppThemeSettingsByAccess, requireViewAppThemeSettingAccess } from './permissions';
import type { AppThemeSettingListResponse } from './types';

export const getAppThemeSettings = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<AppThemeSettingListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;

    let entities = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    entities = await filterAppThemeSettingsByAccess(ctx, entities, user);

    const total = entities.length;
    const items = entities.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

export const getAppThemeSetting = query({
  args: { entityId: v.id('appThemeSettings') },
  handler: async (ctx, { entityId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('AppThemeSetting not found');
    }
    await requireViewAppThemeSettingAccess(ctx, entity, user);
    return entity;
  },
});

export const getAppThemeSettingByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db
      .query('appThemeSettings')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();
    if (!entity) {
      throw new Error('AppThemeSetting not found');
    }
    await requireViewAppThemeSettingAccess(ctx, entity, user);
    return entity;
  },
});
