// convex/schema/yourobc/partners.ts
/**
 * YourOBC Partner Schema
 *
 * Defines schemas for partner/carrier management including service coverage
 * and service type configuration.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/partners
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  partnerStatusValidator,
  partnerServiceTypeValidator,
  currencyValidator,
  addressSchema,
  contactSchema,
  serviceCoverageSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Partners Table
// ============================================================================

/**
 * Partner management table
 * Tracks logistics partners and carriers with service coverage details
 */
export const partnersTable = defineTable({
  // Core Identity
  companyName: v.string(),
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

  // Ranking & Quality (for internal decision-making)
  ranking: v.optional(v.number()), // 1-5 stars
  rankingNotes: v.optional(v.string()),

  // Internal Decision Help
  internalPaymentNotes: v.optional(v.string()),

  // Service Capabilities (what the partner can handle)
  serviceCapabilities: v.optional(v.object({
    handlesCustoms: v.optional(v.boolean()),
    handlesPickup: v.optional(v.boolean()),
    handlesDelivery: v.optional(v.boolean()),
    handlesNFO: v.optional(v.boolean()),
    handlesTrucking: v.optional(v.boolean()),
  })),

  // Status
  status: partnerStatusValidator,

  // Notes
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_companyName', ['companyName'])
  .index('by_status', ['status'])
  .index('by_serviceType', ['serviceType'])
  .index('by_countries', ['serviceCoverage.countries'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])