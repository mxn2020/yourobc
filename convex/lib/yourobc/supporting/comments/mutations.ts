// convex/lib/yourobc/supporting/comments/mutations.ts
// convex/yourobc/supporting/comments/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { validateCommentData } from './utils';

export const createComment = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      entityType: entityTypes.commentable,
      entityId: v.string(),
      content: v.string(),
      type: v.optional(v.union(v.literal('note'), v.literal('status_update'), v.literal('customer_communication'), v.literal('internal'))),
      isInternal: v.optional(v.boolean()),
      mentions: v.optional(v.array(v.object({
        userId: v.string(),
        userName: v.string(),
      }))),
      parentCommentId: v.optional(v.id('yourobcComments')),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateCommentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // If this is a reply, verify parent exists
    if (data.parentCommentId) {
      const parentComment = await ctx.db.get(data.parentCommentId);
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const now = Date.now();

    const commentData: any = {
      entityType: data.entityType,
      entityId: data.entityId,
      content: data.content.trim(),
      type: data.type || 'note' as const,
      isInternal: data.isInternal || false,
      tags: [],
      createdAt: now,
      createdBy: authUserId,
    };

    // Add mentions if provided
    if (data.mentions && data.mentions.length > 0) {
      commentData.mentions = data.mentions;
    }

    // Add parentCommentId if this is a reply
    if (data.parentCommentId) {
      commentData.parentCommentId = data.parentCommentId;
    }

    const commentId = await ctx.db.insert('yourobcComments', commentData);

    // Update parent's reply count if this is a reply
    if (data.parentCommentId) {
      const parent = await ctx.db.get(data.parentCommentId);
      if (parent) {
        await ctx.db.patch(data.parentCommentId, {
          replyCount: (parent.replyCount || 0) + 1,
        });
      }
    }

    return commentId;
  },
});

export const updateComment = mutation({
  args: {
    authUserId: v.string(),
    commentId: v.id('yourobcComments'),
    data: v.object({
      content: v.optional(v.string()),
      editReason: v.optional(v.string()),
      isInternal: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, commentId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.createdBy !== authUserId) {
      throw new Error('Can only edit your own comments');
    }

    const errors = validateCommentData({ content: data.content });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const editHistory = (comment.editHistory || []) as Array<{
      content: string;
      editedAt: number;
      reason?: string;
    }>;

    // Add current version to edit history before updating
    if (data.content && data.content.trim() !== comment.content) {
      editHistory.push({
        content: comment.content, // Store previous content
        editedAt: now,
        reason: data.editReason,
      });
    }

    await ctx.db.patch(commentId, {
      content: data.content?.trim(),
      isInternal: data.isInternal !== undefined ? data.isInternal : comment.isInternal,
      isEdited: true,
      editHistory,
    });

    return commentId;
  },
});

export const deleteComment = mutation({
  args: {
    authUserId: v.string(),
    commentId: v.id('yourobcComments'),
  },
  handler: async (ctx, { authUserId, commentId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user owns the comment OR is admin/superadmin
    await requireOwnershipOrAdmin(ctx, authUserId, comment.createdBy);

    const now = Date.now();

    // Soft delete the comment
    await ctx.db.patch(commentId, {
      deletedAt: now,
      deletedBy: authUserId,
    });

    // Cascade delete all replies to this comment
    const replies = await ctx.db
      .query('yourobcComments')
      .filter((q) => q.eq(q.field('parentCommentId'), commentId))
      .collect();

    // Soft delete all replies
    for (const reply of replies) {
      await ctx.db.patch(reply._id, {
        deletedAt: now,
        deletedBy: authUserId,
      });
    }

    return commentId;
  },
});

export const addCommentReaction = mutation({
  args: {
    authUserId: v.string(),
    commentId: v.id('yourobcComments'),
    reaction: v.string(),
  },
  handler: async (ctx, { authUserId, commentId, reaction }) => {
    await requireCurrentUser(ctx, authUserId);

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Get current reactions or initialize empty array
    const reactions = (comment.reactions || []) as Array<{
      userId: string;
      reaction: string;
      createdAt: number;
    }>;

    // Check if user already reacted with this reaction
    const existingReactionIndex = reactions.findIndex(
      r => r.userId === authUserId && r.reaction === reaction
    );

    if (existingReactionIndex !== -1) {
      // Remove reaction if it exists (toggle off)
      reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      reactions.push({
        userId: authUserId,
        reaction,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(commentId, {
      reactions,
    });

    return commentId;
  },
});

