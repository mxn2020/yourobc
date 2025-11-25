// convex/schema/yourobc/partners/partners.ts
// Table definitions for partners module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import {
  partnersValidators,
  partnersFields,
} from './validators';
import { baseValidators } from '@/schema/base.validators';

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
  primaryContact: partnersFields.contact,
  quotingEmail: v.optional(v.string()),

  // Address & Coverage
  address: partnersFields.address,
  serviceCoverage: partnersFields.serviceCoverage,

  // Service Configuration
  serviceType: partnersValidators.partnerServiceType,
  preferredCurrency: baseValidators.currency,
  paymentTerms: v.number(),

  // Ranking & Quality
  ranking: v.optional(v.number()),
  rankingNotes: v.optional(v.string()),

  // Internal Notes
  internalPaymentNotes: v.optional(v.string()),

  // Service Capabilities
  serviceCapabilities: v.optional(partnersFields.serviceCapabilities),

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

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_company_name', ['companyName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_service_type', ['serviceType'])
  .index('by_owner_and_status', ['ownerId', 'status']);
