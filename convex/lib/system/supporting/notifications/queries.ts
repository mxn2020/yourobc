// convex/lib/system/supporting/notifications/queries.ts
// Read operations for system notifications

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { notificationsValidators } from '@/schema/system/supporting/notifications/validators';
import {
  filterSystemNotificationsByAccess,
  requireViewSystemNotificationAccess,
} from './permissions';
import type { SystemNotificationFilters, SystemNotificationListResponse } from './types';

export const getSystemNotifications = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        type: v.optional(notificationsValidators.notificationType),
        priority: v.optional(notificationsValidators.priority),
        isRead: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemNotificationListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemNotificationFilters } = args;

    const page = await ctx.db
      .query('notifications')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemNotificationsByAccess(ctx, page.page, user);

    if (filters.type) {
      items = items.filter((item) => item.notificationType === filters.type);
    }

    if (filters.priority) {
      items = items.filter((item) => item.priority === filters.priority);
    }

    if (filters.isRead !== undefined) {
      items = items.filter((item) => Boolean(item.isRead) === filters.isRead);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemNotification = query({
  args: { id: v.id('notifications') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Notification not found');
    }

    await requireViewSystemNotificationAccess(ctx, doc, user);
    return doc;
  },
});
