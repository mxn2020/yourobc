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
        .withIndex('by_type_timestamp', (q) =>
          q.eq('metricType', metricType).gte('timestamp', startTime)
        )
      : metricType
        ? ctx.db.query('systemMetrics')
          .withIndex('by_type', (q) => q.eq('metricType', metricType))
        : startTime
          ? ctx.db.query('systemMetrics')
            .withIndex('by_timestamp', (q) => q.gte('timestamp', startTime))
          : ctx.db.query('systemMetrics');

    let metrics = await query.take(limit)

    if (endTime) {
      metrics = metrics.filter((m) => m.timestamp <= endTime)
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
      metrics = metrics.filter((m) => m.timestamp >= startTime)
    }
    if (endTime) {
      metrics = metrics.filter((m) => m.timestamp <= endTime)
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

    const values = metrics.map((m) => m.value)
    const sum = values.reduce((acc, val) => acc + val, 0)

    return {
      count: metrics.length,
      average: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: metrics[metrics.length - 1]?.value ?? 0,
      unit: metrics[0]?.unit ?? '',
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
          value: apiResponse.value,
          unit: apiResponse.unit,
          timestamp: apiResponse.timestamp,
          status:
            apiResponse.value < 200
              ? 'healthy'
              : apiResponse.value < 500
                ? 'warning'
                : 'critical',
        }
        : null,
      cpu: cpuMetric
        ? {
          value: cpuMetric.value,
          unit: cpuMetric.unit,
          timestamp: cpuMetric.timestamp,
          status:
            cpuMetric.value < 70
              ? 'healthy'
              : cpuMetric.value < 90
                ? 'warning'
                : 'critical',
        }
        : null,
      memory: memoryMetric
        ? {
          value: memoryMetric.value,
          unit: memoryMetric.unit,
          timestamp: memoryMetric.timestamp,
          status:
            memoryMetric.value < 75
              ? 'healthy'
              : memoryMetric.value < 90
                ? 'warning'
                : 'critical',
        }
        : null,
      errorRate: errorRate
        ? {
          value: errorRate.value,
          unit: errorRate.unit,
          timestamp: errorRate.timestamp,
          status:
            errorRate.value < 1
              ? 'healthy'
              : errorRate.value < 5
                ? 'warning'
                : 'critical',
        }
        : null,
      uptime: uptimeMetric
        ? {
          value: uptimeMetric.value,
          unit: uptimeMetric.unit,
          timestamp: uptimeMetric.timestamp,
          status: uptimeMetric.value > 0 ? 'healthy' : 'critical',
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
      .withIndex('by_timestamp', (q) => q.gte('timestamp', startTime))
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
      const values = typeMetrics.map((m) => m.value)
      const sum = values.reduce((acc, val) => acc + val, 0)

      return {
        metricType: type,
        count: typeMetrics.length,
        average: sum / typeMetrics.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: typeMetrics[typeMetrics.length - 1]?.value ?? 0,
        unit: typeMetrics[0]?.unit ?? '',
        data: typeMetrics.map((m) => ({
          timestamp: m.timestamp,
          value: m.value,
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
