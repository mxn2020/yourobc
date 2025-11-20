// convex/lib/boilerplate/autumn/autumn_usage_logs/utils.ts
// Validation functions and utility helpers for autumn usage logs module

import { AUTUMN_USAGE_LOGS_CONSTANTS } from './constants';
import type { CreateAutumnUsageLogData, UpdateAutumnUsageLogData } from './types';

/**
 * Validate autumn usage log data for creation/update
 */
export function validateAutumnUsageLogData(
  data: Partial<CreateAutumnUsageLogData | UpdateAutumnUsageLogData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < AUTUMN_USAGE_LOGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${AUTUMN_USAGE_LOGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > AUTUMN_USAGE_LOGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${AUTUMN_USAGE_LOGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!AUTUMN_USAGE_LOGS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate featureId
  if ('featureId' in data && data.featureId !== undefined) {
    const trimmed = data.featureId.trim();
    if (!trimmed) {
      errors.push('Feature ID is required');
    }
  }

  // Validate value
  if ('value' in data && data.value !== undefined) {
    if (data.value < AUTUMN_USAGE_LOGS_CONSTANTS.VALIDATION.MIN_VALUE) {
      errors.push(`Value must be at least ${AUTUMN_USAGE_LOGS_CONSTANTS.VALIDATION.MIN_VALUE}`);
    }
  }

  // Validate autumnCustomerId
  if ('autumnCustomerId' in data && data.autumnCustomerId !== undefined) {
    const trimmed = data.autumnCustomerId.trim();
    if (!trimmed) {
      errors.push('Autumn customer ID is required');
    }
  }

  return errors;
}

/**
 * Format usage log display name
 */
export function formatUsageLogDisplayName(log: { featureId: string; value: number }): string {
  return `${log.featureId}: ${log.value}`;
}

/**
 * Check if usage log needs sync
 */
export function needsSync(log: { syncedToAutumn: boolean; syncError?: string }): boolean {
  return !log.syncedToAutumn || !!log.syncError;
}

/**
 * Check if usage log is editable
 */
export function isUsageLogEditable(log: { deletedAt?: number; syncedToAutumn: boolean }): boolean {
  if (log.deletedAt) return false;
  // Only allow editing if not yet synced
  return !log.syncedToAutumn;
}

/**
 * Generate usage log name from feature and value
 */
export function generateUsageLogName(featureId: string, value: number): string {
  return `${featureId} - ${value}`;
}
