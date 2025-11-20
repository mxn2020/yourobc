// convex/schema/software/yourobc/customers/customers.ts
// Table definition for customers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  customerStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  contactSchema,
  addressSchema,
  entityStatsSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators';

// ============================================================================
// Customers Table
// ============================================================================

/**
 * Customers table
 * Tracks customer information, contact details, and financial settings
 */
export const customersTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: customerStatusValidator,

  // Company Information
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  additionalContacts: v.array(contactSchema),

  // Address Information
  billingAddress: addressSchema,
  shippingAddress: v.optional(addressSchema),

  // Financial Settings
  defaultCurrency: currencyValidator,
  paymentTerms: v.number(),
  paymentMethod: paymentMethodValidator,
  margin: v.number(),

  // Classification
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()),
  serviceSuspendedDate: v.optional(v.number()),
  serviceSuspendedReason: v.optional(v.string()),
  serviceReactivatedDate: v.optional(v.number()),

  // Statistics
  stats: entityStatsSchema,

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Standard metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['companyName'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_country', ['billingAddress.country'])
  .index('by_inquirySource', ['inquirySourceId'])
  .index('by_created', ['createdAt']);
