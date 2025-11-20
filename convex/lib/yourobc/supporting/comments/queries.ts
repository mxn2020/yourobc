// convex/lib/yourobc/supporting/comments/queries.ts
// convex/yourobc/supporting/comments/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { COMMENT_CONSTANTS } from './constants';

export const getCommentsByEntity = query({
  args: {
    authUserId: v.string(),
    entityType: entityTypes.commentable,
    entityId: v.string(),
    includeInternal: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, entityType, entityId, includeInternal = true, limit }) => {
    await requireCurrentUser(ctx, authUserId);

    // Fetch all comments for this entity
    let allComments = await ctx.db
      .query('yourobcComments')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .collect();

    // Filter internal comments if needed
    if (!includeInternal) {
      allComments = allComments.filter(comment => !comment.isInternal);
    }

    // Filter out deleted comments
    allComments = allComments.filter(comment => !comment.deletedAt);

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId);
    const repliesMap = new Map<string, typeof allComments>();

    // Group replies by parent
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(comment);
      }
    });

    // Build comment tree with replies
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment._id) || [],
      replyCount: (repliesMap.get(comment._id) || []).length,
    }));

    // Sort by creation date (newest first)
    commentsWithReplies.sort((a, b) => b.createdAt - a.createdAt);

    // Sort replies within each comment (oldest first for better reading flow)
    commentsWithReplies.forEach(comment => {
      comment.replies.sort((a, b) => a.createdAt - b.createdAt);
    });

    // Apply limit to top-level comments if specified
    return limit ? commentsWithReplies.slice(0, limit) : commentsWithReplies;
  },
});

export const getComment = query({
  args: {
    commentId: v.id('yourobcComments'),
    authUserId: v.string()
  },
  handler: async (ctx, { commentId, authUserId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment;
  },
});

export const getCommentThread = query({
  args: {
    authUserId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { authUserId, threadId }) => {
    await requireCurrentUser(ctx, authUserId);

    // Fetch all comments in this thread
    const allComments = await ctx.db
      .query('yourobcComments')
      .filter((q) => q.eq(q.field('parentCommentId'), threadId))
      .collect();

    // Filter out deleted comments
    const activeComments = allComments.filter(comment => !comment.deletedAt);

    // Sort by creation date (oldest first for reading flow)
    activeComments.sort((a, b) => a.createdAt - b.createdAt);

    return activeComments;
  },
});

export const getRecentComments = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
    entityTypes: v.optional(v.array(entityTypes.commentable)),
  },
  handler: async (ctx, { authUserId, limit = 10, entityTypes }) => {
    await requireCurrentUser(ctx, authUserId);

    let query = ctx.db
      .query('yourobcComments')
      .order('desc');

    let allComments = await query.collect();

    // Filter out deleted comments
    allComments = allComments.filter(comment => !comment.deletedAt);

    // Filter by entity types if specified
    if (entityTypes && entityTypes.length > 0) {
      allComments = allComments.filter(comment =>
        entityTypes.includes(comment.entityType)
      );
    }

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId);
    const repliesMap = new Map<string, typeof allComments>();

    // Group replies by parent
    allComments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(comment);
      }
    });

    // Build comment tree with replies
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: repliesMap.get(comment._id) || [],
      replyCount: (repliesMap.get(comment._id) || []).length,
    }));

    // Sort replies within each comment (oldest first for better reading flow)
    commentsWithReplies.forEach(comment => {
      comment.replies.sort((a, b) => a.createdAt - b.createdAt);
    });

    // Apply limit to top-level comments
    return commentsWithReplies.slice(0, limit);
  },
});

