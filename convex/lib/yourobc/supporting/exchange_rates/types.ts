// convex/lib/yourobc/supporting/exchange_rates/types.ts
// TypeScript type definitions for exchange rates module

import type { Doc, Id } from '@/generated/dataModel';
import type { Currency } from '@/schema/yourobc/supporting/exchange_rates/types';

// Entity types
export type ExchangeRate = Doc<'yourobcExchangeRates'>;
export type ExchangeRateId = Id<'yourobcExchangeRates'>;

// Create operation
export interface CreateExchangeRateData {
  fromCurrency: Currency;
  toCurrency: Currency;
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
  fromCurrency?: Currency;
  toCurrency?: Currency;
  isActive?: boolean;
  dateFrom?: number;
  dateTo?: number;
}
