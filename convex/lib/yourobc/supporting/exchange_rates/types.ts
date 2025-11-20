// convex/lib/yourobc/supporting/exchange_rates/types.ts
// convex/yourobc/supporting/exchangeRates/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type ExchangeRate = Doc<'yourobcExchangeRates'>;
export type ExchangeRateId = Id<'yourobcExchangeRates'>;

export interface CreateExchangeRateData {
  fromCurrency: 'EUR' | 'USD';
  toCurrency: 'EUR' | 'USD';
  rate: number;
  source?: string;
}

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: 'EUR' | 'USD';
  toCurrency: 'EUR' | 'USD';
  rate: number;
  source: string;
}

