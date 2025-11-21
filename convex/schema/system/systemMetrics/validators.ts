// convex/schema/system/system/systemMetrics/validators.ts
// Grouped validators for systemMetrics module

import { v } from 'convex/values';

export const systemMetricsValidators = {
  // Metric type (e.g., 'api_response', 'database', 'cpu', 'memory', 'error_rate', 'uptime')
  metricType: v.string(),

  // Metric value
  value: v.number(),

  // Unit of measurement (e.g., 'ms', 'percent', 'count', 'bytes', 'boolean')
  unit: v.string(),

  // Timestamp of the metric
  timestamp: v.number(),

} as const;
