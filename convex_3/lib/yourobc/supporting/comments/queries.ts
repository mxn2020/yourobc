// convex/lib/yourobc/supporting/comments/queries.ts
// Read operations for comments module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterCommentsByAccess, requireViewCommentAccess } from './permissions';
import { commentsValidators } from '@/schema/yourobc/supporting/comments/validators';
import type { CommentListResponse, CommentFilters } from './types';

/**
 * Get paginated list of comments for an entity (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees non-internal comments, admins see all
 */
export const getComments = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      type: v.optional(commentsValidators.commentType),
      isInternal: v.optional(v.boolean()),
      parentCommentId: v.optional(v.id('yourobcComments')),
    })),
  },
  handler: async (ctx, args): Promise<CommentListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { entityType, entityId, limit = 50, cursor, filters = {} } = args;

    // Build indexed query
    const q = ctx.db
      .query('comments')
      .withIndex('by_entity', iq => iq.eq('entityType', entityType).eq('entityId', entityId))
      .filter(notDeleted);

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterCommentsByAccess(ctx, page.page, user);

    // Apply additional filters in-memory
    if (filters.type) {
      items = items.filter(i => i.type === filters.type);
    }

    if (filters.isInternal !== undefined) {
      items = items.filter(i => i.isInternal === filters.isInternal);
    }

    if (filters.parentCommentId) {
      items = items.filter(i => i.parentCommentId === filters.parentCommentId);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get replies to a comment (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees non-internal replies, admins see all
 */
export const getCommentReplies = query({
  args: {
    parentCommentId: v.id('yourobcComments'),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CommentListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { parentCommentId, limit = 50, cursor } = args;

    const page = await ctx.db
      .query('comments')
      .withIndex('by_parent', iq => iq.eq('parentCommentId', parentCommentId))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filterCommentsByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single comment by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin, or if public
 */
export const getComment = query({
  args: { id: v.id('comments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Comment not found');
    }

    await requireViewCommentAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get comments by creator
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own, admins see all
 */
export const getCommentsByCreator = query({
  args: {
    createdBy: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const { createdBy, limit = 50, cursor } = args;

    // Only admins or the user themselves can see their comments
    if (!isAdmin && user._id !== createdBy) {
      throw new Error('No permission to view comments by this user');
    }

    const page = await ctx.db
      .query('comments')
      .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
      .filter(doc => doc.createdBy === createdBy && !doc.deletedAt)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filterCommentsByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Count replies to a comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: All authenticated users
 */
export const countCommentReplies = query({
  args: {
    parentCommentId: v.id('yourobcComments'),
  },
  handler: async (ctx, { parentCommentId }) => {
    const user = await requireCurrentUser(ctx);

    const count = await ctx.db
      .query('comments')
      .withIndex('by_parent', iq => iq.eq('parentCommentId', parentCommentId))
      .filter(notDeleted)
      .count();

    return count;
  },
});
