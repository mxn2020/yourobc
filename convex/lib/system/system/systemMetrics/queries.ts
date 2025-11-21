// convex/lib/system/system/systemMetrics/queries.ts
// Read operations for systemMetrics module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterSystemMetricsByAccess, requireViewSystemMetricAccess } from './permissions';
import type { SystemMetricListResponse } from './types';

export const getSystemMetrics = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SystemMetricListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;

    let entities = await ctx.db
      .query('systemMetrics')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    entities = await filterSystemMetricsByAccess(ctx, entities, user);

    const total = entities.length;
    const items = entities.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

export const getSystemMetric = query({
  args: { entityId: v.id('systemMetrics') },
  handler: async (ctx, { entityId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('SystemMetric not found');
    }
    await requireViewSystemMetricAccess(ctx, entity, user);
    return entity;
  },
});

export const getSystemMetricByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db
      .query('systemMetrics')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();
    if (!entity) {
      throw new Error('SystemMetric not found');
    }
    await requireViewSystemMetricAccess(ctx, entity, user);
    return entity;
  },
});
