// convex/lib/yourobc/supporting/comments/mutations.ts
// Write operations for comments module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { commentsValidators } from '@/schema/yourobc/supporting/comments/validators';
import { COMMENTS_CONSTANTS } from './constants';
import { trimCommentData, validateCommentData, isValidReaction } from './utils';
import { requireEditCommentAccess, requireDeleteCommentAccess } from './permissions';

/**
 * Create a new comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have CREATE permission
 */
export const createComment = mutation({
  args: {
    data: v.object({
      entityType: v.string(),
      entityId: v.string(),
      content: v.string(),
      type: v.optional(commentsValidators.commentType),
      isInternal: v.optional(v.boolean()),
      mentions: v.optional(v.array(v.object({
        userId: v.string(),
        userName: v.string(),
      }))),
      attachments: v.optional(v.array(v.object({
        filename: v.string(),
        fileUrl: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
      }))),
      parentCommentId: v.optional(v.id('comments')),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, COMMENTS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Trim and validate
    const trimmed = trimCommentData(data);
    const errors = validateCommentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Insert record
    const id = await ctx.db.insert('comments', {
      ...trimmed,
      isInternal: trimmed.isInternal ?? COMMENTS_CONSTANTS.DEFAULTS.IS_INTERNAL,
      replyCount: COMMENTS_CONSTANTS.DEFAULTS.REPLY_COUNT,
      isEdited: false,
      mentions: trimmed.mentions ?? [],
      attachments: trimmed.attachments ?? [],
      reactions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'comments.created',
      entityType: 'yourobcComments',
      entityId: trimmed.entityId,
      entityTitle: `Comment on ${trimmed.entityType}`,
      description: `Created comment on ${trimmed.entityType}: ${trimmed.entityId}`,
      metadata: { isInternal: trimmed.isInternal },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const updateComment = mutation({
  args: {
    id: v.id('comments'),
    updates: v.object({
      content: v.optional(v.string()),
      isInternal: v.optional(v.boolean()),
      mentions: v.optional(v.array(v.object({
        userId: v.string(),
        userName: v.string(),
      }))),
      attachments: v.optional(v.array(v.object({
        filename: v.string(),
        fileUrl: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
      }))),
    }),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, updates, reason }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    // Check permissions
    await requireEditCommentAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimCommentData(updates);
    const errors = validateCommentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Add to edit history if content changed
    const editHistory = existing.editHistory ?? [];
    if (trimmed.content && trimmed.content !== existing.content) {
      editHistory.push({
        content: existing.content,
        editedAt: now,
        reason,
      });
    }

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      isEdited: true,
      editHistory: editHistory.slice(-COMMENTS_CONSTANTS.LIMITS.MAX_EDIT_HISTORY),
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'comments.updated',
      entityType: 'yourobcComments',
      entityId: existing.entityId,
      entityTitle: `Comment on ${existing.entityType}`,
      description: `Updated comment on ${existing.entityType}`,
      metadata: { changes: trimmed, editReason: reason },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Add reaction to a comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: All authenticated users
 */
export const addCommentReaction = mutation({
  args: {
    commentId: v.id('comments'),
    reaction: v.string(),
  },
  handler: async (ctx, { commentId, reaction }) => {
    const user = await requireCurrentUser(ctx);

    // Validate reaction
    if (!isValidReaction(reaction)) {
      throw new Error('Invalid reaction format');
    }

    const existing = await ctx.db.get(commentId);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    const now = Date.now();
    const reactions = existing.reactions ?? [];

    // Check if user already has this reaction
    const existingIndex = reactions.findIndex(
      r => r.userId === user._id && r.reaction === reaction
    );

    if (existingIndex === -1) {
      // Add new reaction
      reactions.push({
        userId: user._id,
        reaction,
        createdAt: now,
      });

      // Limit reactions per type
      const reactionCount = reactions.filter(r => r.reaction === reaction).length;
      if (reactionCount > COMMENTS_CONSTANTS.LIMITS.MAX_REACTIONS_PER_TYPE) {
        throw new Error('Too many reactions of this type');
      }
    }

    await ctx.db.patch(commentId, {
      reactions,
      updatedAt: now,
      updatedBy: user._id,
    });

    return reaction;
  },
});

/**
 * Remove reaction from a comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: All authenticated users (can remove own reactions)
 */
export const removeCommentReaction = mutation({
  args: {
    commentId: v.id('comments'),
    reaction: v.string(),
  },
  handler: async (ctx, { commentId, reaction }) => {
    const user = await requireCurrentUser(ctx);

    const existing = await ctx.db.get(commentId);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    const reactions = existing.reactions ?? [];
    const filteredReactions = reactions.filter(
      r => !(r.userId === user._id && r.reaction === reaction)
    );

    const now = Date.now();

    await ctx.db.patch(commentId, {
      reactions: filteredReactions,
      updatedAt: now,
      updatedBy: user._id,
    });

    return reaction;
  },
});

/**
 * Soft delete a comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const deleteComment = mutation({
  args: { id: v.id('comments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Comment not found');
    }

    // Check permissions
    await requireDeleteCommentAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'comments.deleted',
      entityType: 'yourobcComments',
      entityId: existing.entityId,
      entityTitle: `Comment on ${existing.entityType}`,
      description: `Deleted comment on ${existing.entityType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
