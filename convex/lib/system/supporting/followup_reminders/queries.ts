// convex/lib/system/supporting/followup_reminders/queries.ts
// Read operations for system followup reminders

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { followupRemindersValidators } from '@/schema/system/supporting/followup_reminders/validators';
import {
  filterSystemFollowupRemindersByAccess,
  requireViewSystemFollowupReminderAccess,
} from './permissions';
import type { SystemFollowupReminderFilters, SystemFollowupReminderListResponse } from './types';

export const getSystemFollowupReminders = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        status: v.optional(followupRemindersValidators.reminderStatus),
        priority: v.optional(followupRemindersValidators.priority),
        assignedTo: v.optional(v.id('userProfiles')),
        dueDateFrom: v.optional(v.number()),
        dueDateTo: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemFollowupReminderListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemFollowupReminderFilters } = args;

    const page = await ctx.db
      .query('systemSupportingFollowupReminders')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemFollowupRemindersByAccess(ctx, page.page, user);

    if (filters.entityType) {
      items = items.filter((item) => item.entityType === filters.entityType);
    }

    if (filters.entityId) {
      items = items.filter((item) => item.entityId === filters.entityId);
    }

    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters.priority) {
      items = items.filter((item) => item.priority === filters.priority);
    }

    if (filters.assignedTo) {
      items = items.filter((item) => item.assignedTo === filters.assignedTo);
    }

    if (filters.dueDateFrom) {
      items = items.filter((item) => item.dueDate >= filters.dueDateFrom!);
    }

    if (filters.dueDateTo) {
      items = items.filter((item) => item.dueDate <= filters.dueDateTo!);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemFollowupReminder = query({
  args: { id: v.id('systemSupportingFollowupReminders') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Reminder not found');
    }

    await requireViewSystemFollowupReminderAccess(ctx, doc, user);
    return doc;
  },
});
