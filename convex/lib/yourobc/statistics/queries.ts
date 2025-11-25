// convex/lib/yourobc/statistics/queries.ts
/**
 * Statistics Queries
 * Read operations for statistics module.
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import {
  filterEmployeeCostsByAccess,
  filterOfficeCostsByAccess,
  filterMiscExpensesByAccess,
  filterKpiTargetsByAccess,
  filterKpiCacheByAccess,
  requireViewEmployeeCostAccess,
  requireViewOfficeCostAccess,
  requireViewMiscExpenseAccess,
  requireViewKpiTargetAccess,
  requireViewKpiCacheAccess,
} from './permissions';
import { statisticsValidators } from '@/schema/yourobc/statistics/validators';
import type {
  EmployeeCostListResponse,
  OfficeCostListResponse,
  MiscExpenseListResponse,
  KpiTargetListResponse,
  KpiCacheListResponse,
} from './types';

// ============================================================================
// Employee Cost Queries
// ============================================================================

/**
 * Get paginated list of employee costs
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getEmployeeCosts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      employeeId: v.optional(v.id('yourobcEmployees')),
      department: v.optional(v.string()),
      category: v.optional(v.string()),
      isOfficial: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<EmployeeCostListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcStatisticsEmployeeCosts')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Filter by employee
      if (filters.employeeId) {
        return ctx.db
          .query('yourobcStatisticsEmployeeCosts')
          .withIndex('by_employee_id', iq => iq.eq('employeeId', filters.employeeId!))
          .filter(notDeleted);
      }

      // Filter by department
      if (filters.department) {
        return ctx.db
          .query('yourobcStatisticsEmployeeCosts')
          .withIndex('by_department', iq => iq.eq('department', filters.department!))
          .filter(notDeleted);
      }

      // Filter by category
      if (filters.category) {
        return ctx.db
          .query('yourobcStatisticsEmployeeCosts')
          .withIndex('by_category', iq => iq.eq('category', filters.category!))
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcStatisticsEmployeeCosts')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterEmployeeCostsByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.isOfficial !== undefined) {
      items = items.filter(i => i.isOfficial === filters.isOfficial);
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
 * Get single employee cost by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getEmployeeCost = query({
  args: { id: v.id('yourobcStatisticsEmployeeCosts') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Employee cost not found');
    }

    await requireViewEmployeeCostAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get employee cost by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getEmployeeCostByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcStatisticsEmployeeCosts')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Employee cost not found');
    }

    await requireViewEmployeeCostAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get employee costs by employee ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items
 */
export const getEmployeeCostsByEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { employeeId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    const items = await ctx.db
      .query('yourobcStatisticsEmployeeCosts')
      .withIndex('by_employee_id', q => q.eq('employeeId', employeeId))
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    return await filterEmployeeCostsByAccess(ctx, items, user);
  },
});

// ============================================================================
// Office Cost Queries
// ============================================================================

/**
 * Get paginated list of office costs
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getOfficeCosts = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      category: v.optional(statisticsValidators.officeCostCategory),
      frequency: v.optional(statisticsValidators.costFrequency),
      isOfficial: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<OfficeCostListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcStatisticsOfficeCosts')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Filter by category
      if (filters.category) {
        return ctx.db
          .query('yourobcStatisticsOfficeCosts')
          .withIndex('by_category', iq => iq.eq('category', filters.category!))
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcStatisticsOfficeCosts')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterOfficeCostsByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.frequency) {
      items = items.filter(i => i.frequency === filters.frequency);
    }
    if (filters.isOfficial !== undefined) {
      items = items.filter(i => i.isOfficial === filters.isOfficial);
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
 * Get single office cost by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getOfficeCost = query({
  args: { id: v.id('yourobcStatisticsOfficeCosts') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Office cost not found');
    }

    await requireViewOfficeCostAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get office cost by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getOfficeCostByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcStatisticsOfficeCosts')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Office cost not found');
    }

    await requireViewOfficeCostAccess(ctx, doc, user);
    return doc;
  },
});

// ============================================================================
// Misc Expense Queries
// ============================================================================

/**
 * Get paginated list of misc expenses
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getMiscExpenses = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      category: v.optional(statisticsValidators.miscExpenseCategory),
      approved: v.optional(v.boolean()),
      relatedEmployeeId: v.optional(v.id('yourobcEmployees')),
      isOfficial: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<MiscExpenseListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcStatisticsMiscExpenses')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Filter by category
      if (filters.category) {
        return ctx.db
          .query('yourobcStatisticsMiscExpenses')
          .withIndex('by_category', iq => iq.eq('category', filters.category!))
          .filter(notDeleted);
      }

      // Filter by approved status
      if (filters.approved !== undefined) {
        return ctx.db
          .query('yourobcStatisticsMiscExpenses')
          .withIndex('by_approved', iq => iq.eq('approved', filters.approved!))
          .filter(notDeleted);
      }

      // Filter by employee
      if (filters.relatedEmployeeId) {
        return ctx.db
          .query('yourobcStatisticsMiscExpenses')
          .withIndex('by_employee_id', iq => iq.eq('relatedEmployeeId', filters.relatedEmployeeId!))
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcStatisticsMiscExpenses')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterMiscExpensesByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.isOfficial !== undefined) {
      items = items.filter(i => i.isOfficial === filters.isOfficial);
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
 * Get single misc expense by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getMiscExpense = query({
  args: { id: v.id('yourobcStatisticsMiscExpenses') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Misc expense not found');
    }

    await requireViewMiscExpenseAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get misc expense by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getMiscExpenseByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcStatisticsMiscExpenses')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('Misc expense not found');
    }

    await requireViewMiscExpenseAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get pending misc expenses (not approved)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees items they can approve
 */
