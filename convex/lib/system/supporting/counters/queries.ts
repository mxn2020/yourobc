// convex/lib/system/supporting/counters/queries.ts
// Read operations for system counters

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { countersValidators } from '@/schema/system/supporting/counters/validators';
import { filterSystemCountersByAccess, requireViewSystemCounterAccess } from './permissions';
import type { SystemCounterListResponse } from './types';

export const getSystemCounters = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    type: v.optional(countersValidators.counterType),
  },
  handler: async (ctx, args): Promise<SystemCounterListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, type } = args;

    let queryBuilder = ctx.db
      .query('systemSupportingCounters')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted);

    if (type) {
      queryBuilder = ctx.db
        .query('systemSupportingCounters')
        .withIndex('by_type', (q) => q.eq('type', type))
        .filter(notDeleted);
    }

    const page = await queryBuilder
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    const items = await filterSystemCountersByAccess(ctx, page.page, user);
    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemCounter = query({
  args: { id: v.id('systemSupportingCounters') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Counter not found');
    }
    await requireViewSystemCounterAccess(ctx, doc, user);
    return doc;
  },
});
