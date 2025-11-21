// convex/schema/system/system/systemMetrics/systemMetrics.ts
// Table definitions for systemMetrics module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { systemMetricsValidators } from './validators';

export const systemMetricsTable = defineTable({
  // Metric identification
  metricType: systemMetricsValidators.metricType,

  // Metric data
  value: systemMetricsValidators.value,
  unit: systemMetricsValidators.unit,
  timestamp: systemMetricsValidators.timestamp,

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_type', ['metricType'])
  .index('by_timestamp', ['timestamp'])
  .index('by_type_timestamp', ['metricType', 'timestamp'])
  .index('by_created_at', ['createdAt']);
