// convex/lib/marketing/landing_pages/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { requireViewAccess } from './permissions';

export const getLandingPages = query({
  args: {
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
      })),
    })),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = options;

    let pages = await ctx.db
      .query('marketingLandingPages')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .collect();

    if (filters.status?.length) {
      pages = pages.filter((page) => filters.status!.includes(page.status));
    }

    pages = pages.filter((page) => !page.deletedAt);

    const total = pages.length;
    const paginatedPages = pages.slice(offset, offset + limit);

    return { pages: paginatedPages, total, hasMore: total > offset + limit };
  },
});

export const getLandingPage = query({
  args: { pageId: v.id('marketingLandingPages') },
  handler: async (ctx, { pageId }) => {
    const user = await requireCurrentUser(ctx);
    const page = await ctx.db.get(pageId);
    if (!page || page.deletedAt) throw new Error('Page not found');
    await requireViewAccess(ctx, page, user);
    return page;
  },
});

export const getLandingPageStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const pages = await ctx.db
      .query('marketingLandingPages')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const byStatus = pages.reduce((acc, page) => {
      acc[page.status] = (acc[page.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPages: pages.length,
      publishedPages: byStatus.published || 0,
      totalViews: pages.reduce((sum, p) => sum + (p.totalViews || 0), 0),
      totalConversions: pages.reduce((sum, p) => sum + (p.totalConversions || 0), 0),
      byStatus,
    };
  },
});
