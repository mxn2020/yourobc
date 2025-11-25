// convex/lib/system/supporting/followupReminders.ts
// Supporting module: follow-up reminders (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators, supportingFields } from '@/schema/system/supporting/validators';
import { entityTypes } from '@/config/entityTypes';

const PERMISSIONS = {
  VIEW: 'supporting.followups:view',
  CREATE: 'supporting.followups:create',
  EDIT: 'supporting.followups:edit',
  DELETE: 'supporting.followups:delete',
} as const;

export const listFollowupReminders = query({
  args: {
    status: v.optional(supportingValidators.reminderStatus),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { status, limit = 50, cursor }) => {
    const user = await requireCurrentUser(ctx);
    const q = ctx.db.query('followupReminders').filter(notDeleted);
    const filtered = status ? q.withIndex('by_status', (idx) => idx.eq('status', status)) : q;
    const page = await filtered.order('desc').paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const createFollowupReminder = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: supportingValidators.reminderType,
    entityType: entityTypes.all,
    entityId: v.string(),
    dueDate: v.number(),
    priority: supportingValidators.servicePriority,
    assignedTo: v.id('userProfiles'),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'followupReminders');

    const id = await ctx.db.insert('followupReminders', {
      publicId,
      ownerId: user._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      type: args.type,
      entityType: args.entityType,
      entityId: args.entityId.trim(),
      dueDate: args.dueDate,
      priority: args.priority,
      assignedTo: args.assignedTo,
      assignedBy: user._id,
      status: 'pending',
      emailReminder: true,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.followups.created',
      entityType: 'followupReminders',
      entityId: publicId,
      entityTitle: args.title,
      description: `Created follow-up reminder ${args.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

export const completeFollowupReminder = mutation({
  args: { id: v.id('followupReminders') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, {
      status: 'completed',
      completedAt: now,
      completedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.followups.completed',
      entityType: 'followupReminders',
      entityId: existing.publicId,
      entityTitle: existing.title,
      description: 'Completed follow-up reminder',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return true;
  },
});
