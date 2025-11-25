// convex/lib/system/supporting/counters/utils.ts
// Helpers and validation for system counters

import { SYSTEM_COUNTERS_CONSTANTS } from './constants';
import type { CreateSystemCounterData, UpdateSystemCounterData } from './types';

export function trimSystemCounterData<
  T extends Partial<CreateSystemCounterData | UpdateSystemCounterData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }
  if (typeof trimmed.prefix === 'string') {
    trimmed.prefix = trimmed.prefix.trim();
  }
  if (typeof trimmed.suffix === 'string') {
    trimmed.suffix = trimmed.suffix.trim();
  }
  if (typeof trimmed.format === 'string') {
    trimmed.format = trimmed.format.trim();
  }

  return trimmed as T;
}

export function validateSystemCounterData(
  data: Partial<CreateSystemCounterData | UpdateSystemCounterData>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined && !data.name.trim()) {
    errors.push('Name is required');
  }

  if (data.currentValue !== undefined && typeof data.currentValue !== 'number') {
    errors.push('currentValue must be a number');
  }

  if (data.step !== undefined && data.step <= 0) {
    errors.push('step must be positive');
  }

  if (data.minValue !== undefined && data.maxValue !== undefined && data.minValue > data.maxValue) {
    errors.push('minValue cannot exceed maxValue');
  }

  if (data.padLength !== undefined && data.padLength < 0) {
    errors.push('padLength must be non-negative');
  }

  return errors;
}

export function formatSystemCounterNumber(
  prefix: string | undefined,
  value: number,
  year?: number,
  padLength: number = SYSTEM_COUNTERS_CONSTANTS.DEFAULTS.PAD_LENGTH,
  suffix?: string
): string {
  const padded = value.toString().padStart(padLength, '0');
  const parts = [prefix, year, padded, suffix].filter((p) => p !== undefined && p !== '');
  return parts.join('-');
}
