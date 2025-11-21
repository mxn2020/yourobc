// convex/lib/system/system/permissionRequests/queries.ts
// Read operations for permissionRequests module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterPermissionRequestsByAccess, requireViewPermissionRequestAccess } from './permissions';
import type { PermissionRequestListResponse } from './types';

export const getPermissionRequests = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PermissionRequestListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;

    let entities = await ctx.db
      .query('permissionRequests')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    entities = await filterPermissionRequestsByAccess(ctx, entities, user);

    const total = entities.length;
    const items = entities.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

export const getPermissionRequest = query({
  args: { entityId: v.id('permissionRequests') },
  handler: async (ctx, { entityId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('PermissionRequest not found');
    }
    await requireViewPermissionRequestAccess(ctx, entity, user);
    return entity;
  },
});

export const getPermissionRequestByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db
      .query('permissionRequests')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();
    if (!entity) {
      throw new Error('PermissionRequest not found');
    }
    await requireViewPermissionRequestAccess(ctx, entity, user);
    return entity;
  },
});
