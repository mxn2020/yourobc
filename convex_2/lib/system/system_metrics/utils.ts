// convex/lib/system/system_metrics/utils.ts
// Utility functions for systemMetrics module

import { SYSTEM_METRICS_CONSTANTS } from './constants';

/**
 * Validate metric type
 */
export function isValidMetricType(metricType: string): boolean {
  const validTypes = Object.values(SYSTEM_METRICS_CONSTANTS.METRIC_TYPES);
  return validTypes.includes(metricType as any);
}

/**
 * Validate metric unit
 */
export function isValidUnit(unit: string): boolean {
  const validUnits = Object.values(SYSTEM_METRICS_CONSTANTS.UNITS);
  return validUnits.includes(unit as any);
}

/**
 * Validate metric value
 */
export function validateMetricValue(value: number): { valid: boolean; error?: string } {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Value must be a number' };
  }

  if (!Number.isFinite(value)) {
    return { valid: false, error: 'Value must be finite' };
  }

  return { valid: true };
}

/**
 * Calculate retention cutoff timestamp
 */
export function getRetentionCutoff(): number {
  const retentionMs = SYSTEM_METRICS_CONSTANTS.LIMITS.RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - retentionMs;
}
