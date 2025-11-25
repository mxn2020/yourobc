// convex/lib/yourobc/supporting/followup_reminders/queries.ts
// Read operations for followup reminders module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterFollowupRemindersByAccess, requireViewFollowupReminderAccess } from './permissions';
import { followupRemindersValidators } from '@/schema/yourobc/supporting/followup_reminders/validators';
import type { FollowupReminderListResponse, FollowupReminderFilters } from './types';

/**
 * Get reminders assigned to user
 */
export const getMyReminders = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    status: v.optional(followupRemindersValidators.reminderStatus),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, status } = args;

    let q = ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_assignedTo', iq => iq.eq('assignedTo', user._id))
      .filter(notDeleted);

    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    let items = page.page;
    if (status) {
      items = items.filter(i => i.status === status);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get reminders by due date
 */
export const getRemindersByDueDate = query({
  args: {
    dueDateFrom: v.number(),
    dueDateTo: v.number(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { dueDateFrom, dueDateTo, limit = 50, cursor } = args;

    const page = await ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_dueDate', iq => iq.gte('dueDate', dueDateFrom).lte('dueDate', dueDateTo))
      .filter(notDeleted)
      .order('asc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filterFollowupRemindersByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single reminder
 */
export const getFollowupReminder = query({
  args: { id: v.id('yourobcFollowupReminders') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Reminder not found');
    }

    await requireViewFollowupReminderAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Count reminders by status
 */
export const countRemindersByStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const items = await ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_assignedTo', iq => iq.eq('assignedTo', user._id))
      .filter(notDeleted)
      .collect();

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      completed: items.filter(i => i.status === 'completed').length,
      overdue: items.filter(i => i.dueDate < Date.now() && i.status !== 'completed').length,
    };
  },
});
