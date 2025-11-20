// convex/lib/yourobc/supporting/followup_reminders/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper';
import { servicePriorityValidator } from '../../../../schema/yourobc/base';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { validateReminderData } from './utils';

export const createReminder = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      type: v.union(
        v.literal('follow_up'),
        v.literal('deadline'),
        v.literal('review'),
        v.literal('payment'),
        v.literal('vacation_approval'),
        v.literal('commission_review'),
        v.literal('performance_review')
      ),
      entityType: entityTypes.all,
      entityId: v.string(),
      dueDate: v.number(),
      reminderDate: v.optional(v.number()),
      priority: v.optional(servicePriorityValidator),
      assignedTo: v.string(),
      emailReminder: v.optional(v.boolean()),
      isRecurring: v.optional(v.boolean()),
      recurrencePattern: v.optional(v.object({
        frequency: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly')),
        interval: v.number(),
        endDate: v.optional(v.number()),
        maxOccurrences: v.optional(v.number()),
      })),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateReminderData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    const reminderData = {
      title: data.title.trim(),
      description: data.description?.trim(),
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      dueDate: data.dueDate,
      priority: data.priority || 'standard' as const,
      assignedTo: data.assignedTo,
      assignedBy: authUserId,
      status: 'pending' as const,
      emailReminder: data.emailReminder || false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    return await ctx.db.insert('yourobcFollowupReminders', reminderData);
  },
});

export const updateReminder = mutation({
  args: {
    authUserId: v.string(),
    reminderId: v.id('yourobcFollowupReminders'),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      priority: v.optional(servicePriorityValidator),
      assignedTo: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, reminderId, data }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const reminder = await ctx.db.get(reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    const errors = validateReminderData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    await ctx.db.patch(reminderId, {
      ...data,
      updatedAt: Date.now(),
    });

    return reminderId;
  },
});

export const completeReminder = mutation({
  args: {
    authUserId: v.string(),
    reminderId: v.id('yourobcFollowupReminders'),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, reminderId, completionNotes }) => {
    await requireCurrentUser(ctx, authUserId);

    const reminder = await ctx.db.get(reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    if (reminder.status === 'completed') {
      throw new Error('Reminder is already completed');
    }

    const now = Date.now();

    await ctx.db.patch(reminderId, {
      status: 'completed' as const,
      completedAt: now,
      completedBy: authUserId,
      completionNotes: completionNotes,
      updatedAt: now,
    });

    return reminderId;
  },
});

export const snoozeReminder = mutation({
  args: {
    authUserId: v.string(),
    reminderId: v.id('yourobcFollowupReminders'),
    snoozeUntil: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, reminderId, snoozeUntil, reason }) => {
    await requireCurrentUser(ctx, authUserId);

    const reminder = await ctx.db.get(reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    if (reminder.status === 'completed') {
      throw new Error('Cannot snooze a completed reminder');
    }

    const now = Date.now();

    await ctx.db.patch(reminderId, {
      status: 'snoozed' as const,
      snoozeUntil: snoozeUntil,
      snoozeReason: reason,
      snoozedBy: authUserId,
      snoozedAt: now,
      updatedAt: now,
    });

    return reminderId;
  },
});

export const deleteReminder = mutation({
  args: {
    authUserId: v.string(),
    reminderId: v.id('yourobcFollowupReminders'),
  },
  handler: async (ctx, { authUserId, reminderId }) => {
    const reminder = await ctx.db.get(reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    // Check if user owns the reminder OR is admin/superadmin
    await requireOwnershipOrAdmin(ctx, authUserId, reminder.assignedBy);

    const now = Date.now();

    // Soft delete the reminder
    await ctx.db.patch(reminderId, {
      deletedAt: now,
      deletedBy: authUserId,
      updatedAt: now,
    });

    return reminderId;
  },
});

