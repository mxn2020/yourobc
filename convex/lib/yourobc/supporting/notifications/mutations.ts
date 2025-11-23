// convex/lib/yourobc/supporting/notifications/mutations.ts
// Write operations for notifications module

import { mutation, internalMutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { NOTIFICATIONS_CONSTANTS } from './constants';
import { validateNotificationData } from './utils';
import { requireDeleteNotificationAccess } from './permissions';

/**
 * Create a notification (internal - for system use)
 */
export const createNotification = internalMutation({
  args: {
    data: v.object({
      userId: v.string(),
      type: v.string(),
      title: v.string(),
      message: v.string(),
      entityType: v.string(),
      entityId: v.string(),
      priority: v.optional(v.string()),
      actionUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }) => {
    const errors = validateNotificationData(data);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();

    return await ctx.db.insert('yourobcNotifications', {
      ...data,
      isRead: NOTIFICATIONS_CONSTANTS.DEFAULTS.IS_READ,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });
  },
});

/**
 * Mark notification as read
 */
export const markNotificationAsRead = mutation({
  args: { id: v.id('yourobcNotifications') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Notification not found');
    }

    if (doc.userId !== user._id && user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('No permission to mark this notification');
    }

    const now = Date.now();

    await ctx.db.patch(id, {
      isRead: true,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const notifications = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user_read', iq => iq.eq('userId', user._id).eq('isRead', false))
      .collect();

    for (const notif of notifications) {
      if (!notif.deletedAt) {
        await ctx.db.patch(notif._id, {
          isRead: true,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    }

    return notifications.length;
  },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
  args: { id: v.id('yourobcNotifications') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireDeleteNotificationAccess(doc, user);

    const now = Date.now();

    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Delete all notifications for a user
 */
export const deleteAllNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const notifications = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user', iq => iq.eq('userId', user._id))
      .filter(doc => !doc.deletedAt)
      .collect();

    for (const notif of notifications) {
      await ctx.db.patch(notif._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    return notifications.length;
  },
});
