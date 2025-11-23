// convex/lib/yourobc/employees/commissions/queries.ts
// Read operations for employeeCommissions module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { employeeCommissionsValidators } from '@/schema/yourobc/employees/commissions/validators';
import { filterEmployeeCommissionsByAccess, requireViewEmployeeCommissionAccess } from './permissions';
import type { EmployeeCommissionListResponse } from './types';

/**
 * Get paginated list of employee commissions with filtering
 */
export const getEmployeeCommissions = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(employeeCommissionsValidators.status)),
      employeeId: v.optional(v.id('yourobcEmployees')),
      period: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<EmployeeCommissionListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    commissions = await filterEmployeeCommissionsByAccess(ctx, commissions, user);

    // Apply status filter
    if (filters.status?.length) {
      commissions = commissions.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply employee filter
    if (filters.employeeId) {
      commissions = commissions.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply period filter
    if (filters.period) {
      commissions = commissions.filter(item => item.period === filters.period);
    }

    // Apply date range filter
    if (filters.startDate) {
      commissions = commissions.filter(item => item.periodStartDate >= filters.startDate!);
    }
    if (filters.endDate) {
      commissions = commissions.filter(item => item.periodEndDate <= filters.endDate!);
    }

    // Paginate
    const total = commissions.length;
    const items = commissions.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single employee commission by ID
 */
export const getEmployeeCommission = query({
  args: {
    commissionId: v.id('yourobcEmployeeCommissions'),
  },
  handler: async (ctx, { commissionId }) => {
    const user = await requireCurrentUser(ctx);

    const commission = await ctx.db.get(commissionId);
    if (!commission || commission.deletedAt) {
      throw new Error('Commission not found');
    }

    await requireViewEmployeeCommissionAccess(ctx, commission, user);

    return commission;
  },
});

/**
 * Get employee commission by public ID
 */
export const getEmployeeCommissionByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const commission = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!commission) {
      throw new Error('Commission not found');
    }

    await requireViewEmployeeCommissionAccess(ctx, commission, user);

    return commission;
  },
});

/**
 * Get employee commission statistics
 */
export const getEmployeeCommissionStats = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    period: v.optional(v.string()),
  },
  handler: async (ctx, { employeeId, period }) => {
    const user = await requireCurrentUser(ctx);

    let commissions = await ctx.db
      .query('yourobcEmployeeCommissions')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (employeeId) {
      commissions = commissions.filter(c => c.employeeId === employeeId);
    }

    if (period) {
      commissions = commissions.filter(c => c.period === period);
    }

    const accessible = await filterEmployeeCommissionsByAccess(ctx, commissions, user);

    const totalAmount = accessible.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      total: accessible.length,
      byStatus: {
        pending: accessible.filter(item => item.status === 'pending').length,
        approved: accessible.filter(item => item.status === 'approved').length,
        paid: accessible.filter(item => item.status === 'paid').length,
        cancelled: accessible.filter(item => item.status === 'cancelled').length,
      },
      totalAmount: Math.round(totalAmount * 100) / 100,
      pendingAmount: Math.round(accessible.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.totalAmount, 0) * 100) / 100,
      approvedAmount: Math.round(accessible.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.totalAmount, 0) * 100) / 100,
      paidAmount: Math.round(accessible.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.totalAmount, 0) * 100) / 100,
    };
  },
});
