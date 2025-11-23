// convex/lib/system/audit_logs/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { getCurrentUser, requireAdmin } from '@/shared/auth.helper';
import { entityTypes } from './entityTypes';
import { AUDIT_LOG_CONSTANTS } from './constants';

/**
 * Create an audit log entry
 * 🔒 Authentication: Required
 */
export const createAuditLog = mutation({
  args: {
    action: v.string(),
    entityType: entityTypes.all,
    entityId: v.optional(v.string()),
    entityTitle: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(
      v.union(
        v.object({
          source: v.optional(v.string()),
          operation: v.optional(v.string()),
          oldValues: v.optional(v.any()),
          newValues: v.optional(v.any()),
          ipAddress: v.optional(v.string()),
          userAgent: v.optional(v.string()),
        }),
        v.record(v.string(), v.any())
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error('Cannot create audit log without authentication.');
    }

    // 2. Trim string fields
    const action = args.action.trim();
    const entityType = args.entityType.trim();
    const entityId = args.entityId?.trim();
    const entityTitle = args.entityTitle?.trim();
    const description = args.description.trim();

    // 3. Validate description length
    if (
      description.length > AUDIT_LOG_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `Description must be less than ${AUDIT_LOG_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }

    const now = Date.now();

    // 4. Create audit log data
    const auditLogData = {
      userId: user._id,
      userName: (user.name || 'User').trim(),
      action,
      entityType,
      entityId,
      entityTitle,
      description,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    };

    // 5. Insert audit log
    return await ctx.db.insert('auditLogs', auditLogData);
  },
});

/**
 * Cleanup old audit logs
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const cleanupOldAuditLogs = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx);

    // 2. Calculate cutoff date
    const cutoffDate =
      Date.now() -
      AUDIT_LOG_CONSTANTS.LIMITS.RETENTION_DAYS * 24 * 60 * 60 * 1000;

    // 3. Get old logs
    const oldLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_created_at', (q) => q.lt('createdAt', cutoffDate))
      .collect();

    const now = Date.now();
    const batchSize = 100;
    let deletedCount = 0;

    // 4. Soft delete old logs in batches
    for (let i = 0; i < oldLogs.length; i += batchSize) {
      const batch = oldLogs.slice(i, i + batchSize);
      await Promise.all(batch.map((log) =>
        ctx.db.patch(log._id, {
          deletedAt: now,
          deletedBy: admin._id,
          updatedAt: now,
          updatedBy: admin._id,
        })
      ));
      deletedCount += batch.length;
    }

    // 5. Create audit log for cleanup operation
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: admin.name || 'Admin',
      action: AUDIT_LOG_CONSTANTS.ACTIONS.SYSTEM_MAINTENANCE,
      entityType: AUDIT_LOG_CONSTANTS.ENTITY_TYPES.SYSTEM,
      description: `Cleaned up ${deletedCount} old audit logs`,
      metadata: {
        oldValues: {
          deletedCount,
          cutoffDate,
          retentionDays: AUDIT_LOG_CONSTANTS.LIMITS.RETENTION_DAYS,
        },
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    });

    // 6. Return deleted count
    return deletedCount;
  },
});

/**
 * Bulk create audit logs
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const bulkCreateAuditLogs = mutation({
  args: {
    logs: v.array(
      v.object({
        action: v.string(),
        entityType: entityTypes.all,
        entityId: v.optional(v.string()),
        entityTitle: v.optional(v.string()),
        description: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, { logs }) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx);

    const now = Date.now();

    // 2. Trim string fields and create audit logs
    const auditLogs = logs.map((log) => ({
      userId: admin._id,
      userName: (admin.name || 'Admin').trim(),
      action: log.action.trim(),
      entityType: log.entityType.trim(),
      entityId: log.entityId?.trim(),
      entityTitle: log.entityTitle?.trim(),
      description: log.description.trim(),
      metadata: log.metadata,
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    }));

    // 3. Insert all audit logs
    const results = await Promise.all(
      auditLogs.map((log) => ctx.db.insert('auditLogs', log))
    );

    // 4. Return results
    return {
      created: results.length,
      logIds: results,
    };
  },
});