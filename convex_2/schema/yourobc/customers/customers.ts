// convex/schema/yourobc/customers/customers.ts
// Table definitions for customers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  classificationFields,
  softDeleteFields,
} from '@/schema/base';
import { customersFields, customersValidators } from './validators';
import { baseFields, baseValidators } from '@/schema/base.validators';

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
  primaryContact: baseFields.contact,
  additionalContacts: v.array(baseFields.contact),

  // Address Information
  billingAddress: baseFields.address,
  shippingAddress: v.optional(baseFields.address),

  // Financial Settings
  defaultCurrency: baseValidators.currency,
  paymentTerms: v.number(),
  paymentMethod: baseValidators.paymentMethod,
  margin: v.number(),

  // Status & Classification
  status: customersValidators.status,
  inquirySourceId: v.optional(v.id('inquirySources')),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()),
  serviceSuspendedDate: v.optional(v.number()),
  serviceSuspendedReason: v.optional(v.string()),
  serviceReactivatedDate: v.optional(v.number()),

  // Statistics
  stats: customersFields.customerStats,

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Classification
  ...classificationFields,

  // Metadata and audit fields
  // Audit fields
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
