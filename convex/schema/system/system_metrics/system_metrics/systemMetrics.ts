// convex/schema/system/system_metrics/system_metrics/systemMetrics.ts
// Table definitions for system metrics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { systemMetricsFields, systemMetricsValidators } from './validators';

export const systemMetricsTable = defineTable({
  displayName: v.string(),
  publicId: v.string(),

  // Exemption: metrics are system-level; ownerId is optional for cross-tenant aggregation
  ownerId: v.optional(v.id('userProfiles')),

  metricType: systemMetricsValidators.metricType,
  measurement: systemMetricsFields.measurement,
  timestamps: systemMetricsFields.timestamps,

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_type', ['metricType'])
  .index('by_recorded_at', ['timestamps.recordedAt'])
  .index('by_type_and_recorded_at', ['metricType', 'timestamps.recordedAt'])
  .index('by_created_at', ['createdAt']);
