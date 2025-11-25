// convex/lib/system/audit_logs/admin-queries.ts
// Admin-only queries for audit logs

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { entityTypes } from './entity_types';
import { AUDIT_LOG_CONSTANTS } from './constants';

/**
 * Admin Query: Get all audit logs with advanced filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const adminGetAuditLogs = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
        filters: v.optional(
          v.object({
            userId: v.optional(v.id('userProfiles')),
            action: v.optional(v.string()),
            entityType: v.optional(entityTypes.all),
            entityId: v.optional(v.string()),
            dateFrom: v.optional(v.number()),
            dateTo: v.optional(v.number()),
            search: v.optional(v.string()),
            userName: v.optional(v.string()),
            ipAddress: v.optional(v.string()),
            sessionId: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    await requireAdmin(ctx);

    const { limit = 100, offset = 0, filters = {} } = options;

    let logs;

    // ✅ Choose most selective index
    if (filters.entityType && filters.entityId) {
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_entity', (q) =>
          q.eq('entityType', filters.entityType!).eq('entityId', filters.entityId!)
        )
        .filter(notDeleted)
        .order('desc')
        .take(
          Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
        );
    } else if (filters.userId) {
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_user_id', (q) => q.eq('userId', filters.userId!))
        .filter(notDeleted)
        .order('desc')
        .take(
          Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
        );
    } else if (filters.action) {
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_action', (q) => q.eq('action', filters.action!))
        .filter(notDeleted)
        .order('desc')
        .take(
          Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
        );
    } else if (filters.dateFrom) {
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_created_at', (q) =>
          filters.dateTo
            ? q
                .gte('createdAt', filters.dateFrom!)
                .lte('createdAt', filters.dateTo)
            : q.gte('createdAt', filters.dateFrom!)
        )
        .filter(notDeleted)
        .order('desc')
        .take(
          Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
        );
    } else {
      // Default: last 30 days to prevent unbounded scan
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      logs = await ctx.db
        .query('auditLogs')
        .withIndex('by_created_at', (q) => q.gte('createdAt', thirtyDaysAgo))
        .filter(notDeleted)
        .order('desc')
        .take(
          Math.min(limit + offset, AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY)
        );
    }

    // Apply additional filters in memory
    if (filters.action && (filters.userId || filters.entityType)) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    if (filters.entityType && !filters.entityId && !filters.userId) {
      logs = logs.filter((log) => log.entityType === filters.entityType);
    }

    if (filters.dateFrom && (filters.userId || filters.action || filters.entityType)) {
      logs = logs.filter((log) => log.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo && (filters.userId || filters.action || filters.entityType)) {
      logs = logs.filter((log) => log.createdAt <= filters.dateTo!);
    }

    if (filters.userName) {
      logs = logs.filter((log) =>
        log.userName?.toLowerCase().includes(filters.userName!.toLowerCase())
      );
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
 * Admin Query: Get audit logs for a specific user
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const adminGetUserAuditLogs = query({
  args: {
    targetUserId: v.id('userProfiles'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, limit = 50 }) => {
    await requireAdmin(ctx);

    // ✅ Use indexed query
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_user_id', (q) => q.eq('userId', targetUserId))
      .filter(notDeleted)
      .order('desc')
      .take(limit);

    return logs;
  },
});

/**
 * Admin Query: Get system-wide audit log statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const adminGetAuditLogStats = query({
  args: {
    timeWindow: v.optional(
      v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('all'))
    ),
  },
  handler: async (ctx, { timeWindow = 'month' }) => {
    await requireAdmin(ctx);

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

    // ✅ Use indexed query with time filter
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_created_at', (q) => q.gte('createdAt', startTime))
      .order('desc')
      .take(AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY || 10000);

    const stats = {
      totalLogs: logs.length,
      logsLast24h: logs.filter((log) => log.createdAt >= oneDayAgo).length,
      logsLastWeek: logs.filter((log) => log.createdAt >= oneWeekAgo).length,
      logsLastMonth: logs.filter((log) => log.createdAt >= oneMonthAgo).length,
      topActions: {} as Record<string, number>,
      topEntityTypes: {} as Record<string, number>,
      uniqueUsers: new Set(logs.map((log) => log.userId).filter(Boolean)).size,
      timeWindow,
      dataLimited:
        logs.length >= (AUDIT_LOG_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY || 10000),
    };

    logs.forEach((log) => {
      stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
      stats.topEntityTypes[log.entityType] =
        (stats.topEntityTypes[log.entityType] || 0) + 1;
    });

    return stats;
  },
});

/**
 * Admin Query: Get recent activity across all users
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const adminGetRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 100 }) => {
    await requireAdmin(ctx);

    // ✅ Use indexed query with reasonable limit
    const logs = await ctx.db
      .query('auditLogs')
      .withIndex('by_created_at')
      .order('desc')
      .take(limit);

    return logs;
  },
});
