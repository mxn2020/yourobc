// convex/lib/yourobc/employeeSessions/queries.ts
// Read operations for employeeSessions module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { employeeSessionsValidators } from '@/schema/yourobc/employeeSessions/validators';
import { filterEmployeeSessionsByAccess, requireViewEmployeeSessionAccess } from './permissions';
import type { EmployeeSessionListResponse } from './types';

/**
 * Get paginated list of employee sessions with filtering
 */
export const getEmployeeSessions = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(employeeSessionsValidators.status)),
      employeeId: v.optional(v.id('yourobcEmployees')),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<EmployeeSessionListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    sessions = await filterEmployeeSessionsByAccess(ctx, sessions, user);

    // Apply status filter
    if (filters.status?.length) {
      sessions = sessions.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply employee filter
    if (filters.employeeId) {
      sessions = sessions.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply date range filter
    if (filters.startDate) {
      sessions = sessions.filter(item => item.startTime >= filters.startDate!);
    }
    if (filters.endDate) {
      sessions = sessions.filter(item => item.startTime <= filters.endDate!);
    }

    // Apply active filter
    if (filters.isActive !== undefined) {
      sessions = sessions.filter(item => item.isActive === filters.isActive);
    }

    // Paginate
    const total = sessions.length;
    const items = sessions.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single employee session by ID
 */
export const getEmployeeSession = query({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await requireCurrentUser(ctx);

    const session = await ctx.db.get(sessionId);
    if (!session || session.deletedAt) {
      throw new Error('Session not found');
    }

    await requireViewEmployeeSessionAccess(ctx, session, user);

    return session;
  },
});

/**
 * Get employee session by public ID
 */
export const getEmployeeSessionByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const session = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!session) {
      throw new Error('Session not found');
    }

    await requireViewEmployeeSessionAccess(ctx, session, user);

    return session;
  },
});

/**
 * Get active session for employee
 */
export const getActiveEmployeeSession = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { employeeId }) => {
    const user = await requireCurrentUser(ctx);

    const session = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_employee_status', q => q.eq('employeeId', employeeId).eq('status', 'active'))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (session) {
      await requireViewEmployeeSessionAccess(ctx, session, user);
    }

    return session;
  },
});

/**
 * Get employee session statistics
 */
export const getEmployeeSessionStats = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
  },
  handler: async (ctx, { employeeId }) => {
    const user = await requireCurrentUser(ctx);

    let sessions = await ctx.db
      .query('yourobcEmployeeSessions')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (employeeId) {
      sessions = sessions.filter(s => s.employeeId === employeeId);
    }

    const accessible = await filterEmployeeSessionsByAccess(ctx, sessions, user);

    return {
      total: accessible.length,
      byStatus: {
        active: accessible.filter(item => item.status === 'active').length,
        paused: accessible.filter(item => item.status === 'paused').length,
        completed: accessible.filter(item => item.status === 'completed').length,
      },
      activeCount: accessible.filter(item => item.isActive).length,
    };
  },
});
