// convex/lib/system/supporting/exchange_rates/utils.ts
// Validation and helper utilities for system exchange rates

import { SYSTEM_EXCHANGE_RATES_CONSTANTS } from './constants';
import type {
  CreateSystemExchangeRateData,
  UpdateSystemExchangeRateData,
  SystemExchangeRate,
} from './types';

/**
 * Trim string fields on exchange rate data
 */
export function trimSystemExchangeRateData<
  T extends Partial<CreateSystemExchangeRateData | UpdateSystemExchangeRateData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as T['name'];
  }

  if (typeof trimmed.source === 'string') {
    trimmed.source = trimmed.source.trim() as T['source'];
  }

  return trimmed;
}

/**
 * Validate exchange rate payloads
 */
export function validateSystemExchangeRateData(
  data: Partial<CreateSystemExchangeRateData | UpdateSystemExchangeRateData>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined && (!data.name.trim() || data.name.length > SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_NAME_LENGTH)) {
    errors.push('Name must be provided and under length limits');
  }

  if (data.rate !== undefined) {
    if (typeof data.rate !== 'number' || Number.isNaN(data.rate)) {
      errors.push('Rate must be a number');
    } else {
      if (data.rate <= 0) {
        errors.push('Rate must be positive');
      }
      if (data.rate < SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MIN_RATE) {
        errors.push(`Rate must be >= ${SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MIN_RATE}`);
      }
      if (data.rate > SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_RATE) {
        errors.push(`Rate must be <= ${SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_RATE}`);
      }
    }
  }

  if (data.inverseRate !== undefined) {
    if (typeof data.inverseRate !== 'number' || data.inverseRate <= 0) {
      errors.push('Inverse rate must be positive');
    }
  }

  if (data.fromCurrency && data.toCurrency && data.fromCurrency === data.toCurrency) {
    errors.push('From and to currencies must be different');
  }

  if (data.validFrom !== undefined && data.validTo !== undefined && data.validTo < data.validFrom) {
    errors.push('validTo cannot be earlier than validFrom');
  }

  if (data.source !== undefined && data.source.length > SYSTEM_EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_SOURCE_LENGTH) {
    errors.push('Source exceeds maximum length');
  }

  return errors;
}

/**
 * Derive an inverse rate if not provided
 */
export function deriveInverseRate(rate: number, inverseRate?: number): number {
  if (inverseRate !== undefined && inverseRate > 0) {
    return inverseRate;
  }
  return 1 / rate;
}

/**
 * Check whether a rate is active at a given timestamp
 */
export function isExchangeRateActive(rate: SystemExchangeRate, at: number): boolean {
  const startsBefore = rate.validFrom <= at;
  const noEnd = !rate.validTo;
  const endsAfter = !rate.validTo || rate.validTo >= at;
  return startsBefore && endsAfter;
}
