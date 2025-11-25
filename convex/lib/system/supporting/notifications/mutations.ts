// convex/lib/system/supporting/notifications/mutations.ts
// Write operations for system notifications

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { notificationsValidators } from '@/schema/system/supporting/notifications/validators';
import { SYSTEM_NOTIFICATIONS_CONSTANTS } from './constants';
import {
  trimSystemNotificationData,
  validateSystemNotificationData,
} from './utils';
import { requireDeleteSystemNotificationAccess } from './permissions';

export const createSystemNotification = mutation({
  args: {
    data: v.object({
      title: v.string(),
      message: v.string(),
      type: notificationsValidators.notificationType,
      priority: notificationsValidators.priority,
      recipientId: v.id('userProfiles'),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemNotificationData(data);
    const errors = validateSystemNotificationData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'systemSupportingNotifications');

    const id = await ctx.db.insert('systemSupportingNotifications', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      isRead: SYSTEM_NOTIFICATIONS_CONSTANTS.DEFAULTS.IS_READ,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.notifications.created',
      entityType: 'systemSupportingNotifications',
      entityId: publicId,
      entityTitle: trimmed.title,
      description: 'Created notification',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const markSystemNotificationRead = mutation({
  args: { id: v.id('systemSupportingNotifications'), isRead: v.optional(v.boolean()) },
  handler: async (ctx, { id, isRead }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Notification not found');
    }

    // Only recipient or owner can mark as read
    if (existing.recipientId !== user._id && existing.ownerId !== user._id && user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('No permission to update this notification');
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      isRead: isRead ?? true,
      readAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.notifications.marked_read',
      entityType: 'systemSupportingNotifications',
      entityId: existing.publicId,
      entityTitle: existing.title,
      description: 'Marked notification read',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});

export const deleteSystemNotification = mutation({
  args: { id: v.id('systemSupportingNotifications') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireDeleteSystemNotificationAccess(existing, user);

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.notifications.deleted',
      entityType: 'systemSupportingNotifications',
      entityId: existing.publicId,
      entityTitle: existing.title,
      description: 'Deleted notification',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});
