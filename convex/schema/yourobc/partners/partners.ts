// convex/schema/yourobc/partners/partners.ts
// Table definitions for partners module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  partnerServiceTypeValidator,
  currencyValidator,
  addressSchema,
  contactSchema,
  serviceCoverageSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '@/schema/base';
import { partnersValidators } from './validators';

export const partnersTable = defineTable({
  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Partner Identity
  shortName: v.optional(v.string()),
  partnerCode: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  quotingEmail: v.optional(v.string()),

  // Address & Coverage
  address: addressSchema,
  serviceCoverage: serviceCoverageSchema,

  // Service Configuration
  serviceType: partnerServiceTypeValidator,
  preferredCurrency: currencyValidator,
  paymentTerms: v.number(),

  // Ranking & Quality
  ranking: v.optional(v.number()),
  rankingNotes: v.optional(v.string()),

  // Internal Notes
  internalPaymentNotes: v.optional(v.string()),

  // Service Capabilities
  serviceCapabilities: v.optional(v.object({
    handlesCustoms: v.optional(v.boolean()),
    handlesPickup: v.optional(v.boolean()),
    handlesDelivery: v.optional(v.boolean()),
    handlesNFO: v.optional(v.boolean()),
    handlesTrucking: v.optional(v.boolean()),
  })),

  // Commission & Payment
  commissionRate: v.optional(v.number()),

  // API Integration
  apiEnabled: v.optional(v.boolean()),
  apiKey: v.optional(v.string()),
  apiEndpoint: v.optional(v.string()),

  // Status
  status: partnersValidators.status,

  // Notes
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_companyName', ['companyName'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_serviceType', ['serviceType'])
  .index('by_countries', ['serviceCoverage.countries'])
  .index('by_owner_and_status', ['ownerId', 'status']);
