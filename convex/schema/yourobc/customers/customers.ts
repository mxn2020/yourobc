// convex/schema/yourobc/customers/customers.ts
// Table definitions for customers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressSchema,
  contactSchema,
  entityStatsSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import { customersValidators } from './validators';

export const customersTable = defineTable({
  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - following yourobc pattern

  // Core Identity
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  additionalContacts: v.array(contactSchema),

  // Address Information
  billingAddress: addressSchema,
  shippingAddress: v.optional(addressSchema),

  // Financial Settings
  defaultCurrency: customersValidators.currency,
  paymentTerms: v.number(),
  paymentMethod: customersValidators.paymentMethod,
  margin: v.number(),

  // Status & Classification
  status: customersValidators.status,
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
  .index('by_country', ['billingAddress.country'])
  .index('by_inquirySource', ['inquirySourceId'])
  .index('by_created', ['createdAt']);
