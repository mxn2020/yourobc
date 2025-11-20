// convex/lib/boilerplate/autumn/autumn_usage_logs/mutations.ts
// Write operations for autumn usage logs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, generateUniquePublicId } from '@/shared/auth.helper';
import { validateAutumnUsageLogData, generateUsageLogName } from './utils';
import {
  requireCreateAutumnUsageLogAccess,
  requireEditAutumnUsageLogAccess,
  requireDeleteAutumnUsageLogAccess,
} from './permissions';
import type { AutumnUsageLogId } from './types';
import { createAuditLog } from '../../audit_logs/helpers';

/**
 * Create autumn usage log
 * 🔒 Authentication: Required
 * 🔒 Authorization: All authenticated users
 */
export const createAutumnUsageLog = mutation({
  args: {
    userId: v.id('userProfiles'),
    authUserId: v.string(),
    autumnCustomerId: v.string(),
    featureId: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<AutumnUsageLogId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateAutumnUsageLogAccess(user);

    // 3. VALIDATE: Check data validity
    const logName = generateUsageLogName(args.featureId, args.value);
    const data = {
      name: logName,
      featureId: args.featureId,
      value: args.value,
      autumnCustomerId: args.autumnCustomerId,
    };
    const errors = validateAutumnUsageLogData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. CHECK: Verify target user exists
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // 5. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'autumnUsageLogs');
    const now = Date.now();

    // 6. CREATE: Insert new usage log
    const logId = await ctx.db.insert('autumnUsageLogs', {
      publicId,
      name: logName,
      ownerId: args.userId,
      userId: args.userId,
      authUserId: args.authUserId.trim(),
      autumnCustomerId: args.autumnCustomerId.trim(),
      featureId: args.featureId.trim(),
      value: args.value,
      syncedToAutumn: false,
      lastActivityAt: now,
      metadata: args.metadata ?? {},
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_usage_log.created',
      entityType: 'autumn_usage_log',
      entityId: logId,
      entityTitle: logName,
      description: `Created usage log: ${logName}`,
      metadata: {
        operation: 'create_usage_log',
        featureId: args.featureId,
        value: args.value,
      },
    });

    // 8. RETURN: Log ID
    return logId;
  },
});

/**
 * Update autumn usage log
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateAutumnUsageLog = mutation({
  args: {
    logId: v.id('autumnUsageLogs'),
    updates: v.object({
      name: v.optional(v.string()),
      value: v.optional(v.number()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { logId, updates }): Promise<AutumnUsageLogId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('Usage log not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAutumnUsageLogAccess(ctx, log, user);

    // 4. CHECK: Prevent editing if already synced
    if (log.syncedToAutumn) {
      throw new Error('Cannot edit usage log that has been synced to Autumn');
    }

    // 5. VALIDATE: Check update data validity
    const errors = validateAutumnUsageLogData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 6. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.value !== undefined) {
      updateData.value = updates.value;
    }
    if (updates.metadata !== undefined) {
      updateData.metadata = updates.metadata;
    }

    // 7. UPDATE: Apply changes
    await ctx.db.patch(logId, updateData);

    // 8. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_usage_log.updated',
      entityType: 'autumn_usage_log',
      entityId: logId,
      entityTitle: updateData.name || log.name,
      description: `Updated usage log: ${updateData.name || log.name}`,
      metadata: { changes: updates },
    });

    // 9. RETURN: Log ID
    return logId;
  },
});

/**
 * Mark usage log as synced to Autumn
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const markUsageLogSynced = mutation({
  args: {
    logId: v.id('autumnUsageLogs'),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { logId, success, error }): Promise<AutumnUsageLogId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get log
    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('Usage log not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditAutumnUsageLogAccess(ctx, log, user);

    const now = Date.now();

    // 4. UPDATE: Mark as synced
    await ctx.db.patch(logId, {
      syncedToAutumn: success,
      syncedAt: success ? now : undefined,
      syncError: error?.trim(),
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: success ? 'autumn_usage_log.synced' : 'autumn_usage_log.sync_failed',
      entityType: 'autumn_usage_log',
      entityId: logId,
      entityTitle: log.name,
      description: success
        ? `Synced usage log to Autumn: ${log.name}`
        : `Failed to sync usage log to Autumn: ${log.name}`,
      metadata: {
        operation: 'mark_synced',
        success,
        error,
      },
    });

    // 6. RETURN: Log ID
    return logId;
  },
});

/**
 * Batch mark usage logs as synced
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const batchMarkUsageLogsSynced = mutation({
  args: {
    logIds: v.array(v.id('autumnUsageLogs')),
    success: v.boolean(),
  },
  handler: async (ctx, { logIds, success }): Promise<{ synced: number }> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check admin permission
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required');
    }

    const now = Date.now();
    let syncedCount = 0;

    // 3. PROCESS: Update each log
    for (const logId of logIds) {
      const log = await ctx.db.get(logId);
      if (log && !log.deletedAt) {
        await ctx.db.patch(logId, {
          syncedToAutumn: success,
          syncedAt: success ? now : undefined,
          syncError: undefined,
          updatedAt: now,
          lastActivityAt: now,
          updatedBy: user._id,
        });
        syncedCount++;
      }
    }

    // 4. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_usage_logs.batch_synced',
      entityType: 'autumn_usage_log',
      entityId: logIds[0] || '',
      entityTitle: `${syncedCount} usage logs`,
      description: `Batch marked ${syncedCount} usage logs as ${success ? 'synced' : 'unsynced'}`,
      metadata: {
        operation: 'batch_mark_synced',
        count: syncedCount,
        success,
      },
    });

    // 5. RETURN: Count
    return { synced: syncedCount };
  },
});

/**
 * Delete an autumn usage log (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteAutumnUsageLog = mutation({
  args: {
    logId: v.id('autumnUsageLogs'),
  },
  handler: async (ctx, { logId }): Promise<AutumnUsageLogId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get log
    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('Usage log not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteAutumnUsageLogAccess(log, user);

    const now = Date.now();

    // 4. SOFT DELETE: Mark as deleted
    await ctx.db.patch(logId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_usage_log.deleted',
      entityType: 'autumn_usage_log',
      entityId: logId,
      entityTitle: log.name,
      description: `Deleted usage log: ${log.name}`,
      metadata: {
        operation: 'delete_usage_log',
        featureId: log.featureId,
      },
    });

    // 6. RETURN: Log ID
    return logId;
  },
});

/**
 * Restore soft-deleted autumn usage log
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const restoreAutumnUsageLog = mutation({
  args: {
    logId: v.id('autumnUsageLogs'),
  },
  handler: async (ctx, { logId }): Promise<AutumnUsageLogId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const log = await ctx.db.get(logId);
    if (!log) {
      throw new Error('Usage log not found');
    }
    if (!log.deletedAt) {
      throw new Error('Usage log is not deleted');
    }

    // 3. AUTHZ: Check admin permission
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required to restore usage logs');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(logId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'autumn_usage_log.restored',
      entityType: 'autumn_usage_log',
      entityId: logId,
      entityTitle: log.name,
      description: `Restored usage log: ${log.name}`,
    });

    // 6. RETURN: Log ID
    return logId;
  },
});
