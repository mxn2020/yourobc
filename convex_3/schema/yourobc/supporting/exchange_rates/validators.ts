// convex/schema/yourobc/supporting/exchange_rates/validators.ts
// Grouped validators for exchange rates module

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Simple union validators for exchange rates
 * Used for status fields, enums, and simple type constraints
 */
export const exchangeRatesValidators = {
  currency: baseValidators.currency,
} as const;
