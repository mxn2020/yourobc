// convex/lib/yourobc/employeeKPIs/queries.ts
// Read operations for employeeKPIs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { employeeKPIsValidators } from '@/schema/yourobc/employeeKPIs/validators';
import { filterEmployeeKPIsByAccess, requireViewEmployeeKPIAccess } from './permissions';
import type { EmployeeKPIListResponse } from './types';

/**
 * Get paginated list of employee KPIs with filtering
 */
export const getEmployeeKPIs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(employeeKPIsValidators.status)),
      period: v.optional(v.array(employeeKPIsValidators.period)),
      employeeId: v.optional(v.id('yourobcEmployees')),
      year: v.optional(v.number()),
      month: v.optional(v.number()),
      metricType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmployeeKPIListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    kpis = await filterEmployeeKPIsByAccess(ctx, kpis, user);

    // Apply status filter
    if (filters.status?.length) {
      kpis = kpis.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply period filter
    if (filters.period?.length) {
      kpis = kpis.filter(item =>
        filters.period!.includes(item.period)
      );
    }

    // Apply employee filter
    if (filters.employeeId) {
      kpis = kpis.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply year filter
    if (filters.year) {
      kpis = kpis.filter(item => item.year === filters.year);
    }

    // Apply month filter
    if (filters.month !== undefined) {
      kpis = kpis.filter(item => item.month === filters.month);
    }

    // Apply metric type filter
    if (filters.metricType) {
      kpis = kpis.filter(item => item.metricType === filters.metricType);
    }

    // Paginate
    const total = kpis.length;
    const items = kpis.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single employee KPI by ID
 */
export const getEmployeeKPI = query({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
  },
  handler: async (ctx, { kpiId }) => {
    const user = await requireCurrentUser(ctx);

    const kpi = await ctx.db.get(kpiId);
    if (!kpi || kpi.deletedAt) {
      throw new Error('KPI not found');
    }

    await requireViewEmployeeKPIAccess(ctx, kpi, user);

    return kpi;
  },
});

/**
 * Get employee KPI by public ID
 */
export const getEmployeeKPIByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const kpi = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!kpi) {
      throw new Error('KPI not found');
    }

    await requireViewEmployeeKPIAccess(ctx, kpi, user);

    return kpi;
  },
});

/**
 * Get employee KPI statistics
 */
export const getEmployeeKPIStats = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, { employeeId }) => {
    const user = await requireCurrentUser(ctx);

    let kpis = await ctx.db
      .query('yourobcEmployeeKPIs')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (employeeId) {
      kpis = kpis.filter(k => k.employeeId === employeeId);
    }

    const accessible = await filterEmployeeKPIsByAccess(ctx, kpis, user);

    return {
      total: accessible.length,
      byStatus: {
        on_track: accessible.filter(item => item.status === 'on_track').length,
        at_risk: accessible.filter(item => item.status === 'at_risk').length,
        behind: accessible.filter(item => item.status === 'behind').length,
        achieved: accessible.filter(item => item.status === 'achieved').length,
      },
      averageAchievement: accessible.length > 0
        ? Math.round(accessible.reduce((sum, kpi) => sum + kpi.achievementPercentage, 0) / accessible.length)
        : 0,
    };
  },
});
