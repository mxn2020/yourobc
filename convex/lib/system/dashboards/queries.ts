// convex/lib/system/dashboards/dashboards/queries.ts
// Read operations for dashboards module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { dashboardsValidators } from '@/schema/system/dashboards/validators';
import {
  filterDashboardsByAccess,
  requireViewDashboardAccess,
} from './permissions';
import type { DashboardListResponse, DashboardFilters } from './types';

/**
 * Get paginated list of dashboards with filtering
 */
export const getDashboards = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(
      v.object({
        layout: v.optional(v.array(dashboardsValidators.layout)),
        isDefault: v.optional(v.boolean()),
        isPublic: v.optional(v.boolean()),
        search: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<DashboardListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index - get user's dashboards
    let dashboards = await ctx.db
      .query('dashboards')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    dashboards = await filterDashboardsByAccess(ctx, dashboards, user);

    // Apply layout filter
    if (filters.layout?.length) {
      dashboards = dashboards.filter((item) => filters.layout!.includes(item.layout));
    }

    // Apply isDefault filter
    if (filters.isDefault !== undefined) {
      dashboards = dashboards.filter((item) => item.isDefault === filters.isDefault);
    }

    // Apply isPublic filter
    if (filters.isPublic !== undefined) {
      dashboards = dashboards.filter((item) => item.isPublic === filters.isPublic);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      dashboards = dashboards.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = dashboards.length;
    const items = dashboards.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single dashboard by ID
 */
export const getDashboard = query({
  args: {
    dashboardId: v.id('dashboards'),
  },
  handler: async (ctx, { dashboardId }) => {
    const user = await requireCurrentUser(ctx);

    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard || dashboard.deletedAt) {
      throw new Error('Dashboard not found');
    }

    await requireViewDashboardAccess(ctx, dashboard, user);

    return dashboard;
  },
});

/**
 * Get dashboard by public ID
 */
export const getDashboardByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const dashboard = await ctx.db
      .query('dashboards')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    await requireViewDashboardAccess(ctx, dashboard, user);

    return dashboard;
  },
});

/**
 * Get all dashboards for the current user
 */
export const getUserDashboards = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query('dashboards')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);
  },
});

/**
 * Get all public dashboards
 */
export const getPublicDashboards = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    await requireCurrentUser(ctx);

    return await ctx.db
      .query('dashboards')
      .withIndex('by_is_public', (q) => q.eq('isPublic', true))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);
  },
});

/**
 * Get the default dashboard for the current user
 * Falls back to system default if user has no default set
 */
export const getDefaultDashboard = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Check for user's default dashboard
    const userDefault = await ctx.db
      .query('dashboards')
      .withIndex('by_owner_and_is_default', (q) =>
        q.eq('ownerId', user._id).eq('isDefault', true)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (userDefault) return userDefault;

    // Fall back to system default (public dashboard marked as default)
    return await ctx.db
      .query('dashboards')
      .withIndex('by_is_default', (q) => q.eq('isDefault', true))
      .filter((q) =>
        q.and(q.eq(q.field('isPublic'), true), q.eq(q.field('deletedAt'), undefined))
      )
      .first();
  },
});

/**
 * Get dashboard statistics
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const dashboards = await ctx.db
      .query('dashboards')
      .withIndex('by_owner_id', (q) => q.eq('ownerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterDashboardsByAccess(ctx, dashboards, user);

    return {
      total: accessible.length,
      byLayout: {
        grid: accessible.filter((item) => item.layout === 'grid').length,
        freeform: accessible.filter((item) => item.layout === 'freeform').length,
      },
      byVisibility: {
        public: accessible.filter((item) => item.isPublic).length,
        private: accessible.filter((item) => !item.isPublic).length,
      },
      defaults: accessible.filter((item) => item.isDefault).length,
    };
  },
});
