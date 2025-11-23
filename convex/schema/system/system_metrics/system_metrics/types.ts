// convex/schema/system/system_metrics/system_metrics/types.ts
// Type extractions from validators for system metrics module

import { Infer } from 'convex/values';
import { systemMetricsFields, systemMetricsValidators } from './validators';

export type SystemMetricType = Infer<typeof systemMetricsValidators.metricType>;
export type SystemMetricUnit = Infer<typeof systemMetricsValidators.unit>;
export type SystemMetricMeasurement = Infer<typeof systemMetricsFields.measurement>;
export type SystemMetricTimestamps = Infer<typeof systemMetricsFields.timestamps>;
