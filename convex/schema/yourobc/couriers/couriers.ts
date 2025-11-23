// convex/schema/yourobc/couriers/couriers.ts
// Table definitions for couriers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  currencyValidator,
  auditFields,
  softDeleteFields,
  classificationFields,
  userProfileIdSchema,
} from '@/schema/base';
import { couriersValidators, couriersFields } from './validators';
import { baseFields } from '@/schema/base.validators';

export const couriersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Core Identity
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),

  // Contact Information
  primaryContact: baseFields.contact,
  additionalContacts: v.array(baseFields.contact),

  // Address Information
  headquartersAddress: v.optional(baseFields.address),

  // Service Coverage
  serviceCoverage: couriersFields.serviceCoverage,

  // Service Types & Capabilities
  serviceTypes: v.array(couriersValidators.serviceType),
  deliverySpeeds: v.array(couriersValidators.deliverySpeed),

  // Capacity & Limitations
  maxWeightKg: v.optional(v.number()),
  maxDimensionsCm: v.optional(couriersFields.maxDimensions),
  handlesHazmat: v.optional(v.boolean()),
  handlesRefrigerated: v.optional(v.boolean()),
  handlesFragile: v.optional(v.boolean()),

  // Pricing
  pricingModel: couriersValidators.pricingModel,
  defaultCurrency: currencyValidator,
  costStructure: v.optional(couriersFields.costStructure),

  // Delivery Times
  deliveryTimes: v.optional(couriersFields.deliveryTimes),

  // API Integration
  apiIntegration: v.optional(couriersFields.apiIntegration),

  // API Credentials (encrypted in production)
  apiCredentials: v.optional(couriersFields.apiCredentials),

  // Performance Metrics
  metrics: v.optional(couriersFields.metrics),

  // Status & Settings
  status: couriersValidators.status,
  isPreferred: v.optional(v.boolean()),
  isActive: v.optional(v.boolean()),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Classification
  ...classificationFields,

  // Audit and soft delete fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_isActive', ['isActive'])
  .index('by_isPreferred', ['isPreferred'])
  .index('by_created', ['createdAt']);
