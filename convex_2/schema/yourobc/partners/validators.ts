// convex/schema/yourobc/partners/validators.ts
// Grouped validators for partners module

import { v } from 'convex/values';

export const partnersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('archived')
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

  partnerServiceType: v.union(
  v.literal('OBC'),
  v.literal('NFO'),
  v.literal('both')
)
} as const;

export const partnersFields = {
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
    role: v.optional(partnersValidators.contactRole),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    mobile: v.optional(v.string()),
    preferredContactMethod: v.optional(partnersValidators.preferredContactMethod),
  }),

  serviceCoverage: v.object({
    countries: v.array(v.string()),
    cities: v.array(v.string()),
    airports: v.array(v.string()),
  }),

  serviceCapabilities: v.object({
    handlesCustoms: v.optional(v.boolean()),
    handlesPickup: v.optional(v.boolean()),
    handlesDelivery: v.optional(v.boolean()),
    handlesNFO: v.optional(v.boolean()),
    handlesTrucking: v.optional(v.boolean()),
  }),
} as const;
