// convex/schema/software/yourobc/customers/validators.ts
// Validators for customers module

import { v } from 'convex/values';

/**
 * Customer status validator
 */
export const customerStatusValidator = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('blacklisted')
);

/**
 * Currency validator
 */
export const currencyValidator = v.union(
  v.literal('EUR'),
  v.literal('USD')
);

/**
 * Payment method validator
 */
export const paymentMethodValidator = v.union(
  v.literal('bank_transfer'),
  v.literal('credit_card'),
  v.literal('cash'),
  v.literal('check'),
  v.literal('paypal'),
  v.literal('wire_transfer'),
  v.literal('other')
);

/**
 * Contact role validator
 */
export const contactRoleValidator = v.union(
  v.literal('Entscheider'), // Decision maker
  v.literal('Buchhaltung'), // Accounting
  v.literal('Logistik'), // Logistics
  v.literal('Einkauf'), // Purchasing
  v.literal('Geschäftsführung'), // Management
  v.literal('Sonstiges') // Other
);

/**
 * Preferred contact method validator
 */
export const preferredContactMethodValidator = v.union(
  v.literal('email'),
  v.literal('phone'),
  v.literal('mobile')
);

/**
 * Contact person schema validator
 */
export const contactSchema = v.object({
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  isPrimary: v.boolean(),
  role: v.optional(contactRoleValidator),
  position: v.optional(v.string()),
  department: v.optional(v.string()),
  mobile: v.optional(v.string()),
  preferredContactMethod: v.optional(preferredContactMethodValidator),
  notes: v.optional(v.string()),
});

/**
 * Address schema validator
 */
export const addressSchema = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
});

/**
 * Entity statistics schema validator
 */
export const entityStatsSchema = v.object({
  totalQuotes: v.number(),
  acceptedQuotes: v.number(),
  totalRevenue: v.number(),
  lastQuoteDate: v.optional(v.number()),
  lastShipmentDate: v.optional(v.number()),
});

/**
 * Metadata schema validator
 */
export const metadataSchema = {
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),
};

/**
 * Audit fields
 */
export const auditFields = {
  createdBy: v.string(),
  createdAt: v.number(),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
};

/**
 * Soft delete fields
 */
export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
};
