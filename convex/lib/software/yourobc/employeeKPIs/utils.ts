// convex/lib/software/yourobc/employeeKPIs/utils.ts
// Validation functions and utility helpers for employeeKPIs module

import { EMPLOYEE_KPIS_CONSTANTS } from './constants';
import type { CreateEmployeeKPIData, UpdateEmployeeKPIData } from './types';

/**
 * Validate employee KPI data for creation/update
 */
export function validateEmployeeKPIData(
  data: Partial<CreateEmployeeKPIData | UpdateEmployeeKPIData>
): string[] {
  const errors: string[] = [];

  // Validate KPI name (main display field)
  if (data.kpiName !== undefined) {
    const trimmed = data.kpiName.trim();

    if (!trimmed) {
      errors.push('KPI name is required');
    } else if (trimmed.length < EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_KPI_NAME_LENGTH) {
      errors.push(`KPI name must be at least ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_KPI_NAME_LENGTH} characters`);
    } else if (trimmed.length > EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_KPI_NAME_LENGTH) {
      errors.push(`KPI name cannot exceed ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_KPI_NAME_LENGTH} characters`);
    } else if (!EMPLOYEE_KPIS_CONSTANTS.VALIDATION.KPI_NAME_PATTERN.test(trimmed)) {
      errors.push('KPI name contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate target value
  if ('targetValue' in data && data.targetValue !== undefined) {
    if (data.targetValue < EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_TARGET_VALUE) {
      errors.push(`Target value must be at least ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_TARGET_VALUE}`);
    }
  }

  // Validate current value
  if ('currentValue' in data && data.currentValue !== undefined) {
    if (data.currentValue < EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_CURRENT_VALUE) {
      errors.push(`Current value must be at least ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MIN_CURRENT_VALUE}`);
    }
  }

  // Validate historical data
  if ('historicalData' in data && data.historicalData) {
    if (data.historicalData.length > EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_HISTORICAL_DATA_ENTRIES) {
      errors.push(`Historical data cannot exceed ${EMPLOYEE_KPIS_CONSTANTS.LIMITS.MAX_HISTORICAL_DATA_ENTRIES} entries`);
    }
  }

  return errors;
}

/**
 * Calculate achievement percentage
 */
export function calculateAchievementPercentage(currentValue: number, targetValue: number): number {
  if (targetValue === 0) return 0;
  return Math.round((currentValue / targetValue) * 100);
}

/**
 * Calculate change percentage from previous period
 */
export function calculateChangePercentage(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

/**
 * Determine KPI status based on achievement and thresholds
 */
export function determineKPIStatus(
  achievementPercentage: number,
  warningThreshold: number = EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_WARNING_THRESHOLD,
  criticalThreshold: number = EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_CRITICAL_THRESHOLD
): 'on_track' | 'at_risk' | 'behind' | 'achieved' {
  if (achievementPercentage >= 100) return 'achieved';
  if (achievementPercentage >= warningThreshold) return 'on_track';
  if (achievementPercentage >= criticalThreshold) return 'at_risk';
  return 'behind';
}

/**
 * Format KPI display name
 */
export function formatKPIDisplayName(kpi: { kpiName: string; status?: string }): string {
  const statusBadge = kpi.status ? ` [${kpi.status}]` : '';
  return `${kpi.kpiName}${statusBadge}`;
}

/**
 * Check if KPI is editable
 */
export function isKPIEditable(kpi: { status: string; deletedAt?: number }): boolean {
  if (kpi.deletedAt) return false;
  return kpi.status !== 'achieved';
}
