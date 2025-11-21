// convex/lib/system/system/systemMetrics/utils.ts
// Validation functions and utility helpers for systemMetrics module

import { SYSTEM_METRICS_CONSTANTS } from './constants';

export function validateSystemMetricData(data: any): string[] {
  const errors: string[] = [];

  if (data.metricType !== undefined) {
    const trimmed = data.metricType.trim();
    if (!trimmed) {
      errors.push('MetricType is required');
    } else if (trimmed.length < SYSTEM_METRICS_CONSTANTS.LIMITS.MIN_METRICTYPE_LENGTH) {
      errors.push(`MetricType must be at least ${SYSTEM_METRICS_CONSTANTS.LIMITS.MIN_METRICTYPE_LENGTH} characters`);
    } else if (trimmed.length > SYSTEM_METRICS_CONSTANTS.LIMITS.MAX_METRICTYPE_LENGTH) {
      errors.push(`MetricType cannot exceed ${SYSTEM_METRICS_CONSTANTS.LIMITS.MAX_METRICTYPE_LENGTH} characters`);
    }
  }

  return errors;
}
