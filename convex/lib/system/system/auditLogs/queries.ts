// convex/lib/system/system/auditLogs/queries.ts
// Read operations for auditLogs module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { filterAuditLogsByAccess, requireViewAuditLogAccess } from './permissions';
import type { AuditLogListResponse } from './types';

/**
 * Get paginated list of audit logs with filtering
 */
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      userId: v.optional(v.id('userProfiles')),
      action: v.optional(v.string()),
      entityType: v.optional(v.string()),
      entityId: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<AuditLogListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query by user or all (for admins)
    let auditLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_user', q => 
        filters.userId ? q.eq('userId', filters.userId) : q
      )
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .collect();

    // Apply access filtering
    auditLogs = await filterAuditLogsByAccess(ctx, auditLogs, user);

    // Apply action filter
    if (filters.action) {
      auditLogs = auditLogs.filter(item => item.action === filters.action);
    }

    // Apply entity type filter
    if (filters.entityType) {
      auditLogs = auditLogs.filter(item => item.entityType === filters.entityType);
    }

    // Apply entity ID filter
    if (filters.entityId) {
      auditLogs = auditLogs.filter(item => item.entityId === filters.entityId);
    }

    // Apply date range filters
    if (filters.startDate) {
      auditLogs = auditLogs.filter(item => item.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      auditLogs = auditLogs.filter(item => item.createdAt <= filters.endDate!);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      auditLogs = auditLogs.filter(item =>
        item.action.toLowerCase().includes(term) ||
        item.userName.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.entityTitle && item.entityTitle.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = auditLogs.length;
    const items = auditLogs.slice(offset, offset + limit);

    return { items, total, hasMore: total > offset + limit };
  },
});

/**
 * Get single audit log by ID
 */
export const getAuditLog = query({
  args: { auditLogId: v.id('auditLogs') },
  handler: async (ctx, { auditLogId }) => {
    const user = await requireCurrentUser(ctx);
    const auditLog = await ctx.db.get(auditLogId);
    if (!auditLog || auditLog.deletedAt) {
      throw new Error('Audit log not found');
    }
    await requireViewAuditLogAccess(ctx, auditLog, user);
    return auditLog;
  },
});

/**
 * Get audit logs for a specific entity
 */
export const getAuditLogsByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { entityType, entityId, limit = 50 }) => {
    const user = await requireCurrentUser(ctx);

    let auditLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_entity', q => q.eq('entityType', entityType).eq('entityId', entityId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    auditLogs = await filterAuditLogsByAccess(ctx, auditLogs, user);

    return auditLogs;
  },
});
