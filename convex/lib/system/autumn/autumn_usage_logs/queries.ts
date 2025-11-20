// convex/lib/boilerplate/autumn/autumn_usage_logs/queries.ts
// Read operations for autumn usage logs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { filterAutumnUsageLogsByAccess, requireViewAutumnUsageLogAccess } from './permissions';
import type { AutumnUsageLogListResponse } from './types';

/**
 * Get paginated list of autumn usage logs with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admins see all, users see their own
 */
export const getAutumnUsageLogs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      syncedToAutumn: v.optional(v.boolean()),
      featureId: v.optional(v.string()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<AutumnUsageLogListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query all logs
    let logs = await ctx.db
      .query('autumnUsageLogs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access control filtering
    logs = await filterAutumnUsageLogsByAccess(ctx, logs, user);

    // Apply synced filter
    if (filters.syncedToAutumn !== undefined) {
      logs = logs.filter((log) => log.syncedToAutumn === filters.syncedToAutumn);
    }

    // Apply feature ID filter
    if (filters.featureId) {
      logs = logs.filter((log) => log.featureId === filters.featureId);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      logs = logs.filter((log) =>
        log.name.toLowerCase().includes(term) ||
        log.featureId.toLowerCase().includes(term) ||
        log.autumnCustomerId.toLowerCase().includes(term)
      );
    }

    // Sort by created date descending
    logs.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = logs.length;
    const items = logs.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single autumn usage log by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnUsageLog = query({
  args: {
    logId: v.id('autumnUsageLogs'),
  },
  handler: async (ctx, { logId }) => {
    const user = await requireCurrentUser(ctx);

    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('Usage log not found');
    }

    await requireViewAutumnUsageLogAccess(ctx, log, user);

    return log;
  },
});

/**
 * Get autumn usage log by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getAutumnUsageLogByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const log = await ctx.db
      .query('autumnUsageLogs')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!log) {
      throw new Error('Usage log not found');
    }

    await requireViewAutumnUsageLogAccess(ctx, log, user);

    return log;
  },
});

/**
 * Get unsynced autumn usage logs
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getUnsyncedUsageLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 100 }) => {
    const user = await requireCurrentUser(ctx);

    // Only admins can query unsynced logs
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const logs = await ctx.db
      .query('autumnUsageLogs')
      .withIndex('by_synced_to_autumn', (q) => q.eq('syncedToAutumn', false))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit);

    return logs;
  },
});

/**
 * Get usage logs by customer ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const getUsageLogsByCustomerId = query({
  args: {
    autumnCustomerId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { autumnCustomerId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    let logs = await ctx.db
      .query('autumnUsageLogs')
      .withIndex('by_autumn_customer_id', (q) => q.eq('autumnCustomerId', autumnCustomerId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .take(limit);

    // Apply access control filtering
    logs = await filterAutumnUsageLogsByAccess(ctx, logs, user);

    return logs;
  },
});

/**
 * Get autumn usage log statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const getAutumnUsageLogStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    // Check admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const logs = await ctx.db
      .query('autumnUsageLogs')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const syncedLogs = logs.filter((l) => l.syncedToAutumn);
    const unsyncedLogs = logs.filter((l) => !l.syncedToAutumn);
    const failedLogs = logs.filter((l) => l.syncError);

    return {
      total: logs.length,
      synced: syncedLogs.length,
      unsynced: unsyncedLogs.length,
      failed: failedLogs.length,
      totalValue: logs.reduce((sum, log) => sum + log.value, 0),
      byFeature: logs.reduce((acc, log) => {
        acc[log.featureId] = (acc[log.featureId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});
