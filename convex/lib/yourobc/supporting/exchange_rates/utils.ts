// convex/lib/yourobc/supporting/exchange_rates/utils.ts
// Validation + helpers for exchange rates module

import { EXCHANGE_RATES_CONSTANTS } from './constants';
import type { CreateExchangeRateData, UpdateExchangeRateData } from './types';

/**
 * Trim all string fields in exchange rate data
 * Generic typing ensures type safety without `any`
 */
export function trimExchangeRateData<
  T extends Partial<CreateExchangeRateData | UpdateExchangeRateData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.source === "string") {
    trimmed.source = trimmed.source.trim() as T["source"];
  }

  return trimmed;
}

/**
 * Validate exchange rate data
 * Returns array of error messages
 */
export function validateExchangeRateData(
  data: Partial<CreateExchangeRateData | UpdateExchangeRateData>
): string[] {
  const errors: string[] = [];

  // Validate rate
  if (data.rate !== undefined) {
    if (typeof data.rate !== "number") {
      errors.push("Rate must be a number");
    } else {
      if (data.rate <= 0) {
        errors.push("Exchange rate must be positive");
      }

      if (data.rate > EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_RATE) {
        errors.push(
          `Exchange rate cannot exceed ${EXCHANGE_RATES_CONSTANTS.LIMITS.MAX_RATE}`
        );
      }

      if (data.rate < EXCHANGE_RATES_CONSTANTS.LIMITS.MIN_RATE) {
        errors.push(
          `Exchange rate cannot be less than ${EXCHANGE_RATES_CONSTANTS.LIMITS.MIN_RATE}`
        );
      }
    }
  }

  // Validate currency pair (only on create when both are present)
  if ('fromCurrency' in data && 'toCurrency' in data && data.fromCurrency && data.toCurrency) {
    if (data.fromCurrency === data.toCurrency) {
      errors.push("From and to currencies must be different");
    }
  }

  // Validate source
  if (data.source !== undefined && typeof data.source !== "string") {
    errors.push("Source must be a string");
  }

  return errors;
}

/**
 * Calculate currency conversion
 */
export function calculateConversion(
  amount: number,
  rate: number,
  reverse = false,
): number {
  return reverse ? amount / rate : amount * rate;
}
