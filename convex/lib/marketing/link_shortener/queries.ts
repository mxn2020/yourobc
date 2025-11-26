// convex/lib/marketing/link_shortener/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { requireViewAccess } from './permissions';

/**
 * Get paginated list of links with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Returns only links user can access
 */
export const getMarketingLinks = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            status: v.optional(v.array(v.string())),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'desc',
      filters = {},
    } = options;

    // Get links for the current user
    let links = await ctx.db
      .query('marketingLinks')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    // Apply filters
    if (filters.status?.length) {
      links = links.filter((link) => filters.status!.includes(link.status));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      links = links.filter(
        (link) =>
          link.title.toLowerCase().includes(searchTerm) ||
          link.description?.toLowerCase().includes(searchTerm) ||
          link.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by deletedAt
    links = links.filter((link) => !link.deletedAt);

    // Pagination
    const total = links.length;
    const paginatedLinks = links.slice(offset, offset + limit);

    return {
      links: paginatedLinks,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single link by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view link
 */
export const getMarketingLink = query({
  args: {
    linkId: v.id('marketingLinks'),
  },
  handler: async (ctx, { linkId }) => {
    const user = await requireCurrentUser(ctx);

    const link = await ctx.db.get(linkId);
    if (!link || link.deletedAt) {
      throw new Error('Link not found');
    }

    await requireViewAccess(ctx, link, user);

    return link;
  },
});

/**
 * Get link by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view link
 */
export const getMarketingLinkByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const link = await ctx.db
      .query('marketingLinks')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();

    if (!link || link.deletedAt) {
      throw new Error('Link not found');
    }

    await requireViewAccess(ctx, link, user);

    return link;
  },
});

/**
 * Get link by short code (public - no auth required)
 */
export const getMarketingLinkByShortCode = query({
  args: {
    shortCode: v.string(),
  },
  handler: async (ctx, { shortCode }) => {
    const link = await ctx.db
      .query('marketingLinks')
      .withIndex('by_short_code', (q) => q.eq('shortCode', shortCode))
      .first();

    if (!link || link.deletedAt) {
      return null;
    }

    return link;
  },
});

/**
 * Get link analytics
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must own the link
 */
export const getMarketingLinkAnalytics = query({
  args: {
    linkId: v.id('marketingLinks'),
    timeRange: v.optional(v.union(
      v.literal('24h'),
      v.literal('7d'),
      v.literal('30d'),
      v.literal('all')
    )),
  },
  handler: async (ctx, { linkId, timeRange = '7d' }) => {
    const user = await requireCurrentUser(ctx);

    const link = await ctx.db.get(linkId);
    if (!link || link.deletedAt) {
      throw new Error('Link not found');
    }

    await requireViewAccess(ctx, link, user);

    // Get time range
    let startTime = 0;
    const now = Date.now();
    if (timeRange === '24h') startTime = now - 24 * 60 * 60 * 1000;
    if (timeRange === '7d') startTime = now - 7 * 24 * 60 * 60 * 1000;
    if (timeRange === '30d') startTime = now - 30 * 24 * 60 * 60 * 1000;

    // Get clicks
    const clicks = await ctx.db
      .query('marketingLinkClicks')
      .withIndex('by_link', (q) => q.eq('linkId', linkId))
      .filter((q) => q.gte(q.field('clickedAt'), startTime))
      .collect();

    // Aggregate by country
    const byCountry = clicks.reduce((acc, click) => {
      const country = click.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate by device
    const byDevice = clicks.reduce((acc, click) => {
      const device = click.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate by referrer
    const byReferrer = clicks.reduce((acc, click) => {
      const referrer = click.referrerDomain || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClicks: clicks.length,
      uniqueClicks: new Set(clicks.map((c) => c.visitorId).filter(Boolean)).size,
      byCountry,
      byDevice,
      byReferrer,
    };
  },
});

/**
 * Get user's link statistics
 * 🔒 Authentication: Required
 */
export const getMarketingLinkStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const links = await ctx.db
      .query('marketingLinks')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const byStatus = links.reduce((acc, link) => {
      acc[link.status] = (acc[link.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalClicks = links.reduce((sum, link) => sum + (link.totalClicks || 0), 0);
    const uniqueClicks = links.reduce((sum, link) => sum + (link.uniqueClicks || 0), 0);

    return {
      totalLinks: links.length,
      activeLinks: byStatus.active || 0,
      totalClicks,
      uniqueClicks,
      byStatus,
    };
  },
});
