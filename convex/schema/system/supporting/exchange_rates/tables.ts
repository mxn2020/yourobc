// convex/schema/system/supporting/exchange_rates/tables.ts
// Table definitions for exchange_rates

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { exchangeRatesValidators } from './validators';

export const exchangeRatesTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Currency pair
  fromCurrency: exchangeRatesValidators.currency,
  toCurrency: exchangeRatesValidators.currency,

  // Rate information
  rate: v.number(),
  inverseRate: v.number(),

  // Validity period
  validFrom: v.number(),
  validTo: v.optional(v.number()),

  // Source information
  source: v.optional(v.string()),
  isAutomatic: v.optional(v.boolean()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_currency_pair', ['fromCurrency', 'toCurrency'])
  .index('by_valid_from', ['validFrom'])
  .index('by_created_at', ['createdAt']);
