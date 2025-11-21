// convex/lib/system/system/systemMetrics/mutations.ts
// Write operations for systemMetrics module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { SYSTEM_METRICS_CONSTANTS } from './constants';
import { validateSystemMetricData } from './utils';
import { requireEditSystemMetricAccess, requireDeleteSystemMetricAccess } from './permissions';
import type { SystemMetricId } from './types';

export const createSystemMetric = mutation({
  args: {
    data: v.object({
      metricType: v.string(),
    }),
  },
  handler: async (ctx, { data }): Promise<SystemMetricId> => {
    const user = await requireCurrentUser(ctx);
    await requirePermission(ctx, SYSTEM_METRICS_CONSTANTS.PERMISSIONS.CREATE, { allowAdmin: true });

    const errors = validateSystemMetricData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const publicId = await generateUniquePublicId(ctx, 'systemMetrics');
    const now = Date.now();

    const entityId = await ctx.db.insert('systemMetrics', {
      publicId,
      metricType: data.metricType.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'systemMetrics.created',
      entityType: 'system_systemMetrics',
      entityId: publicId,
      entityTitle: data.metricType.trim(),
      description: `Created systemMetrics: ${data.metricType.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const updateSystemMetric = mutation({
  args: {
    entityId: v.id('systemMetrics'),
    updates: v.object({
      metricType: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { entityId, updates }): Promise<SystemMetricId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('SystemMetric not found');
    }

    await requireEditSystemMetricAccess(ctx, entity, user);

    const errors = validateSystemMetricData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now, updatedBy: user._id };

    if (updates.metricType !== undefined) {
      updateData.metricType = updates.metricType.trim();
    }

    await ctx.db.patch(entityId, updateData);

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'systemMetrics.updated',
      entityType: 'system_systemMetrics',
      entityId: entity.publicId,
      entityTitle: updateData.metricType || entity.metricType,
      description: `Updated systemMetrics: ${updateData.metricType || entity.metricType}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});

export const deleteSystemMetric = mutation({
  args: { entityId: v.id('systemMetrics') },
  handler: async (ctx, { entityId }): Promise<SystemMetricId> => {
    const user = await requireCurrentUser(ctx);
    const entity = await ctx.db.get(entityId);
    if (!entity || entity.deletedAt) {
      throw new Error('SystemMetric not found');
    }

    await requireDeleteSystemMetricAccess(entity, user);

    const now = Date.now();
    await ctx.db.patch(entityId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'systemMetrics.deleted',
      entityType: 'system_systemMetrics',
      entityId: entity.publicId,
      entityTitle: entity.metricType,
      description: `Deleted systemMetrics: ${entity.metricType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return entityId;
  },
});
