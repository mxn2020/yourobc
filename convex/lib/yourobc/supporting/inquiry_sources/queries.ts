// convex/lib/yourobc/supporting/inquiry_sources/queries.ts
// convex/yourobc/supporting/inquirySources/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { INQUIRY_SOURCE_CONSTANTS } from './constants';

export const getInquirySources = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      type: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
    }))
  },
  handler: async (ctx, { authUserId, filters = {} }) => {
    await requireCurrentUser(ctx, authUserId);
    
    let sourcesQuery = ctx.db.query('yourobcInquirySources');

    if (filters.type?.length) {
      sourcesQuery = sourcesQuery.filter((q) =>
        q.or(...filters.type!.map(t => q.eq(q.field('type'), t)))
      );
    }

    if (filters.isActive !== undefined) {
      sourcesQuery = sourcesQuery.filter((q) => 
        q.eq(q.field('isActive'), filters.isActive)
      );
    }

    return await sourcesQuery.order('asc').collect();
  },
});

export const getActiveInquirySources = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const sources = await ctx.db
      .query('yourobcInquirySources')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    return sources.map(source => ({
      _id: source._id,
      name: source.name,
      code: source.code,
      type: source.type,
    }));
  },
});