export const getPendingMiscExpenses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    const items = await ctx.db
      .query('yourobcStatisticsMiscExpenses')
      .withIndex('by_approved', q => q.eq('approved', false))
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    return await filterMiscExpensesByAccess(ctx, items, user);
  },
});

// ============================================================================
// KPI Target Queries
// ============================================================================

/**
 * Get paginated list of KPI targets
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getKpiTargets = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      targetType: v.optional(statisticsValidators.targetType),
      employeeId: v.optional(v.id('yourobcEmployees')),
      teamName: v.optional(v.string()),
      year: v.optional(v.number()),
      month: v.optional(v.number()),
      isOfficial: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<KpiTargetListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcStatisticsKpiTargets')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Filter by employee and year
      if (filters.employeeId && filters.year) {
        return ctx.db
          .query('yourobcStatisticsKpiTargets')
          .withIndex('by_employee_id_year', iq =>
            iq.eq('employeeId', filters.employeeId!).eq('year', filters.year!)
          )
          .filter(notDeleted);
      }

      // Filter by team and year
      if (filters.teamName && filters.year) {
        return ctx.db
          .query('yourobcStatisticsKpiTargets')
          .withIndex('by_team_name_year', iq =>
            iq.eq('teamName', filters.teamName!).eq('year', filters.year!)
          )
          .filter(notDeleted);
      }

      // Filter by year and month
      if (filters.year && filters.month) {
        return ctx.db
          .query('yourobcStatisticsKpiTargets')
          .withIndex('by_year_month', iq =>
            iq.eq('year', filters.year!).eq('month', filters.month!)
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcStatisticsKpiTargets')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterKpiTargetsByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.targetType) {
      items = items.filter(i => i.targetType === filters.targetType);
    }
    if (filters.isOfficial !== undefined) {
      items = items.filter(i => i.isOfficial === filters.isOfficial);
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
 * Get single KPI target by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getKpiTarget = query({
  args: { id: v.id('yourobcStatisticsKpiTargets') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('KPI target not found');
    }

    await requireViewKpiTargetAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get KPI target by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getKpiTargetByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcStatisticsKpiTargets')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('KPI target not found');
    }

    await requireViewKpiTargetAccess(ctx, doc, user);
    return doc;
  },
});

// ============================================================================
// KPI Cache Queries
// ============================================================================

/**
 * Get paginated list of KPI cache entries
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 */
export const getKpiCache = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      cacheType: v.optional(statisticsValidators.kpiCacheType),
      entityId: v.optional(v.string()),
      year: v.optional(v.number()),
      month: v.optional(v.number()),
      isOfficial: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<KpiCacheListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    // Build indexed query
    const q = (() => {
      // Admin global listing
      if (isAdmin) {
        return ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
          .filter(notDeleted);
      }

      // Filter by cache type
      if (filters.cacheType) {
        return ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_cache_type', iq => iq.eq('cacheType', filters.cacheType!))
          .filter(notDeleted);
      }

      // Filter by entity, year, and month
      if (filters.entityId && filters.year && filters.month) {
        return ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_entity_id_year_month', iq =>
            iq.eq('entityId', filters.entityId!)
              .eq('year', filters.year!)
              .eq('month', filters.month!)
          )
          .filter(notDeleted);
      }

      // Filter by year and month
      if (filters.year && filters.month) {
        return ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_year_month', iq =>
            iq.eq('year', filters.year!).eq('month', filters.month!)
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('yourobcStatisticsKpiCache')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterKpiCacheByAccess(ctx, page.page, user);

    // Apply additional filters
    if (filters.isOfficial !== undefined) {
      items = items.filter(i => i.isOfficial === filters.isOfficial);
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
 * Get single KPI cache by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getKpiCacheById = query({
  args: { id: v.id('yourobcStatisticsKpiCache') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('KPI cache not found');
    }

    await requireViewKpiCacheAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get KPI cache by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getKpiCacheByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('yourobcStatisticsKpiCache')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!doc) {
      throw new Error('KPI cache not found');
    }

    await requireViewKpiCacheAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get KPI cache for specific entity and period
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees accessible caches
 */
export const getKpiCacheForEntity = query({
  args: {
    entityId: v.string(),
    year: v.number(),
    month: v.optional(v.number()),
  },
  handler: async (ctx, { entityId, year, month }) => {
    const user = await requireCurrentUser(ctx);

    const query = month
      ? ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_entity_id_year_month', q =>
            q.eq('entityId', entityId).eq('year', year).eq('month', month)
          )
      : ctx.db
          .query('yourobcStatisticsKpiCache')
          .withIndex('by_entity_id_year_month', q =>
            q.eq('entityId', entityId).eq('year', year)
          );

    const items = await query.filter(notDeleted).collect();

    const filtered = await filterKpiCacheByAccess(ctx, items, user);

    return filtered.length > 0 ? filtered[0] : null;
  },
});
