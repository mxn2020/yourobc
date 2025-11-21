// convex/lib/system/system/notifications/queries.ts
// Read operations for notifications module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterNotificationsByAccess, requireViewNotificationAccess } from './permissions';
import type { NotificationListResponse } from './types';

export const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<NotificationListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0 } = args;

    let entities = await ctx.db
      .query('notifications')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    entities = await filterNotificationsByAccess(ctx, entities, user);

    const total = entities.length;
    const items = entities.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

export const getNotification = query({
  args: { entityId: v.id('notifications') },
  handler: async (ctx, { entityId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('Notification not found');
    }
    await requireViewNotificationAccess(ctx, entity, user);
    return entity;
  },
});

export const getNotificationByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db
      .query('notifications')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();
    if (!entity) {
      throw new Error('Notification not found');
    }
    await requireViewNotificationAccess(ctx, entity, user);
    return entity;
  },
});
