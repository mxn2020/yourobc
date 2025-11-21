// convex/lib/system/supporting/comments/queries.ts

/**
 * Comments Module Queries
 * Read-only operations for fetching comment data
 */
import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser } from '@/shared/auth.helper'
import { entityTypes } from '../../audit_logs/entityTypes'

/**
 * Get all comments for a specific entity with threading support
 */
export const getCommentsByEntity = query({
  args: {
    entityType: entityTypes.commentable,
    entityId: v.string(),
    includeInternal: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { entityType, entityId, includeInternal = true, limit }) => {
    await requireCurrentUser(ctx)

    // Fetch all comments for this entity
    let allComments = await ctx.db
      .query('comments')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .collect()

    // Filter internal comments if needed
    if (!includeInternal) {
      allComments = allComments.filter(comment => !comment.isInternal)
    }

    // Filter out deleted comments
    allComments = allComments.filter(comment => !comment.deletedAt)

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId)
    const repliesMap = new Map<string, typeof allComments>()

    // Group replies by parent
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, [])
        }
        repliesMap.get(parentId)!.push(comment)
      }
    })

    // Build comment tree with replies and resolve user profiles
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const createdByUser = comment.createdBy ? await ctx.db.get(comment.createdBy) : null
        const replies = repliesMap.get(comment._id) || []

        // Resolve user profiles for replies as well
        const repliesWithUsers = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = reply.createdBy ? await ctx.db.get(reply.createdBy) : null
            return {
              ...reply,
              createdByName: replyUser?.name,
              createdByEmail: replyUser?.email,
            }
          })
        )

        return {
          ...comment,
          replies: repliesWithUsers,
          replyCount: replies.length,
          createdByName: createdByUser?.name,
          createdByEmail: createdByUser?.email,
        }
      })
    )

    // Sort by creation date (newest first)
    commentsWithReplies.sort((a, b) => b.createdAt - a.createdAt)

    // Sort replies within each comment (oldest first for better reading flow)
    commentsWithReplies.forEach(comment => {
      comment.replies.sort((a, b) => a.createdAt - b.createdAt)
    })

    // Apply limit to top-level comments if specified
    return limit ? commentsWithReplies.slice(0, limit) : commentsWithReplies
  },
})

/**
 * Get a single comment by ID
 */
export const getComment = query({
  args: {
    commentId: v.id('comments'),
  },
  handler: async (ctx, { commentId }) => {
    await requireCurrentUser(ctx)

    const comment = await ctx.db.get(commentId)
    if (!comment || comment.deletedAt) {
      throw new Error('Comment not found')
    }

    return comment
  },
})

/**
 * Get all replies in a comment thread
 */
export const getCommentThread = query({
  args: {
    threadId: v.id('comments'),
  },
  handler: async (ctx, { threadId }) => {
    await requireCurrentUser(ctx)

    // Fetch all comments in this thread
    const allComments = await ctx.db
      .query('comments')
      .filter((q) => q.eq(q.field('parentCommentId'), threadId))
      .collect()

    // Filter out deleted comments
    const activeComments = allComments.filter(comment => !comment.deletedAt)

    // Sort by creation date (oldest first for reading flow)
    activeComments.sort((a, b) => a.createdAt - b.createdAt)

    return activeComments
  },
})

/**
 * Get comments with flexible filtering
 */
export const getComments = query({
  args: {
    entityType: v.optional(entityTypes.commentable),
    entityId: v.optional(v.string()),
    limit: v.optional(v.number()),
    includeInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, { entityType, entityId, limit, includeInternal = true }) => {
    await requireCurrentUser(ctx)

    let allComments = await ctx.db.query('comments').collect()

    // Filter by entity if specified
    if (entityType && entityId) {
      allComments = allComments.filter(c => c.entityType === entityType && c.entityId === entityId)
    } else if (entityType) {
      allComments = allComments.filter(c => c.entityType === entityType)
    }

    // Filter internal comments if needed
    if (!includeInternal) {
      allComments = allComments.filter(comment => !comment.isInternal)
    }

    // Filter out deleted comments
    allComments = allComments.filter(comment => !comment.deletedAt)

    // Sort by creation date (newest first)
    allComments.sort((a, b) => b.createdAt - a.createdAt)

    // Apply limit if specified
    return limit ? allComments.slice(0, limit) : allComments
  },
})

/**
 * Get recent comments across all entities
 */
export const getRecentComments = query({
  args: {
    limit: v.optional(v.number()),
    entityTypes: v.optional(v.array(entityTypes.commentable)),
  },
  handler: async (ctx, { limit = 10, entityTypes }) => {
    await requireCurrentUser(ctx)

    let query = ctx.db
      .query('comments')
      .order('desc')

    let allComments = await query.collect()

    // Filter out deleted comments
    allComments = allComments.filter(comment => !comment.deletedAt)

    // Filter by entity types if specified
    if (entityTypes && entityTypes.length > 0) {
      allComments = allComments.filter(comment =>
        entityTypes.includes(comment.entityType)
      )
    }

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId)
    const repliesMap = new Map<string, typeof allComments>()

    // Group replies by parent
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, [])
        }
        repliesMap.get(parentId)!.push(comment)
      }
    })

    // Build comment tree with replies and resolve user profiles
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const createdByUser = comment.createdBy ? await ctx.db.get(comment.createdBy) : null
        const replies = repliesMap.get(comment._id) || []

        // Resolve user profiles for replies as well
        const repliesWithUsers = await Promise.all(
          replies.map(async (reply) => {
            const replyUser = reply.createdBy ? await ctx.db.get(reply.createdBy) : null
            return {
              ...reply,
              createdByName: replyUser?.name,
              createdByEmail: replyUser?.email,
            }
          })
        )

        return {
          ...comment,
          replies: repliesWithUsers,
          replyCount: replies.length,
          createdByName: createdByUser?.name,
          createdByEmail: createdByUser?.email,
        }
      })
    )

    // Sort replies within each comment (oldest first for better reading flow)
    commentsWithReplies.forEach(comment => {
      comment.replies.sort((a, b) => a.createdAt - b.createdAt)
    })

    // Apply limit to top-level comments
    return commentsWithReplies.slice(0, limit)
  },
})
