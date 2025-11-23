// convex/lib/system/notifications/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { NOTIFICATION_CONSTANTS } from './constants';
import { vNotificationType } from '@/shared/validators';
import { validateCreateNotificationData, canDeleteNotification, isAdmin } from './utils';
import { entityTypes } from '@/config/entityTypes';

/**
 * Create a notification
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'notifications:create' permission
 */
export const createNotification = mutation({
  args: {
    data: v.object({
      ownerId: v.id('userProfiles'),
      type: vNotificationType(),
      title: v.string(),
      message: v.string(),
      emoji: v.optional(v.string()),
      actionUrl: v.optional(v.string()),
      entityType: v.optional(entityTypes.all),
      entityId: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { data }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, NOTIFICATION_CONSTANTS.PERMISSIONS.CREATE);

    // 3. Validation
    const errors = validateCreateNotificationData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    // 4. Prepare notification data with trimmed strings
    const notificationData = {
      publicId: crypto.randomUUID(),
      displayName: `${data.type} - ${data.title.trim()}`,
      ownerId: data.ownerId,
      type: data.type,
      content: {
        title: data.title.trim(),
        message: data.message.trim(),
        emoji:
          data.emoji?.trim() ||
          NOTIFICATION_CONSTANTS.DEFAULT_EMOJIS[
            data.type as keyof typeof NOTIFICATION_CONSTANTS.DEFAULT_EMOJIS
          ] ||
          '📢',
        actionUrl: data.actionUrl?.trim(),
      },
      isRead: false,
      entityType: data.entityType,
      entityId: data.entityId?.trim(),
      metadata: {
        data: data.metadata,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
      deletedAt: undefined,
      deletedBy: undefined,
    };

    // 5. Insert notification
    const notificationId = await ctx.db.insert('notifications', notificationData);

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notification.created',
      entityType: 'notification',
      entityId: notificationId,
      entityTitle: notificationData.title,
      description: `Created notification: ${notificationData.title}`,
      createdAt: now,
    });

    // 7. Return notification ID
    return notificationId;
  },
});

/**
 * Mark notification as read
 * 🔒 Authentication: Required
 * 🔒 Authorization: Notification owner only
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, { notificationId }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.deletedAt) {
      throw new Error('Notification not found');
    }

    // Check ownership
    if (notification.ownerId !== user._id) {
      throw new Error('Access denied: Can only mark your own notifications as read');
    }

    const now = Date.now();

    await ctx.db.patch(notificationId, {
      isRead: true,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notification.marked_read',
      entityType: 'notification',
      entityId: notificationId,
      entityTitle: notification.content?.title ?? notification.displayName,
      description: `Marked notification as read: ${notification.content?.title ?? notification.displayName}`,
      createdAt: now,
    });

    return notificationId;
  },
});

/**
 * Mark all notifications as read for current user
 * 🔒 Authentication: Required
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_owner_and_read', (q) => q.eq('ownerId', user._id).eq('isRead', false))
      .collect();

    const now = Date.now();
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          updatedAt: now,
          updatedBy: user._id,
        })
      )
    );

    // Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notification.marked_all_read',
      entityType: 'notification',
      entityId: undefined,
      entityTitle: 'Bulk mark as read',
      description: `Marked ${unreadNotifications.length} notifications as read`,
      createdAt: now,
    });

    return unreadNotifications.length;
  },
});

/**
 * Delete notification (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Notification owner only + 'notifications:delete' permission
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, { notificationId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, NOTIFICATION_CONSTANTS.PERMISSIONS.DELETE);

    // 3. Get notification and check existence
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.deletedAt) {
      throw new Error('Notification not found');
    }

    // 4. Authorization - Ownership
    if (!canDeleteNotification(user._id, notification)) {
      throw new Error('Access denied: Can only delete your own notifications');
    }

    const now = Date.now();

    // 5. Soft delete the notification
    await ctx.db.patch(notificationId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notification.deleted',
      entityType: 'notification',
      entityId: notificationId,
      entityTitle: notification.content?.title ?? notification.displayName,
      description: `Deleted notification: ${notification.content?.title ?? notification.displayName}`,
      createdAt: now,
    });

    // 7. Return notification ID
    return notificationId;
  },
});

/**
 * Cleanup old read notifications (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only + 'notifications:cleanup' permission
 */
export const cleanupOldNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, NOTIFICATION_CONSTANTS.PERMISSIONS.CLEANUP, { allowAdmin: true });

    const cutoffDate =
      Date.now() -
      NOTIFICATION_CONSTANTS.LIMITS.CLEANUP_AFTER_DAYS * 24 * 60 * 60 * 1000;

    // 4. Get old notifications that are already read and not deleted
    const oldNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_created_at', (q) => q.lt('createdAt', cutoffDate))
      .filter((q) =>
        q.and(
          q.eq(q.field('isRead'), true),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect();

    const now = Date.now();

    // 5. Soft delete old notifications
    await Promise.all(
      oldNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        })
      )
    );

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notification.cleanup',
      entityType: 'notification',
      entityId: undefined,
      entityTitle: 'Bulk cleanup',
      description: `Cleaned up ${oldNotifications.length} old notifications`,
      createdAt: now,
    });

    // 7. Return count of cleaned notifications
    return oldNotifications.length;
  },
});
