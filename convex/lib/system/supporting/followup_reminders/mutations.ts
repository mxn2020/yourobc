// convex/lib/system/supporting/followup_reminders/mutations.ts
// Write operations for system followup reminders

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { followupRemindersValidators } from '@/schema/system/supporting/followup_reminders/validators';
import { SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS } from './constants';
import {
  trimSystemFollowupReminderData,
  validateSystemFollowupReminderData,
} from './utils';
import {
  requireDeleteSystemFollowupReminderAccess,
  requireEditSystemFollowupReminderAccess,
} from './permissions';

export const createSystemFollowupReminder = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      entityType: v.string(),
      entityId: v.string(),
      type: followupRemindersValidators.reminderType,
      status: v.optional(followupRemindersValidators.reminderStatus),
      priority: v.optional(followupRemindersValidators.priority),
      dueDate: v.number(),
      assignedTo: v.optional(v.id('userProfiles')),
      notes: v.optional(v.string()),
      isRecurring: v.optional(v.boolean()),
      recurrencePattern: v.optional(
        v.object({
          frequency: followupRemindersValidators.recurrenceFrequency,
          interval: v.number(),
          endDate: v.optional(v.number()),
          maxOccurrences: v.optional(v.number()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemFollowupReminderData(data);

    const errors = validateSystemFollowupReminderData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'systemSupportingFollowupReminders');

    const id = await ctx.db.insert('systemSupportingFollowupReminders', {
      ...trimmed,
      name: trimmed.name,
      status: trimmed.status ?? SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS.DEFAULTS.STATUS,
      priority: trimmed.priority ?? SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS.DEFAULTS.PRIORITY,
      recurrencePattern: trimmed.recurrencePattern,
      publicId,
      ownerId: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.followup_reminders.created',
      entityType: 'followupReminders',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created followup reminder for ${trimmed.entityType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemFollowupReminder = mutation({
  args: {
    id: v.id('systemSupportingFollowupReminders'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(followupRemindersValidators.reminderStatus),
      priority: v.optional(followupRemindersValidators.priority),
      dueDate: v.optional(v.number()),
      assignedTo: v.optional(v.id('userProfiles')),
      notes: v.optional(v.string()),
      isRecurring: v.optional(v.boolean()),
      recurrencePattern: v.optional(
        v.object({
          frequency: followupRemindersValidators.recurrenceFrequency,
          interval: v.number(),
          endDate: v.optional(v.number()),
          maxOccurrences: v.optional(v.number()),
        })
      ),
      completedAt: v.optional(v.number()),
      snoozeUntil: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Reminder not found');
    }

    await requireEditSystemFollowupReminderAccess(ctx, existing, user);

    const trimmed = trimSystemFollowupReminderData(updates);
    const errors = validateSystemFollowupReminderData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

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
      action: 'system.followup_reminders.updated',
      entityType: 'followupReminders',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: 'Updated followup reminder',
      metadata: { updates: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteSystemFollowupReminder = mutation({
  args: { id: v.id('systemSupportingFollowupReminders') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Reminder not found');
    }

    await requireDeleteSystemFollowupReminderAccess(existing, user);

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
      action: 'system.followup_reminders.deleted',
      entityType: 'followupReminders',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Deleted followup reminder',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
