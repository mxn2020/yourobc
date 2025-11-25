// convex/schema/system/supporting/exchange_rates/types.ts
// Type definitions for exchange_rates module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { exchangeRatesValidators } from './validators';
import { exchangeRatesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type ExchangeRate = Doc<'exchangeRates'>;
export type ExchangeRateId = Id<'exchangeRates'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type ExchangeRateSchema = Infer<typeof exchangeRatesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type Currency = Infer<typeof exchangeRatesValidators.currency>;
