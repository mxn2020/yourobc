// convex/schema/system/supporting/exchangeRates.ts
/**
 * Exchange Rates Table Schema
 *
 * Tracks daily exchange rates for currency conversion.
 * Supports historical rates and multi-currency operations.
 *
 * @module convex/schema/system/supporting/exchangeRates
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * Exchange rates table
 * Tracks daily exchange rates for currency conversion
 */
export const exchangeRatesTable = defineTable({
  // Required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),

  // Core fields
  fromCurrency: supportingValidators.currency,
  toCurrency: supportingValidators.currency,
  rate: v.number(),
  date: v.number(),
  source: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_currency_pair', ['fromCurrency', 'toCurrency'])
  .index('by_date', ['date'])
  .index('by_active', ['isActive'])
  .index('by_created_at', ['createdAt'])
