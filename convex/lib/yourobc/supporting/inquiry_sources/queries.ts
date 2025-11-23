// convex/lib/yourobc/supporting/inquiry_sources/queries.ts
// Read operations for inquiry sources module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterInquirySourcesByAccess, requireViewInquirySourcesAccess } from './permissions';
import { inquirySourcesValidators } from '@/schema/yourobc/supporting/inquiry_sources/validators';
import type { InquirySourceListResponse, InquirySourceFilters } from './types';

/**
 * Get paginated list of inquiry sources (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees active sources, admins see all
 */
export const getInquirySources = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      type: v.optional(v.array(inquirySourcesValidators.inquirySourceType)),
      isActive: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<InquirySourceListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build indexed query
    const q = ctx.db
      .query('yourobcInquirySources')
      .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
      .filter(notDeleted);

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterInquirySourcesByAccess(ctx, page.page, user);

    // Apply filters in-memory
    if (filters.type && filters.type.length > 0) {
      items = items.filter(i => filters.type!.includes(i.type));
    }

    if (filters.isActive !== undefined) {
      items = items.filter(i => i.isActive === filters.isActive);
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
 * Get single inquiry source by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Creator or admin
 */
export const getInquirySource = query({
  args: { id: v.id('yourobcInquirySources') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    await requireViewInquirySourcesAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get inquiry source by name
 */
export const getInquirySourceByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcInquirySources')
      .withIndex('by_name', q => q.eq('name', name))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Inquiry source not found');
    }

    await requireViewInquirySourcesAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * List active inquiry sources
 */
export const getActiveInquirySources = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    let sources = await ctx.db
      .query('yourobcInquirySources')
      .withIndex('by_active', q => q.eq('isActive', true))
      .filter(notDeleted)
      .collect();

    // Apply permission filtering
    sources = await filterInquirySourcesByAccess(ctx, sources, user);

    return sources;
  },
});
