// convex/lib/yourobc/supporting/exchange_rates/types.ts
// TypeScript type definitions for exchange rates module

import type { Doc, Id } from '@/generated/dataModel';
import type { ExchangeRateCurrency } from '@/schema/yourobc/supporting/exchange_rates/types';

// Entity types
export type ExchangeRate = Doc<'yourobcExchangeRates'>;
export type ExchangeRateId = Id<'yourobcExchangeRates'>;

// Create operation
export interface CreateExchangeRateData {
  fromCurrency: ExchangeRateCurrency;
  toCurrency: ExchangeRateCurrency;
  rate: number;
  date: number;
  source?: string;
  isActive?: boolean;
}

// Update operation
export interface UpdateExchangeRateData {
  rate?: number;
  source?: string;
  isActive?: boolean;
}

// List response
export interface ExchangeRateListResponse {
  items: ExchangeRate[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface ExchangeRateFilters {
  fromCurrency?: ExchangeRateCurrency;
  toCurrency?: ExchangeRateCurrency;
  isActive?: boolean;
  dateFrom?: number;
  dateTo?: number;
}
