// convex/lib/boilerplate/supporting/comments/mutations.ts

/**
 * Comments Module Mutations
 * Write operations for creating, updating, and deleting comments
 */
import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper'
import { entityTypes } from '../../audit_logs/entityTypes'
import { commentTypeValidator } from '@/schema/base'
import { validateCreateCommentData, validateUpdateCommentData } from './utils'
import { Id } from '@/generated/dataModel'

/**
 * Create a new comment
 */
export const createComment = mutation({
  args: {
    data: v.object({
      entityType: entityTypes.commentable,
      entityId: v.string(),
      content: v.string(),
      type: v.optional(commentTypeValidator),
      isInternal: v.optional(v.boolean()),
      mentions: v.optional(v.array(v.object({
        userId: v.id('userProfiles'),
        userName: v.string(),
      }))),
      attachments: v.optional(v.array(v.object({
        filename: v.string(),
        fileUrl: v.string(),
        fileSize: v.number(),
        mimeType: v.string(),
      }))),
      parentCommentId: v.optional(v.id('comments')),
    })
  },
  handler: async (ctx, { data }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx)

    // 2. Validate data
    const errors = validateCreateCommentData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    // 3. If this is a reply, verify parent exists
    if (data.parentCommentId) {
      const parentComment = await ctx.db.get(data.parentCommentId)
      if (!parentComment || parentComment.deletedAt) {
        throw new Error('Parent comment not found')
      }
    }

    const now = Date.now()

    const commentData: any = {
      entityType: data.entityType,
      entityId: data.entityId,
      content: data.content.trim(),
      type: data.type || 'note' as const,
      isInternal: data.isInternal || false,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    }

    // 4. Add mentions if provided
    if (data.mentions && data.mentions.length > 0) {
      commentData.mentions = data.mentions
    }

    // 5. Add attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      commentData.attachments = data.attachments
    }

    // 6. Add parentCommentId if this is a reply
    if (data.parentCommentId) {
      commentData.parentCommentId = data.parentCommentId
    }

    // 7. Insert comment
    const commentId = await ctx.db.insert('comments', commentData)

    // 8. Update parent's reply count if this is a reply
    if (data.parentCommentId) {
      const parent = await ctx.db.get(data.parentCommentId)
      if (parent) {
        await ctx.db.patch(data.parentCommentId, {
          replyCount: (parent.replyCount || 0) + 1,
          updatedAt: now,
        })
      }
    }

    // 9. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'comment.created',
      entityType: data.entityType,
      entityId: data.entityId,
      description: `Created comment on ${data.entityType}`,
      metadata: {
        commentId,
        isReply: !!data.parentCommentId,
        isInternal: data.isInternal || false,
      },
      createdAt: now,
    });

    // 10. Return comment ID
    return commentId
  },
})

