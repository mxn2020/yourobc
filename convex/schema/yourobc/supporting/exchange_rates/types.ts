// convex/schema/yourobc/supporting/exchange_rates/types.ts
// Type definitions for exchange rates module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { exchangeRatesValidators } from './validators';
import { exchangeRatesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type ExchangeRate = Doc<'yourobcExchangeRates'>;
export type ExchangeRateId = Id<'yourobcExchangeRates'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type ExchangeRateSchema = Infer<typeof exchangeRatesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type Currency = Infer<typeof exchangeRatesValidators.currency>;
