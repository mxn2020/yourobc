// convex/lib/yourobc/supporting/counters/queries.ts
// Read operations for counters module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterCountersByAccess, requireViewCountersAccess } from './permissions';
import { countersValidators } from '@/schema/yourobc/supporting/counters/validators';
import type { CounterListResponse, CounterFilters } from './types';

/**
 * Get paginated list of counters (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own counters, admins see all
 */
export const getCounters = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      type: v.optional(countersValidators.counterType),
      year: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<CounterListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query - most selective filter first
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcCounters')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Single type filter
      if (filters.type) {
        return ctx.db
          .query('yourobcCounters')
          .withIndex('by_type_year', iq =>
            iq.eq('type', filters.type!).gte('year', 0)
          )
          .filter(notDeleted);
      }

      // Default: all non-deleted
      return ctx.db
        .query('yourobcCounters')
        .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterCountersByAccess(ctx, page.page, user);

    // Apply additional filters in-memory
    if (filters.year !== undefined) {
      items = items.filter(i => i.year === filters.year);
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
 * Get single counter by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const getCounter = query({
  args: { id: v.id('yourobcCounters') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Counter not found');
    }

    await requireViewCountersAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get counter by type and year
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const getCounterByTypeYear = query({
  args: {
    type: countersValidators.counterType,
    year: v.number(),
  },
  handler: async (ctx, { type, year }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcCounters')
      .withIndex('by_type_year', q => q.eq('type', type).eq('year', year))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Counter not found for this type and year');
    }

    await requireViewCountersAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get counters by type
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own, admins see all
 */
export const getCountersByType = query({
  args: {
    type: countersValidators.counterType,
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { type, limit = 50, cursor }) => {
    const user = await requireCurrentUser(ctx);

    const page = await ctx.db
      .query('yourobcCounters')
      .withIndex('by_type_year', q => q.eq('type', type).gte('year', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filterCountersByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
