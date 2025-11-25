// convex/lib/system/audit_logs/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { entityTypes } from './entityTypes';
import { AUDIT_LOG_CONSTANTS } from './constants';

/**
 * Get audit logs for current user
 * 🔒 Authentication: Required
 */
export const getAuditLogs = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            action: v.optional(v.string()),
            entityType: v.optional(entityTypes.all),
            entityId: v.optional(v.string()),
            dateFrom: v.optional(v.number()),
            dateTo: v.optional(v.number()),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    const user = await requireCurrentUser(ctx);

    const { limit = 100, offset = 0, filters = {} } = options;

    // ✅ Use indexed query for current user
    let logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .order('desc')
      .take(
        Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
      );

    // Apply filters in memory
    if (filters.entityType && filters.entityId) {
      logs = logs.filter(
        (log) =>
          log.entityType === filters.entityType &&
          log.entityId === filters.entityId
      );
    } else if (filters.entityType) {
      logs = logs.filter((log) => log.entityType === filters.entityType);
    }

    if (filters.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    if (filters.dateFrom) {
      logs = logs.filter((log) => log.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      logs = logs.filter((log) => log.createdAt <= filters.dateTo!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.description?.toLowerCase().includes(searchLower) ||
          log.userName?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower)
      );
    }

    return {
      logs: logs.slice(offset, offset + limit),
      total: logs.length,
      hasMore: logs.length > offset + limit,
    };
  },
});

/**
 * Get audit logs for a specific entity
 * 🔒 Authentication: Required
 */
export const getEntityAuditLogs = query({
  args: {
    entityType: entityTypes.all,
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { entityType, entityId, limit = 50 }) => {
    await requireCurrentUser(ctx);

    // ✅ Use compound index for entity lookups
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', entityType).eq('entityId', entityId)
      )
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    return logs;
  },
});

/**
 * Get current user's audit logs
 * 🔒 Authentication: Required
 */
export const getUserAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Use indexed query
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    return logs;
  },
});

/**
 * Get audit log statistics for current user
 * 🔒 Authentication: Required
 */
export const getMyAuditLogStats = query({
  args: {
    timeWindow: v.optional(
      v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('all'))
    ),
  },
  handler: async (ctx, { timeWindow = 'month' }) => {
    const user = await requireCurrentUser(ctx);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    let startTime: number;
    switch (timeWindow) {
      case 'day':
        startTime = oneDayAgo;
        break;
      case 'week':
        startTime = oneWeekAgo;
        break;
      case 'month':
        startTime = oneMonthAgo;
        break;
      case 'all':
        startTime = ninetyDaysAgo;
        break;
      default:
        startTime = oneMonthAgo;
    }

    // ✅ Get logs for current user
    const allUserLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter(notDeleted)
      .order('desc')
      .collect();

    const logs = allUserLogs.filter((log) => log.createdAt >= startTime);

    const stats = {
      totalLogs: logs.length,
      logsLast24h: logs.filter((log) => log.createdAt >= oneDayAgo).length,
      logsLastWeek: logs.filter((log) => log.createdAt >= oneWeekAgo).length,
      logsLastMonth: logs.filter((log) => log.createdAt >= oneMonthAgo).length,
      topActions: {} as Record<string, number>,
      topEntityTypes: {} as Record<string, number>,
      timeWindow,
    };

    logs.forEach((log) => {
      stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
      stats.topEntityTypes[log.entityType] =
        (stats.topEntityTypes[log.entityType] || 0) + 1;
    });

    return stats;
  },
});
