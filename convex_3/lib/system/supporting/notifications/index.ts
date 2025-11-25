// convex/lib/system/supporting/notifications.ts
// Supporting module: notifications (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';
import { entityTypes } from '@/config/entityTypes';

const PERMISSIONS = {
  VIEW: 'supporting.notifications:view',
  CREATE: 'supporting.notifications:create',
  EDIT: 'supporting.notifications:edit',
  DELETE: 'supporting.notifications:delete',
} as const;

export const listNotifications = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, cursor }) => {
    const user = await requireCurrentUser(ctx);
    const page = await ctx.db
      .query('notifications')
      .withIndex('by_user_id', (idx) => idx.eq('userId', user._id))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const markNotificationRead = mutation({
  args: { id: v.id('notifications'), isRead: v.boolean() },
  handler: async (ctx, { id, isRead }) => {
    const user = await requireCurrentUser(ctx);
    const notification = await ctx.db.get(id);
    if (!notification || notification.deletedAt) throw new Error('Not found');
    if (notification.userId !== user._id) throw new Error('Forbidden');

    const now = Date.now();
    await ctx.db.patch(id, { isRead, updatedAt: now, updatedBy: user._id });
    return true;
  },
});

export const createNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    entityType: entityTypes.notifiable,
    entityId: v.string(),
    priority: supportingValidators.notificationPriority,
    userId: v.id('userProfiles'),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'notifications');

    return await ctx.db.insert('notifications', {
      publicId,
      ownerId: user._id,
      title: args.title.trim(),
      message: args.message.trim(),
      entityType: args.entityType,
      entityId: args.entityId.trim(),
      priority: args.priority,
      isRead: false,
      userId: args.userId,
      actionUrl: args.actionUrl?.trim(),
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});
