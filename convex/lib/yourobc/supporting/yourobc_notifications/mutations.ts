// convex/lib/yourobc/supporting/yourobc_notifications/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notificationPriorityValidator } from '../../../../schema/yourobc/base';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { validateYourOBCNotificationData, generateActionUrl } from './utils';

export const createYourOBCNotification = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      userId: v.string(),
      type: v.union(
        v.literal('quote_expiring'),
        v.literal('sla_warning'),
        v.literal('payment_overdue'),
        v.literal('task_assigned'),
        v.literal('reminder_due'),
        v.literal('vacation_request'),
        v.literal('vacation_approved'),
        v.literal('vacation_denied'),
        v.literal('commission_ready'),
        v.literal('performance_review_due'),
        v.literal('employee_status_change')
      ),
      title: v.string(),
      message: v.string(),
      entityType: entityTypes.notifiable,
      entityId: v.string(),
      priority: v.optional(notificationPriorityValidator),
      actionUrl: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateYourOBCNotificationData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    const notificationData = {
      userId: data.userId,
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      entityType: data.entityType,
      entityId: data.entityId,
      priority: data.priority || 'normal' as const,
      isRead: false,
      actionUrl: data.actionUrl || generateActionUrl(data.entityType as any, data.entityId),
      tags: [],
      createdBy: authUserId,
      createdAt: now,
    };

    return await ctx.db.insert('yourobcNotifications', notificationData);
  },
});

export const markYourOBCNotificationRead = mutation({
  args: {
    authUserId: v.string(),
    notificationId: v.id('yourobcNotifications'),
  },
  handler: async (ctx, { authUserId, notificationId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Only the recipient can mark as read
    if (notification.userId !== authUserId) {
      throw new Error('Permission denied');
    }

    await ctx.db.patch(notificationId, {
      isRead: true,
    });

    return notificationId;
  },
});

export const markAllYourOBCNotificationsRead = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const unreadNotifications = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user_read', (q) => q.eq('userId', authUserId).eq('isRead', false))
      .collect();

    const updatePromises = unreadNotifications.map(notification =>
      ctx.db.patch(notification._id, { isRead: true })
    );

    await Promise.all(updatePromises);
    return unreadNotifications.length;
  },
});

