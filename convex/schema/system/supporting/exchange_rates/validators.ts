// convex/schema/system/supporting/exchange_rates/validators.ts
// Validators for exchange_rates module

import { v } from 'convex/values';

export const exchangeRatesValidators = {
  currency: v.union(
    v.literal('USD'),
    v.literal('EUR'),
    v.literal('GBP'),
    v.literal('JPY'),
    v.literal('CNY'),
    v.literal('CAD'),
    v.literal('AUD'),
    v.literal('CHF')
  ),
} as const;

export const exchangeRatesFields = {} as const;
