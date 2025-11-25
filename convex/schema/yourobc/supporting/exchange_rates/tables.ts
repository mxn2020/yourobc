// convex/schema/yourobc/supporting/exchange_rates/exchange_rates.ts
// Table definitions for exchange rates module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { exchangeRatesValidators } from './validators';

/**
 * Exchange rates table
 * Tracks daily exchange rates for currency conversion
 */
export const exchangeRatesTable = defineTable({
  // Core fields
  fromCurrency: exchangeRatesValidators.currency,
  toCurrency: exchangeRatesValidators.currency,
  rate: v.number(),
  date: v.number(),
  source: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  // Standard required indexes
  .index('by_currency_pair', ['fromCurrency', 'toCurrency'])
  .index('by_date', ['date'])
  .index('by_active', ['isActive'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
