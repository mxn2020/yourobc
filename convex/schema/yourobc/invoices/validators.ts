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
