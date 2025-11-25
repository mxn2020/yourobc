// convex/lib/system/supporting/comments/queries.ts
// Read operations for system comments

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { commentsValidators } from '@/schema/system/supporting/comments/validators';
import type { SystemCommentFilters, SystemCommentListResponse } from './types';
import { filterSystemCommentsByAccess, requireViewSystemCommentAccess } from './permissions';

export const getSystemComments = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        isInternal: v.optional(v.boolean()),
        parentCommentId: v.optional(v.id('systemSupportingComments')),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemCommentListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemCommentFilters } = args;

    const page = await ctx.db
      .query('systemSupportingComments')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemCommentsByAccess(ctx, page.page, user);

    if (filters.entityType) {
      items = items.filter((item) => item.entityType === filters.entityType);
    }
    if (filters.entityId) {
      items = items.filter((item) => item.entityId === filters.entityId);
    }
    if (filters.isInternal !== undefined) {
      items = items.filter((item) => item.isInternal === filters.isInternal);
    }
    if (filters.parentCommentId !== undefined) {
      items = items.filter((item) => item.parentCommentId === filters.parentCommentId);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemComment = query({
  args: { id: v.id('systemSupportingComments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Comment not found');
    }
    await requireViewSystemCommentAccess(ctx, doc, user);
    return doc;
  },
});

export const listSystemCommentsForEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<SystemCommentListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { entityType, entityId, limit = 50, cursor } = args;

    const page = await ctx.db
      .query('systemSupportingComments')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    const items = await filterSystemCommentsByAccess(ctx, page.page, user);
    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});
