// convex/lib/system/system/notifications/mutations.ts
// Write operations for notifications module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { NOTIFICATIONS_CONSTANTS } from './constants';
import { validateNotificationData } from './utils';
import { requireEditNotificationAccess, requireDeleteNotificationAccess } from './permissions';
import type { NotificationId } from './types';

export const createNotification = mutation({
  args: {
    data: v.object({
      title: v.string(),
    }),
  },
  handler: async (ctx, { data }): Promise<NotificationId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, NOTIFICATIONS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });

    const errors = validateNotificationData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'notifications');
    const now = Date.now();

    const entityId = await ctx.db.insert('notifications', {
      publicId,
      title: data.title.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notifications.created',
      entityType: 'system_notifications',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created notifications: ${data.title.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const updateNotification = mutation({
  args: {
    entityId: v.id('notifications'),
    updates: v.object({
      title: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { entityId, updates }): Promise<NotificationId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireEditNotificationAccess(ctx, entity, user);

    const errors = validateNotificationData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }

    await ctx.db.patch(entityId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notifications.updated',
      entityType: 'system_notifications',
      entityId: entity.publicId,
      entityTitle: updateData.title || entity.title,
      description: `Updated notifications: ${updateData.title || entity.title}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const deleteNotification = mutation({
  args: { entityId: v.id('notifications') },
  handler: async (ctx, { entityId }): Promise<NotificationId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireDeleteNotificationAccess(entity, user);

    const now = Date.now();
    await ctx.db.patch(entityId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'notifications.deleted',
      entityType: 'system_notifications',
      entityId: entity.publicId,
      entityTitle: entity.title,
      description: `Deleted notifications: ${entity.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});
