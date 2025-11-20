// convex/lib/yourobc/supporting/exchange_rates/utils.ts
// convex/yourobc/supporting/exchangeRates/utils.ts
import { EXCHANGE_RATE_CONSTANTS } from './constants';
import type { ExchangeRate, CreateExchangeRateData, ConversionResult } from './types';

export function validateExchangeRateData(data: Partial<CreateExchangeRateData>): string[] {
  const errors: string[] = [];

  if (data.rate !== undefined) {
    if (data.rate < EXCHANGE_RATE_CONSTANTS.LIMITS.MIN_RATE || data.rate > EXCHANGE_RATE_CONSTANTS.LIMITS.MAX_RATE) {
      errors.push(`Rate must be between ${EXCHANGE_RATE_CONSTANTS.LIMITS.MIN_RATE} and ${EXCHANGE_RATE_CONSTANTS.LIMITS.MAX_RATE}`);
    }
  }

  return errors;
}

export function getInverseRate(rate: number): number {
  return Math.round((1 / rate) * 10000) / 10000;
}

