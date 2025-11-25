// convex/schema/base.validators.ts
// Grouped base validators

import { v } from 'convex/values';

/**
 * Simple union base validators
 * Used for status fields, enums, and simple type constraints
 */
export const baseValidators = {
  serviceType: v.union(
    v.literal('OBC'),
    v.literal('NFO')
  ),

  currency: v.union(
    v.literal('EUR'),
    v.literal('USD')
  ),

  contactRole: v.union(
    v.literal('Entscheider'), // Decision maker
    v.literal('Buchhaltung'), // Accounting
    v.literal('Logistik'), // Logistics
    v.literal('Einkauf'), // Purchasing
    v.literal('Geschäftsführung'), // Management
    v.literal('Sonstiges') // Other
  ),

  preferredContactMethod: v.union(
    v.literal('email'),
    v.literal('phone'),
    v.literal('mobile')
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

/**
 * Complex object validators for shipments
 * Used for nested data structures and composed objects
 */
export const baseFields = {
  address: v.object({
    street: v.optional(v.string()),
    city: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    countryCode: v.string(),
  }),

  contact: v.object({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isPrimary: v.boolean(),
    role: v.optional(baseValidators.contactRole),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    mobile: v.optional(v.string()),
    preferredContactMethod: v.optional(baseValidators.preferredContactMethod),
    notes: v.optional(v.string()),
  }),

  currencyAmount: v.object({
    amount: v.number(),
    currency: baseValidators.currency,
    exchangeRate: v.optional(v.number()),
    exchangeRateDate: v.optional(v.number()),
  }),

  // Note: metadata has been removed from baseFields
  // Each module should define its own typed metadata in validators.ts
  // See GUIDE.md "Metadata Pattern" section for details
} as const;
