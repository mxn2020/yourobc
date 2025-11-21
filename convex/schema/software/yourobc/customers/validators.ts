// convex/schema/software/yourobc/customers/validators.ts
// Grouped validators for customers module

import { v } from 'convex/values';

export const customersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('blacklisted')
  ),

  currency: v.union(
    v.literal('EUR'),
    v.literal('USD')
  ),

  paymentMethod: v.union(
    v.literal('bank_transfer'),
    v.literal('credit_card'),
    v.literal('cash'),
    v.literal('check'),
    v.literal('paypal'),
    v.literal('wire_transfer'),
    v.literal('other')
  ),
} as const;
