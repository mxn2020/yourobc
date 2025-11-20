// convex/lib/boilerplate/system_metrics/mutations.ts

import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireAdmin } from '@/shared/auth.helper'

/**
 * Record a system metric
 */
export const recordMetric = mutation({
  args: {
    metricType: v.string(),
    value: v.number(),
    unit: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. No auth required - can be called by system monitoring scripts

    // 2. Trim string fields
    const trimmedMetricType = args.metricType.trim();
    const trimmedUnit = args.unit.trim();

    // 3. Record metric
    const timestamp = Date.now();
    const metricId = await ctx.db.insert('systemMetrics', {
      metricType: trimmedMetricType,
      value: args.value,
      unit: trimmedUnit,
      metadata: args.metadata,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: undefined,
    });

    // 4. Return metric ID
    return { success: true, id: metricId };
  },
})

/**
 * Record multiple metrics in batch
 */
export const recordMetricsBatch = mutation({
  args: {
    metrics: v.array(
      v.object({
        metricType: v.string(),
        value: v.number(),
        unit: v.string(),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. No auth required - can be called by system monitoring scripts

    // 2. Record metrics in batch
    const timestamp = Date.now();
    const ids: string[] = [];

    for (const metric of args.metrics) {
      // 3. Trim string fields for each metric
      const trimmedMetricType = metric.metricType.trim();
      const trimmedUnit = metric.unit.trim();

      // 4. Insert metric
      const metricId = await ctx.db.insert('systemMetrics', {
        metricType: trimmedMetricType,
        value: metric.value,
        unit: trimmedUnit,
        metadata: metric.metadata,
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: undefined,
      });
      ids.push(metricId);
    }

    // 5. Return batch result
    return { success: true, count: ids.length, ids };
  },
})

/**
 * Delete old metrics (cleanup)
 */
export const cleanupOldMetrics = mutation({
  args: {
    olderThan: v.number(), // timestamp
    metricType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx);

    // 2. Trim string fields
    const trimmedMetricType = args.metricType?.trim();

    // 3. Build query
    const query = trimmedMetricType
      ? ctx.db.query('systemMetrics').withIndex('by_type', (q) => q.eq('metricType', trimmedMetricType))
      : ctx.db.query('systemMetrics');

    // 4. Find old metrics
    const metrics = await query.collect();
    const toDelete = metrics.filter((m) => m.timestamp < args.olderThan);

    // 5. Soft delete old metrics
    const now = Date.now();
    let deletedCount = 0;
    for (const metric of toDelete) {
      await ctx.db.patch(metric._id, {
        deletedAt: now,
        deletedBy: admin._id,
        updatedAt: now,
        updatedBy: admin._id,
      });
      deletedCount++;
    }

    // 6. Create audit log
    const adminName = (admin.name || admin.email || 'Admin').trim();
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: adminName,
      action: 'system_metrics.cleanup',
      entityType: 'system_metrics',
      entityId: undefined,
      entityTitle: 'System Metrics Cleanup',
      description: `Cleaned up ${deletedCount} old system metrics`,
      metadata: {
        deletedCount,
        olderThan: args.olderThan,
        metricType: trimmedMetricType ?? null,
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    });

    // 7. Return result
    return { success: true, deletedCount };
  },
})

/**
 * Delete all metrics for a specific type
 */
export const deleteMetricsByType = mutation({
  args: {
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx);

    // 2. Trim string fields
    const trimmedMetricType = args.metricType.trim();

    // 3. Get metrics by type
    const metrics = await ctx.db
      .query('systemMetrics')
      .withIndex('by_type', (q) => q.eq('metricType', trimmedMetricType))
      .collect();

    // 4. Soft delete all metrics
    const now = Date.now();
    let deletedCount = 0;
    for (const metric of metrics) {
      await ctx.db.patch(metric._id, {
        deletedAt: now,
        deletedBy: admin._id,
        updatedAt: now,
        updatedBy: admin._id,
      });
      deletedCount++;
    }

    // 5. Create audit log
    const adminName = (admin.name || admin.email || 'Admin').trim();
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: adminName,
      action: 'system_metrics.delete_by_type',
      entityType: 'system_metrics',
      entityId: undefined,
      entityTitle: `Delete ${trimmedMetricType} Metrics`,
      description: `Deleted ${deletedCount} metrics of type ${trimmedMetricType}`,
      metadata: {
        metricType: trimmedMetricType,
        deletedCount,
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    });

    // 6. Return result
    return { success: true, deletedCount };
  },
})

/**
 * Record API response time metric
 */
export const recordApiResponse = mutation({
  args: {
    endpoint: v.string(),
    responseTime: v.number(), // in milliseconds
    statusCode: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. No auth required - can be called by system monitoring scripts

    // 2. Trim string fields
    const trimmedEndpoint = args.endpoint.trim();

    // 3. Record API response metric
    const timestamp = Date.now();
    const metricId = await ctx.db.insert('systemMetrics', {
      metricType: 'api_response',
      value: args.responseTime,
      unit: 'ms',
      metadata: {
        endpoint: trimmedEndpoint,
        statusCode: args.statusCode,
      },
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: undefined,
    });

    // 4. Return metric ID
    return { success: true, id: metricId };
  },
})

/**
 * Record error rate metric
 */
export const recordErrorRate = mutation({
  args: {
    errorCount: v.number(),
    totalRequests: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. No auth required - can be called by system monitoring scripts

    // 2. Calculate error rate
    const errorRate = args.totalRequests > 0 ? (args.errorCount / args.totalRequests) * 100 : 0;

    // 3. Record error rate metric
    const timestamp = Date.now();
    const metricId = await ctx.db.insert('systemMetrics', {
      metricType: 'error_rate',
      value: errorRate,
      unit: 'percent',
      metadata: {
        errorCount: args.errorCount,
        totalRequests: args.totalRequests,
      },
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: undefined,
    });

    // 4. Return metric ID
    return { success: true, id: metricId, errorRate };
  },
})

/**
 * Record system resource usage
 */
export const recordSystemResources = mutation({
  args: {
    cpu: v.optional(v.number()),
    memory: v.optional(v.number()),
    disk: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. No auth required - can be called by system monitoring scripts

    // 2. Record system resource metrics
    const timestamp = Date.now();
    const ids: string[] = [];

    // 3. Record CPU metric if provided
    if (args.cpu !== undefined) {
      const metricId = await ctx.db.insert('systemMetrics', {
        metricType: 'cpu',
        value: args.cpu,
        unit: 'percent',
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: undefined,
      });
      ids.push(metricId);
    }

    // 4. Record memory metric if provided
    if (args.memory !== undefined) {
      const metricId = await ctx.db.insert('systemMetrics', {
        metricType: 'memory',
        value: args.memory,
        unit: 'percent',
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: undefined,
      });
      ids.push(metricId);
    }

    // 5. Record disk metric if provided
    if (args.disk !== undefined) {
      const metricId = await ctx.db.insert('systemMetrics', {
        metricType: 'disk',
        value: args.disk,
        unit: 'percent',
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedBy: undefined,
      });
      ids.push(metricId);
    }

    // 6. Return result
    return { success: true, count: ids.length, ids };
  },
})
