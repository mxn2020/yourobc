// convex/lib/system/supporting/exchange_rates/types.ts
// TypeScript definitions for system exchange rates module

import type { Doc, Id } from '@/generated/dataModel';
import type { Currency } from '@/schema/system/supporting/exchange_rates/types';

export type SystemExchangeRate = Doc<'exchangeRates'>;
export type SystemExchangeRateId = Id<'exchangeRates'>;

export interface CreateSystemExchangeRateData {
  name?: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  inverseRate?: number;
  validFrom: number;
  validTo?: number;
  source?: string;
  isAutomatic?: boolean;
}

export interface UpdateSystemExchangeRateData {
  name?: string;
  rate?: number;
  inverseRate?: number;
  validFrom?: number;
  validTo?: number;
  source?: string;
  isAutomatic?: boolean;
}

export interface SystemExchangeRateFilters {
  fromCurrency?: Currency;
  toCurrency?: Currency;
  isAutomatic?: boolean;
  activeAt?: number;
}

export interface SystemExchangeRateListResponse {
  items: SystemExchangeRate[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
