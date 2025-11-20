// convex/lib/boilerplate/notifications/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { NOTIFICATION_CONSTANTS } from './constants';

/**
 * Get notifications for current user
 * 🔒 Authentication: Required
 */
export const getNotifications = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        isRead: v.optional(v.boolean()),
        type: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    const { limit = 50, offset = 0 } = options;

    // ✅ Use indexed query for user's notifications
    let notificationQuery = ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id));

    if (options.isRead !== undefined) {
      notificationQuery = notificationQuery.filter((q) =>
        q.eq(q.field('isRead'), options.isRead)
      );
    }

    if (options.type?.length) {
      notificationQuery = notificationQuery.filter((q) =>
        q.or(...options.type!.map((type) => q.eq(q.field('type'), type)))
      );
    }

    const notifications = await notificationQuery.order('desc').take(limit + offset);

    return {
      notifications: notifications.slice(offset, offset + limit),
      total: notifications.length,
      hasMore: notifications.length > offset + limit,
    };
  },
});

/**
 * Get unread notification count for current user
 * 🔒 Authentication: Required
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) => q.eq('userId', user._id).eq('isRead', false))
      .collect();

    return unreadNotifications.length;
  },
});

/**
 * Get a single notification by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Notification owner only
 */
export const getNotification = query({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, { notificationId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check ownership
    if (notification.userId !== user._id) {
      throw new Error('Access denied: Can only access your own notifications');
    }

    return notification;
  },
});