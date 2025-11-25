// convex/schema/yourobc/invoices/validators.ts
// Grouped validators for invoices module

import { v } from 'convex/values';

export const invoicesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('sent'),
    v.literal('pending_payment'),
    v.literal('paid'),
    v.literal('overdue'),
    v.literal('cancelled')
  ),

  type: v.union(
    v.literal('incoming'),
    v.literal('outgoing')
  ),

  collectionMethod: v.union(
    v.literal('email'),
    v.literal('phone'),
    v.literal('letter'),
    v.literal('legal_notice'),
    v.literal('debt_collection')
  ),

  currency: v.union(
    v.literal('EUR'),
    v.literal('USD')
  ),
} as const;

export const invoicesFields = {
  currencyAmount: v.object({
    amount: v.number(),
    currency: invoicesValidators.currency,
    exchangeRate: v.optional(v.number()),
    exchangeRateDate: v.optional(v.number()),
  }),

  address: v.object({
    street: v.optional(v.string()),
    city: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    countryCode: v.string(),
  }),

  lineItem: v.object({
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.object({
      amount: v.number(),
      currency: invoicesValidators.currency,
      exchangeRate: v.optional(v.number()),
      exchangeRateDate: v.optional(v.number()),
    }),
    totalPrice: v.object({
      amount: v.number(),
      currency: invoicesValidators.currency,
      exchangeRate: v.optional(v.number()),
      exchangeRateDate: v.optional(v.number()),
    }),
  }),

  collectionAttempt: v.object({
    date: v.number(),
    method: invoicesValidators.collectionMethod,
    result: v.string(),
    createdBy: v.string(),
  }),
} as const;
