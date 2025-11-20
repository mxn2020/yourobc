// convex/lib/yourobc/supporting/followup_reminders/queries.ts
// convex/yourobc/supporting/followupReminders/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { isReminderOverdue, isReminderDue } from './utils';
import { REMINDER_CONSTANTS } from './constants';
import { reminderStatusValidator } from '../../../../schema/yourobc/base';

export const getReminders = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      status: v.optional(v.array(v.string())),
      type: v.optional(v.array(v.string())),
      priority: v.optional(v.array(v.string())),
      assignedTo: v.optional(v.string()),
      entityType: v.optional(entityTypes.all),
      entityId: v.optional(v.string()),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, filters = {}, limit }) => {
    await requireCurrentUser(ctx, authUserId);

    let remindersQuery = ctx.db.query('yourobcFollowupReminders');

    // Filter out soft-deleted reminders
    remindersQuery = remindersQuery.filter((q) =>
      q.eq(q.field('deletedAt'), undefined)
    );

    // Show only user's reminders unless they're admin
    remindersQuery = remindersQuery.filter((q) =>
      q.or(
        q.eq(q.field('assignedTo'), authUserId),
        q.eq(q.field('createdBy'), authUserId)
      )
    );

    if (filters.status?.length) {
      remindersQuery = remindersQuery.filter((q) =>
        q.or(...filters.status!.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (filters.type?.length) {
      remindersQuery = remindersQuery.filter((q) =>
        q.or(...filters.type!.map(t => q.eq(q.field('type'), t)))
      );
    }

    if (filters.priority?.length) {
      remindersQuery = remindersQuery.filter((q) =>
        q.or(...filters.priority!.map(p => q.eq(q.field('priority'), p)))
      );
    }

    if (filters.assignedTo) {
      remindersQuery = remindersQuery.filter((q) =>
        q.eq(q.field('assignedTo'), filters.assignedTo)
      );
    }

    if (filters.entityType) {
      remindersQuery = remindersQuery.filter((q) =>
        q.eq(q.field('entityType'), filters.entityType)
      );
    }

    if (filters.entityId) {
      remindersQuery = remindersQuery.filter((q) =>
        q.eq(q.field('entityId'), filters.entityId)
      );
    }

    const reminders = limit
      ? await remindersQuery.order('asc').take(limit)
      : await remindersQuery.order('asc').collect();

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }));
  },
});

export const getDueReminders = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 10 }) => {
    await requireCurrentUser(ctx, authUserId);

    const now = Date.now();

    const reminders = await ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_dueDate', (q) => q.lte('dueDate', now))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), REMINDER_CONSTANTS.STATUS.PENDING),
          q.eq(q.field('assignedTo'), authUserId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .take(limit);

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: true,
    }));
  },
});

export const getOverdueReminders = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 10 }) => {
    await requireCurrentUser(ctx, authUserId);

    const now = Date.now();

    const reminders = await ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_dueDate', (q) => q.lte('dueDate', now))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), REMINDER_CONSTANTS.STATUS.PENDING),
          q.eq(q.field('assignedTo'), authUserId),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect();

    // Filter only overdue reminders (not just due)
    const overdueReminders = reminders.filter(reminder => isReminderOverdue(reminder));

    return overdueReminders.slice(0, limit).map(reminder => ({
      ...reminder,
      isOverdue: true,
      isDue: true,
    }));
  },
});

export const getRemindersByEntity = query({
  args: {
    authUserId: v.string(),
    entityType: entityTypes.all,
    entityId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(reminderStatusValidator),
  },
  handler: async (ctx, { authUserId, entityType, entityId, limit, status }) => {
    await requireCurrentUser(ctx, authUserId);

    let remindersQuery = ctx.db
      .query('yourobcFollowupReminders')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .filter((q) =>
        q.eq(q.field('deletedAt'), undefined)
      )
      .order('desc');

    // Apply status filter if provided
    if (status) {
      remindersQuery = remindersQuery.filter((q) =>
        q.eq(q.field('status'), status)
      );
    }

    const reminders = limit ? await remindersQuery.take(limit) : await remindersQuery.collect();

    return reminders.map(reminder => ({
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    }));
  },
});

export const getReminder = query({
  args: {
    authUserId: v.string(),
    reminderId: v.id('yourobcFollowupReminders'),
  },
  handler: async (ctx, { authUserId, reminderId }) => {
    await requireCurrentUser(ctx, authUserId);

    const reminder = await ctx.db.get(reminderId);

    if (!reminder) {
      throw new Error('Reminder not found');
    }

    // Check if reminder is soft-deleted
    if (reminder.deletedAt) {
      throw new Error('Reminder has been deleted');
    }

    // Check if user has access to this reminder
    if (reminder.assignedTo !== authUserId && reminder.createdBy !== authUserId) {
      throw new Error('Access denied');
    }

    return {
      ...reminder,
      isOverdue: isReminderOverdue(reminder),
      isDue: isReminderDue(reminder),
    };
  },
});

