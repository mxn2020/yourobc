// convex/schema/system/system/systemMetrics/validators.ts
// Grouped validators for systemMetrics module

import { v } from 'convex/values';

export const systemMetricsValidators = {
  // Metric identification
  metricType: v.string(),

  // Metric data
  value: v.any(),
  unit: v.optional(v.string()),
  timestamp: v.number(),

  // Standard metadata
  metadata: v.optional(v.union(
    v.object({
      source: v.optional(v.string()),
      operation: v.optional(v.string()),
      oldValues: v.optional(v.record(v.string(), v.any())),
      newValues: v.optional(v.record(v.string(), v.any())),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }),
    v.record(v.string(), v.any())
  )),
} as const;
