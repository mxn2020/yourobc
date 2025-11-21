// convex/schema/yourobc/customers/validators.ts
// Grouped validators for customers module

import { v } from 'convex/values';

export const customersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('blacklisted')
  ),

} as const;

export const customersFields = {
  customerStats: v.object({
  totalQuotes: v.number(),
  acceptedQuotes: v.number(),
  totalRevenue: v.number(),
  lastQuoteDate: v.optional(v.number()),
  lastShipmentDate: v.optional(v.number()),
}),

};

