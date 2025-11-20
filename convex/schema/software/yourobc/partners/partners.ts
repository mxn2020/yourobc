// convex/schema/software/yourobc/partners/partners.ts
// Table definitions for partners module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressSchema,
  contactSchema,
  serviceCoverageSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base';
import { partnersValidators } from './validators';

/**
 * YourOBC Partners Table
 * Tracks logistics partners and carriers with service coverage details
 */
export const yourobcPartnersTable = defineTable({
  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId of the user who created this partner

  // Core Identity
  shortName: v.optional(v.string()),
  partnerCode: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  quotingEmail: v.optional(v.string()),

  // Address & Coverage
  address: addressSchema,
  serviceCoverage: serviceCoverageSchema,

  // Service Configuration
  serviceType: partnersValidators.serviceType,
  preferredCurrency: partnersValidators.currency,
  paymentTerms: v.number(), // Number of days

  // Ranking & Quality (for internal decision-making)
  ranking: v.optional(partnersValidators.ranking), // 1-5 stars
  rankingNotes: v.optional(v.string()),

  // Internal Decision Help
  internalPaymentNotes: v.optional(v.string()),

  // Service Capabilities (what the partner can handle)
  serviceCapabilities: v.optional(partnersValidators.serviceCapabilities),

  // Status
  status: partnersValidators.status,

  // Notes
  notes: v.optional(v.string()),

  // Standard metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_company_name', ['companyName'])
  .index('by_owner', ['ownerId'])
  .index('by_status', ['status'])
  .index('by_service_type', ['serviceType'])
  .index('by_countries', ['serviceCoverage.countries'])
  .index('by_ranking', ['ranking'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);
