// convex/lib/system/supporting/comments/mutations.ts
// Write operations for system comments

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { commentsValidators, commentsFields } from '@/schema/system/supporting/comments/validators';
import {
  trimSystemCommentData,
  validateSystemCommentData,
  isValidSystemReaction,
} from './utils';
import {
  requireDeleteSystemCommentAccess,
  requireEditSystemCommentAccess,
} from './permissions';

export const createSystemComment = mutation({
  args: {
    data: v.object({
      name: v.string(),
      content: v.string(),
      entityType: v.string(),
      entityId: v.string(),
      type: v.optional(commentsValidators.commentType),
      isInternal: v.boolean(),
      mentions: v.optional(v.array(commentsFields.mention)),
      attachments: v.optional(v.array(commentsFields.attachment)),
      parentCommentId: v.optional(v.id('systemSupportingComments')),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemCommentData(data);
    const errors = validateSystemCommentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'systemSupportingComments');

    const id = await ctx.db.insert('systemSupportingComments', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      replyCount: trimmed.parentCommentId ? undefined : 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.comments.created',
      entityType: 'systemSupportingComments',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created comment on ${trimmed.entityType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemComment = mutation({
  args: {
    id: v.id('systemSupportingComments'),
    updates: v.object({
      name: v.optional(v.string()),
      content: v.optional(v.string()),
      isInternal: v.optional(v.boolean()),
      mentions: v.optional(v.array(commentsFields.mention)),
      attachments: v.optional(v.array(commentsFields.attachment)),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    await requireEditSystemCommentAccess(ctx, existing, user);

    const trimmed = trimSystemCommentData(updates);
    const errors = validateSystemCommentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...trimmed,
      isEdited: true,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.comments.updated',
      entityType: 'systemSupportingComments',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: 'Updated comment',
      metadata: { 
        data: {
        updates: trimmed 
      },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const addSystemCommentReaction = mutation({
  args: {
    id: v.id('systemSupportingComments'),
    reaction: v.string(),
  },
  handler: async (ctx, { id, reaction }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    if (!isValidSystemReaction(reaction)) {
      throw new Error('Invalid reaction');
    }

    const now = Date.now();
    const reactions = existing.reactions ?? [];
    reactions.push({ userId: user._id, reaction, createdAt: now });

    await ctx.db.patch(id, {
      reactions,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.comments.reacted',
      entityType: 'systemSupportingComments',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Added reaction ${reaction}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});

export const deleteSystemComment = mutation({
  args: { id: v.id('systemSupportingComments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    await requireDeleteSystemCommentAccess(existing, user);

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
      action: 'system.comments.deleted',
      entityType: 'systemSupportingComments',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Deleted comment',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});
