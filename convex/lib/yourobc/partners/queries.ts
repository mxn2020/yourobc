// convex/lib/yourobc/partners/queries.ts
// Read operations for partners module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { partnersValidators, partnersFields } from '@/schema/yourobc/partners/validators';
import { filterPartnersByAccess, requireViewPartnerAccess } from './permissions';
import type { PartnerListResponse } from './types';

/**
 * Get paginated list of partners with filtering
 */
export const getPartners = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array(partnersValidators.status)),
      search: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<PartnerListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    // Query with index
    const q = ctx.db
      .query('yourobcPartners')
      .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
      .filter(notDeleted);

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply access filtering
    let items = await filterPartnersByAccess(ctx, page.page, user);

    // Apply status filter
    if (filters.status?.length) {
      items = items.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(item =>
        item.companyName.toLowerCase().includes(term) ||
        (item.shortName && item.shortName.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    // Apply country filter
    if (filters.country) {
      items = items.filter(item =>
        item.serviceCoverage.countries.includes(filters.country!)
      );
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
 * Get single partner by ID
 */
export const getPartner = query({
  args: {
    partnerId: v.id('yourobcPartners'),
  },
  handler: async (ctx, { partnerId }) => {
    const user = await requireCurrentUser(ctx);

    const partner = await ctx.db.get(partnerId);
    if (!partner || partner.deletedAt) {
      throw new Error('Partner not found');
    }

    await requireViewPartnerAccess(ctx, partner, user);

    return partner;
  },
});

/**
 * Get partner by public ID
 */
export const getPartnerByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const partner = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!partner) {
      throw new Error('Partner not found');
    }

    await requireViewPartnerAccess(ctx, partner, user);

    return partner;
  },
});

/**
 * Get partner statistics
 */
export const getPartnerStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const partners = await ctx.db
      .query('yourobcPartners')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .collect();

    const accessible = await filterPartnersByAccess(ctx, partners, user);

    return {
      total: accessible.length,
      byStatus: {
        active: accessible.filter(item => item.status === 'active').length,
        inactive: accessible.filter(item => item.status === 'inactive').length,
        archived: accessible.filter(item => item.status === 'archived').length,
      },
    };
  },
});
