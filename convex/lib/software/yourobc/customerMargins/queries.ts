// convex/lib/software/yourobc/customerMargins/queries.ts
// Read operations for customerMargins module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { customerMarginsValidators } from '@/schema/software/yourobc/customerMargins/validators';
import { filterCustomerMarginsByAccess, requireViewCustomerMarginAccess } from './permissions';
import type { CustomerMarginListResponse } from './types';

/**
 * Get paginated list of customer margins with filtering
 */
export const getCustomerMargins = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(customerMarginsValidators.status)),
      serviceType: v.optional(v.array(customerMarginsValidators.serviceType)),
      marginType: v.optional(v.array(customerMarginsValidators.marginType)),
      approvalStatus: v.optional(v.array(customerMarginsValidators.approvalStatus)),
      customerId: v.optional(v.id('yourobcCustomers')),
      search: v.optional(v.string()),
      activeOnly: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<CustomerMarginListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let margins = await ctx.db
      .query('softwareYourObcCustomerMargins')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    margins = await filterCustomerMarginsByAccess(ctx, margins, user);

    // Apply status filter
    if (filters.status?.length) {
      margins = margins.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply service type filter
    if (filters.serviceType?.length) {
      margins = margins.filter(item =>
        filters.serviceType!.includes(item.serviceType)
      );
    }

    // Apply margin type filter
    if (filters.marginType?.length) {
      margins = margins.filter(item =>
        filters.marginType!.includes(item.marginType)
      );
    }

    // Apply approval status filter
    if (filters.approvalStatus?.length) {
      margins = margins.filter(item =>
        item.approvalStatus && filters.approvalStatus!.includes(item.approvalStatus)
      );
    }

    // Apply customer filter
    if (filters.customerId) {
      margins = margins.filter(item => item.customerId === filters.customerId);
    }

    // Apply active only filter
    if (filters.activeOnly) {
      const now = Date.now();
      margins = margins.filter(item =>
        item.status === 'active' &&
        item.effectiveFrom <= now &&
        (!item.effectiveTo || item.effectiveTo >= now)
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      margins = margins.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.marginId.toLowerCase().includes(term) ||
        (item.customerName && item.customerName.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = margins.length;
    const items = margins.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single customer margin by ID
 */
export const getCustomerMargin = query({
  args: {
    marginId: v.id('softwareYourObcCustomerMargins'),
  },
  handler: async (ctx, { marginId }) => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db.get(marginId);
    if (!margin || margin.deletedAt) {
      throw new Error('Customer margin not found');
    }

    await requireViewCustomerMarginAccess(ctx, margin, user);

    return margin;
  },
});

/**
 * Get customer margin by public ID
 */
export const getCustomerMarginByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db
      .query('softwareYourObcCustomerMargins')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!margin) {
      throw new Error('Customer margin not found');
    }

    await requireViewCustomerMarginAccess(ctx, margin, user);

    return margin;
  },
});

/**
 * Get customer margin by margin ID
 */
export const getCustomerMarginByMarginId = query({
  args: {
    marginId: v.string(),
  },
  handler: async (ctx, { marginId }) => {
    const user = await requireCurrentUser(ctx);

    const margin = await ctx.db
      .query('softwareYourObcCustomerMargins')
      .withIndex('by_margin_id', q => q.eq('marginId', marginId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!margin) {
      throw new Error('Customer margin not found');
    }

    await requireViewCustomerMarginAccess(ctx, margin, user);

    return margin;
  },
});

/**
 * Get customer margin statistics
 */
export const getCustomerMarginStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const margins = await ctx.db
      .query('softwareYourObcCustomerMargins')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterCustomerMarginsByAccess(ctx, margins, user);

    const now = Date.now();
    const active = accessible.filter(m =>
      m.status === 'active' &&
      m.effectiveFrom <= now &&
      (!m.effectiveTo || m.effectiveTo >= now)
    );

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter(item => item.status === 'draft').length,
        active: accessible.filter(item => item.status === 'active').length,
        pending_approval: accessible.filter(item => item.status === 'pending_approval').length,
        expired: accessible.filter(item => item.status === 'expired').length,
        archived: accessible.filter(item => item.status === 'archived').length,
      },
      byServiceType: {
        standard: accessible.filter(item => item.serviceType === 'standard').length,
        express: accessible.filter(item => item.serviceType === 'express').length,
        overnight: accessible.filter(item => item.serviceType === 'overnight').length,
        international: accessible.filter(item => item.serviceType === 'international').length,
        freight: accessible.filter(item => item.serviceType === 'freight').length,
        custom: accessible.filter(item => item.serviceType === 'custom').length,
      },
      currentlyActive: active.length,
      pendingApproval: accessible.filter(item =>
        item.approvalStatus === 'pending'
      ).length,
    };
  },
});
