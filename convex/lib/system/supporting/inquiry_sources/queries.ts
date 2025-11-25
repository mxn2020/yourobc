// convex/lib/system/supporting/inquiry_sources/queries.ts
// Read operations for system inquiry sources

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { inquirySourcesValidators } from '@/schema/system/supporting/inquiry_sources/validators';
import { filterSystemInquirySourcesByAccess, requireViewSystemInquirySourceAccess } from './permissions';
import type { SystemInquirySourceFilters, SystemInquirySourceListResponse } from './types';

export const getSystemInquirySources = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        type: v.optional(inquirySourcesValidators.sourceType),
        isActive: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemInquirySourceListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemInquirySourceFilters } = args;

    const page = await ctx.db
      .query('inquirySources')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemInquirySourcesByAccess(ctx, page.page, user);

    if (filters.type) {
      items = items.filter((item) => item.type === filters.type);
    }

    if (filters.isActive !== undefined) {
      items = items.filter((item) => item.isActive === filters.isActive);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemInquirySource = query({
  args: { id: v.id('inquirySources') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    await requireViewSystemInquirySourceAccess(ctx, doc, user);
    return doc;
  },
});
