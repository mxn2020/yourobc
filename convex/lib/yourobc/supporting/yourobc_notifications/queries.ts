// convex/lib/yourobc/supporting/yourobc_notifications/queries.ts
// convex/yourobc/supporting/yourobcNotifications/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';

export const getYourOBCNotifications = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      isRead: v.optional(v.boolean()),
      type: v.optional(v.array(v.string())),
      priority: v.optional(v.array(v.string())),
      limit: v.optional(v.number()),
    }))
  },
  handler: async (ctx, { authUserId, filters = {} }) => {
    await requireCurrentUser(ctx, authUserId);
    
    let notificationsQuery = ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user', (q) => q.eq('userId', authUserId));

    if (filters.isRead !== undefined) {
      notificationsQuery = ctx.db
        .query('yourobcNotifications')
        .withIndex('by_user_read', (q) => q.eq('userId', authUserId).eq('isRead', filters.isRead!));
    }

    let notifications = await notificationsQuery
      .order('desc')
      .take(filters.limit || 50);

    // Apply additional filters
    if (filters.type?.length) {
      notifications = notifications.filter(notification =>
        filters.type!.includes(notification.type)
      );
    }

    if (filters.priority?.length) {
      notifications = notifications.filter(notification =>
        filters.priority!.includes(notification.priority)
      );
    }

    return notifications;
  },
});

export const getUnreadYourOBCNotificationCount = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const unreadNotifications = await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_user_read', (q) => q.eq('userId', authUserId).eq('isRead', false))
      .collect();

    return unreadNotifications.length;
  },
});

export const getYourOBCNotificationsByEntity = query({
  args: {
    authUserId: v.string(),
    entityType: entityTypes.notifiable,
    entityId: v.string(),
  },
  handler: async (ctx, { authUserId, entityType, entityId }) => {
    await requireCurrentUser(ctx, authUserId);

    return await ctx.db
      .query('yourobcNotifications')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .order('desc')
      .collect();
  },
});

