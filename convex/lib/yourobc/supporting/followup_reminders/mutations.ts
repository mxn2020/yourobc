// convex/lib/yourobc/supporting/followup_reminders/mutations.ts
// Write operations for followup reminders module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { followupRemindersValidators } from '@/schema/yourobc/supporting/followup_reminders/validators';
import { FOLLOWUP_REMINDERS_CONSTANTS } from './constants';
import { trimFollowupReminderData, validateFollowupReminderData, calculateSnoozeUntil } from './utils';
import { requireEditFollowupReminderAccess, requireDeleteFollowupReminderAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create a new reminder
 */
export const createFollowupReminder = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      type: v.string(),
      entityType: v.string(),
      entityId: v.string(),
      dueDate: v.number(),
      reminderDate: v.optional(v.number()),
      priority: followupRemindersValidators.priority,
      assignedTo: v.string(),
      status: v.optional(followupRemindersValidators.reminderStatus),
      emailReminder: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, FOLLOWUP_REMINDERS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    const trimmed = trimFollowupReminderData(data);
    const errors = validateFollowupReminderData(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    const id = await ctx.db.insert('yourobcFollowupReminders', {
      ...trimmed,
      status: trimmed.status ?? 'pending',
      emailReminder: trimmed.emailReminder ?? FOLLOWUP_REMINDERS_CONSTANTS.DEFAULTS.EMAIL_REMINDER,
      assignedBy: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'followup_reminders.created',
      entityType: 'yourobcFollowupReminders',
      entityId: trimmed.entityId,
      entityTitle: trimmed.title,
      description: `Created reminder: ${trimmed.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update a reminder
 */
export const updateFollowupReminder = mutation({
  args: {
    id: v.id('yourobcFollowupReminders'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      reminderDate: v.optional(v.number()),
      priority: v.optional(followupRemindersValidators.priority),
      status: v.optional(followupRemindersValidators.reminderStatus),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);

    if (!existing || existing.deletedAt) throw new Error('Reminder not found');

    await requireEditFollowupReminderAccess(ctx, existing, user);

    const trimmed = trimFollowupReminderData(updates);
    const errors = validateFollowupReminderData(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();

    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'followup_reminders.updated',
      entityType: 'yourobcFollowupReminders',
      entityId: existing.entityId,
      entityTitle: trimmed.title || existing.title,
      description: `Updated reminder: ${existing.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Complete a reminder
 */
export const completeFollowupReminder = mutation({
  args: {
    id: v.id('yourobcFollowupReminders'),
    completionNotes: v.optional(v.string()),
  },
  handler: async (ctx, { id, completionNotes }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);

    if (!existing || existing.deletedAt) throw new Error('Reminder not found');

    const now = Date.now();

    await ctx.db.patch(id, {
      status: 'completed',
      completedAt: now,
      completedBy: user._id,
      completionNotes,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'followup_reminders.completed',
      entityType: 'yourobcFollowupReminders',
      entityId: existing.entityId,
      entityTitle: existing.title,
      description: `Completed reminder: ${existing.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Snooze a reminder
 */
export const snoozeFollowupReminder = mutation({
  args: {
    id: v.id('yourobcFollowupReminders'),
    days: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, days, reason }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);

    if (!existing || existing.deletedAt) throw new Error('Reminder not found');

    const snoozeUntil = calculateSnoozeUntil(days);
    const now = Date.now();

    await ctx.db.patch(id, {
      snoozeUntil,
      snoozeReason: reason,
      snoozedAt: now,
      snoozedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Delete a reminder
 */
export const deleteFollowupReminder = mutation({
  args: { id: v.id('yourobcFollowupReminders') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);

    if (!existing || existing.deletedAt) throw new Error('Reminder not found');

    await requireDeleteFollowupReminderAccess(existing, user);

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
      action: 'followup_reminders.deleted',
      entityType: 'yourobcFollowupReminders',
      entityId: existing.entityId,
      entityTitle: existing.title,
      description: `Deleted reminder: ${existing.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
