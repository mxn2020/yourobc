// convex/schema/system/system/systemMetrics/systemMetrics.ts
// Table definitions for systemMetrics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { systemMetricsValidators } from './validators';

export const systemMetricsTable = defineTable({
  // Required: Main display field (metricType as name)
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Metric identification
  metricType: systemMetricsValidators.metricType,

  // Metric data
  value: systemMetricsValidators.value,
  unit: systemMetricsValidators.unit,
  timestamp: systemMetricsValidators.timestamp,

  // Standard metadata and audit fields
  metadata: systemMetricsValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_type', ['metricType'])
  .index('by_timestamp', ['timestamp'])
  .index('by_type_timestamp', ['metricType', 'timestamp'])
  .index('by_created_at', ['createdAt']);