/**
 * Update an existing comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id('comments'),
    data: v.object({
      content: v.optional(v.string()),
      type: v.optional(commentTypeValidator),
      isInternal: v.optional(v.boolean()),
      reason: v.optional(v.string()), // reason for edit
    })
  },
  handler: async (ctx, { commentId, data }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx)

    // 2. Get comment and check existence
    const comment = await ctx.db.get(commentId)
    if (!comment || comment.deletedAt) {
      throw new Error('Comment not found')
    }

    // 3. Check ownership
    if (comment.createdBy !== user._id) {
      throw new Error('Can only edit your own comments')
    }

    // 4. Validate data
    const errors = validateUpdateCommentData({ content: data.content })
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const now = Date.now()
    const editHistory = (comment.editHistory || []) as Array<{
      content: string
      editedAt: number
      reason?: string
    }>

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user._id,
    }

    // 5. Add current version to edit history before updating if content changed
    if (data.content && data.content.trim() !== comment.content) {
      editHistory.push({
        content: comment.content, // Store previous content
        editedAt: now,
        reason: data.reason,
      })

      updateData.content = data.content.trim()
      updateData.isEdited = true
      updateData.editHistory = editHistory
    }

    if (data.type !== undefined) {
      updateData.type = data.type
    }

    if (data.isInternal !== undefined) {
      updateData.isInternal = data.isInternal
    }

    // 6. Update comment
    await ctx.db.patch(commentId, updateData)

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'comment.updated',
      entityType: comment.entityType,
      entityId: comment.entityId,
      description: `Updated comment`,
      metadata: {
        commentId,
        contentChanged: !!data.content,
        reason: data.reason,
      },
      createdAt: now,
    });

    // 8. Return comment ID
    return commentId
  },
})

/**
 * Delete a comment (soft delete with cascade to replies)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id('comments'),
  },
  handler: async (ctx, { commentId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx)

    // 2. Get comment and check existence
    const comment = await ctx.db.get(commentId)
    if (!comment || comment.deletedAt) {
      throw new Error('Comment not found')
    }

    // 3. Check ownership or admin
    await requireOwnershipOrAdmin(ctx, comment.createdBy)

    const now = Date.now()

    // 4. Soft delete the comment
    await ctx.db.patch(commentId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    // 5. Cascade delete all replies to this comment
    const replies = await ctx.db
      .query('comments')
      .filter((q) => q.eq(q.field('parentCommentId'), commentId))
      .collect()

    // 6. Soft delete all replies
    for (const reply of replies) {
      if (!reply.deletedAt) {
        await ctx.db.patch(reply._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        })
      }
    }

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'comment.deleted',
      entityType: comment.entityType,
      entityId: comment.entityId,
      description: `Deleted comment${replies.length > 0 ? ` and ${replies.length} replies` : ''}`,
      metadata: {
        commentId,
        replyCount: replies.length,
      },
      createdAt: now,
    });

    // 8. Return comment ID
    return commentId
  },
})

/**
 * Add or toggle a reaction on a comment
 */
export const addCommentReaction = mutation({
  args: {
    commentId: v.id('comments'),
    reaction: v.string(),
  },
  handler: async (ctx, { commentId, reaction }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx)

    // 2. Get comment and check existence
    const comment = await ctx.db.get(commentId)
    if (!comment || comment.deletedAt) {
      throw new Error('Comment not found')
    }

    const now = Date.now()

    // 3. Get current reactions or initialize empty array
    const reactions = (comment.reactions || []) as Array<{
      userId: Id<'userProfiles'>
      reaction: string
      createdAt: number
    }>

    // 4. Check if user already reacted with this reaction
    const existingReactionIndex = reactions.findIndex(
      r => r.userId === user._id && r.reaction === reaction
    )

    const isRemoving = existingReactionIndex !== -1;

    if (isRemoving) {
      // 5. Remove reaction if it exists (toggle off)
      reactions.splice(existingReactionIndex, 1)
    } else {
      // 5. Add new reaction
      reactions.push({
        userId: user._id,
        reaction,
        createdAt: now,
      })
    }

    // 6. Update comment
    await ctx.db.patch(commentId, {
      reactions,
      updatedAt: now,
    })

    // 7. Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: isRemoving ? 'comment.reaction_removed' : 'comment.reaction_added',
      entityType: comment.entityType,
      entityId: comment.entityId,
      description: `${isRemoving ? 'Removed' : 'Added'} reaction: ${reaction}`,
      metadata: {
        commentId,
        reaction,
      },
      createdAt: now,
    });

    // 8. Return comment ID
    return commentId
  },
})

/**
 * Remove a reaction from a comment
 */
export const removeCommentReaction = mutation({
  args: {
    commentId: v.id('comments'),
    reaction: v.string(),
  },
  handler: async (ctx, { commentId, reaction }) => {
    const user = await requireCurrentUser(ctx)

    const comment = await ctx.db.get(commentId)
    if (!comment || comment.deletedAt) {
      throw new Error('Comment not found')
    }

    const now = Date.now()

    // Get current reactions or initialize empty array
    const reactions = (comment.reactions || []) as Array<{
      userId: Id<'userProfiles'>
      reaction: string
      createdAt: number
    }>

    // Remove the reaction if it exists
    const filteredReactions = reactions.filter(
      r => !(r.userId === user._id && r.reaction === reaction)
    )

    await ctx.db.patch(commentId, {
      reactions: filteredReactions,
      updatedAt: now,
      updatedBy: user._id,
    })

    // Create audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'comment.reaction_removed',
      entityType: comment.entityType,
      entityId: comment.entityId,
      description: `Removed reaction: ${reaction}`,
      metadata: {
        commentId,
        reaction,
      },
      createdAt: now,
    });

    return commentId
  },
})
