// convex/lib/system/system_metrics/queries.ts

import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireAdmin } from '@/shared/auth.helper'

/**
 * Get system metrics with optional filtering
 */
export const getSystemMetrics = query({
  args: {
    metricType: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const { metricType, startTime, endTime, limit = 100 } = args

    const query = metricType && startTime
      ? ctx.db.query('systemMetrics')
        .withIndex('by_type_and_recorded_at', (q) =>
          q.eq('metricType', metricType).gte('timestamps.recordedAt', startTime)
        )
      : metricType
        ? ctx.db.query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', metricType))
        : startTime
          ? ctx.db.query('systemMetrics')
            .withIndex('by_recorded_at', (q) => q.gte('timestamps.recordedAt', startTime))
          : ctx.db.query('systemMetrics');

    let metrics = await query.take(limit)

    if (endTime) {
      metrics = metrics.filter((m) => (m as any).timestamps?.recordedAt <= endTime)
    }

    return metrics
  },
})

/**
 * Get latest metric value for a specific type
 */
export const getLatestMetric = query({
  args: {
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const metric = await ctx.db
      .query('systemMetrics')
      .withIndex('by_type', (q) => q.eq('metricType', args.metricType))
      .order('desc')
      .first()

    return metric
  },
})

/**
 * Get aggregated metrics statistics
 */
export const getMetricsStats = query({
  args: {
    metricType: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const { metricType, startTime, endTime } = args

    let query = ctx.db
      .query('systemMetrics')
      .withIndex('by_type', (q) => q.eq('metricType', metricType))

    let metrics = await query.collect()

    // Filter by time range if provided
    if (startTime) {
      metrics = metrics.filter((m) => (m as any).timestamps?.recordedAt >= startTime)
    }
    if (endTime) {
      metrics = metrics.filter((m) => (m as any).timestamps?.recordedAt <= endTime)
    }

    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        latest: 0,
        unit: '',
      }
    }

    const values = metrics.map((m) => (m as any).measurement?.value ?? 0)
    const sum = values.reduce((acc, val) => acc + val, 0)

    return {
      count: metrics.length,
      average: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: (metrics[metrics.length - 1] as any)?.measurement?.value ?? 0,
      unit: (metrics[0] as any)?.measurement?.unit ?? '',
    }
  },
})

/**
 * Get system health overview
 */
export const getSystemHealth = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    // Get recent metrics for various system components
    const [apiResponse, cpuMetric, memoryMetric, errorRate, uptimeMetric] =
      await Promise.all([
        ctx.db
          .query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', 'api_response'))
          .order('desc')
          .first(),
        ctx.db
          .query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', 'cpu'))
          .order('desc')
          .first(),
        ctx.db
          .query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', 'memory'))
          .order('desc')
          .first(),
        ctx.db
          .query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', 'error_rate'))
          .order('desc')
          .first(),
        ctx.db
          .query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', 'uptime'))
          .order('desc')
          .first(),
      ])

    return {
      apiResponse: apiResponse
        ? {
          value: (apiResponse as any).measurement?.value,
          unit: (apiResponse as any).measurement?.unit,
          timestamp: (apiResponse as any).timestamps?.recordedAt,
          status:
            ((apiResponse as any).measurement?.value ?? 0) < 200
              ? 'healthy'
              : ((apiResponse as any).measurement?.value ?? 0) < 500
                ? 'warning'
                : 'critical',
        }
        : null,
      cpu: cpuMetric
        ? {
          value: (cpuMetric as any).measurement?.value,
          unit: (cpuMetric as any).measurement?.unit,
          timestamp: (cpuMetric as any).timestamps?.recordedAt,
          status:
            ((cpuMetric as any).measurement?.value ?? 0) < 70
              ? 'healthy'
              : ((cpuMetric as any).measurement?.value ?? 0) < 90
                ? 'warning'
                : 'critical',
        }
        : null,
      memory: memoryMetric
        ? {
          value: (memoryMetric as any).measurement?.value,
          unit: (memoryMetric as any).measurement?.unit,
          timestamp: (memoryMetric as any).timestamps?.recordedAt,
          status:
            ((memoryMetric as any).measurement?.value ?? 0) < 75
              ? 'healthy'
              : ((memoryMetric as any).measurement?.value ?? 0) < 90
                ? 'warning'
                : 'critical',
        }
        : null,
      errorRate: errorRate
        ? {
          value: (errorRate as any).measurement?.value,
          unit: (errorRate as any).measurement?.unit,
          timestamp: (errorRate as any).timestamps?.recordedAt,
          status:
            ((errorRate as any).measurement?.value ?? 0) < 1
              ? 'healthy'
              : ((errorRate as any).measurement?.value ?? 0) < 5
                ? 'warning'
                : 'critical',
        }
        : null,
      uptime: uptimeMetric
        ? {
          value: (uptimeMetric as any).measurement?.value,
          unit: (uptimeMetric as any).measurement?.unit,
          timestamp: (uptimeMetric as any).timestamps?.recordedAt,
          status: ((uptimeMetric as any).measurement?.value ?? 0) > 0 ? 'healthy' : 'critical',
        }
        : null,
      overallStatus: 'healthy', // Can be calculated based on component statuses
    }
  },
})

/**
 * Get metrics dashboard data
 */
export const getMetricsDashboard = query({
  args: {
    timeRange: v.optional(v.string()), // '1h', '24h', '7d', '30d'
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const { timeRange = '24h' } = args
    const now = Date.now()

    // Calculate time range
    const timeRanges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }

    const startTime = now - (timeRanges[timeRange] ?? timeRanges['24h'])

    // Get all metrics in the time range
    const metrics = await ctx.db
      .query('systemMetrics')
      .withIndex('by_recorded_at', (q) => q.gte('timestamps.recordedAt', startTime))
      .collect()

    // Group metrics by type
    const metricsByType = metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.metricType]) {
          acc[metric.metricType] = []
        }
        acc[metric.metricType].push(metric)
        return acc
      },
      {} as Record<string, typeof metrics>
    )

    // Calculate stats for each type
    const stats = Object.entries(metricsByType).map(([type, typeMetrics]) => {
      const values = typeMetrics.map((m) => (m as any).measurement?.value ?? 0)
      const sum = values.reduce((acc, val) => acc + val, 0)

      return {
        metricType: type,
        count: typeMetrics.length,
        average: sum / typeMetrics.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: (typeMetrics[typeMetrics.length - 1] as any)?.measurement?.value ?? 0,
        unit: (typeMetrics[0] as any)?.measurement?.unit ?? '',
        data: typeMetrics.map((m) => ({
          timestamp: (m as any).timestamps?.recordedAt,
          value: (m as any).measurement?.value,
        })),
      }
    })

    return {
      timeRange,
      startTime,
      endTime: now,
      stats,
    }
  },
})

/**
 * Get available metric types
 */
export const getMetricTypes = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const metrics = await ctx.db.query('systemMetrics').collect()

    const types = new Set(metrics.map((m) => m.metricType))

    return Array.from(types).sort()
  },
})
