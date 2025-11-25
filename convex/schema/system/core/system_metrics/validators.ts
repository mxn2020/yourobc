// convex/schema/system/core/system_metrics/validators.ts
// Grouped validators and fields for system metrics module

import { v } from 'convex/values';

export const systemMetricsValidators = {
  metricType: v.string(),
  unit: v.string(),
} as const;

export const systemMetricsFields = {
  measurement: v.object({
    value: v.number(),
    unit: systemMetricsValidators.unit,
  }),
  timestamps: v.object({
    recordedAt: v.number(),
  }),
} as const;
