// convex/schema/system/core/system_metrics/types.ts
// Type extractions from validators for system metrics module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { systemMetricsFields, systemMetricsValidators } from './validators';
import { systemMetricsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type SystemMetric = Doc<'systemMetrics'>;
export type SystemMetricId = Id<'systemMetrics'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type SystemMetricSchema = Infer<typeof systemMetricsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type SystemMetricType = Infer<typeof systemMetricsValidators.metricType>;
export type SystemMetricUnit = Infer<typeof systemMetricsValidators.unit>;

// ============================================
// Field Types
// ============================================

export type SystemMetricMeasurement = Infer<typeof systemMetricsFields.measurement>;
export type SystemMetricTimestamps = Infer<typeof systemMetricsFields.timestamps>;
