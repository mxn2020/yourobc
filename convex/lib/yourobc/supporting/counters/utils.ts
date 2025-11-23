// convex/lib/yourobc/supporting/counters/utils.ts
// Validation + helpers for counters module

import { COUNTERS_CONSTANTS } from './constants';
import type { CreateCounterData, UpdateCounterData } from './types';

/**
 * Trim all string fields in counter data
 * Generic typing ensures type safety without `any`
 */
export function trimCounterData<
  T extends Partial<CreateCounterData | UpdateCounterData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.prefix === 'string') {
    trimmed.prefix = trimmed.prefix.trim() as T['prefix'];
  }

  return trimmed;
}

/**
 * Validate counter data
 * Returns array of error messages
 */
export function validateCounterData(
  data: Partial<CreateCounterData | UpdateCounterData>
): string[] {
  const errors: string[] = [];

  // Validate prefix (only on create)
  if ('prefix' in data && data.prefix !== undefined) {
    if (typeof data.prefix !== 'string') {
      errors.push('Prefix must be a string');
    } else {
      const prefix = data.prefix.trim();

      if (!prefix) {
        errors.push('Prefix is required');
      }

      if (prefix.length > 50) {
        errors.push('Prefix cannot exceed 50 characters');
      }
    }
  }

  // Validate year
  if (data.year !== undefined) {
    if (typeof data.year !== 'number') {
      errors.push('Year must be a number');
    } else {
      if (data.year < 1900 || data.year > 2100) {
        errors.push('Year must be between 1900 and 2100');
      }
    }
  }

  // Validate lastNumber
  if (data.lastNumber !== undefined) {
    if (typeof data.lastNumber !== 'number') {
      errors.push('Last number must be a number');
    } else {
      if (data.lastNumber < COUNTERS_CONSTANTS.LIMITS.MIN_COUNTER_VALUE) {
        errors.push(
          `Last number cannot be less than ${COUNTERS_CONSTANTS.LIMITS.MIN_COUNTER_VALUE}`
        );
      }

      if (data.lastNumber > COUNTERS_CONSTANTS.LIMITS.MAX_COUNTER_VALUE) {
        errors.push(
          `Last number cannot exceed ${COUNTERS_CONSTANTS.LIMITS.MAX_COUNTER_VALUE}`
        );
      }

      if (!Number.isInteger(data.lastNumber)) {
        errors.push('Last number must be an integer');
      }
    }
  }

  return errors;
}

/**
 * Get next counter value
 */
export function getNextCounterValue(lastNumber: number): number {
  return lastNumber + 1;
}

/**
 * Format counter with prefix
 */
export function formatCounterValue(prefix: string, number: number): string {
  return `${prefix}${number}`;
}
