// convex/lib/yourobc/supporting/notifications/queries.ts
// Read operations for notifications module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterNotificationsByAccess, requireViewNotificationAccess } from './permissions';
import type { NotificationListResponse, NotificationStats } from './types';

/**
 * Get user's notifications
 */
export const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<NotificationListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor } = args;

    const page = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user', iq => iq.eq('userId', user._id))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    return {
      items: page.page,
      returnedCount: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get unread notifications only
 */
export const getUnreadNotifications = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor } = args;

    const page = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user_read', iq => iq.eq('userId', user._id).eq('isRead', false))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    return {
      items: page.page,
      returnedCount: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single notification
 */
export const getNotification = query({
  args: { id: v.id('yourobcNotifications') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireViewNotificationAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get notification stats
 */
export const getNotificationStats = query({
  args: {},
  handler: async (ctx): Promise<NotificationStats> => {
    const user = await requireCurrentUser(ctx);

    const items = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user', iq => iq.eq('userId', user._id))
      .filter(notDeleted)
      .collect();

    return {
      total: items.length,
      unread: items.filter(i => !i.isRead).length,
      read: items.filter(i => i.isRead).length,
    };
  },
});
