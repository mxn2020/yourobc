// convex/schema/yourobc/supporting/exchangeRates.ts
/**
 * Exchange Rates Table Schema
 *
 * Tracks daily exchange rates for currency conversion.
 * Supports historical rates and multi-currency operations.
 *
 * @module convex/schema/yourobc/supporting/exchangeRates
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { supportingValidators, supportingFields } from '../validators'
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';

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
  .index('by_currency_pair', ['fromCurrency', 'toCurrency'])
  .index('by_date', ['date'])
  .index('by_active', ['isActive'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
