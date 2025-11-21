// convex/schema/yourobc/couriers/couriers.ts
// Table definitions for couriers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressSchema,
  contactSchema,
  currencyValidator,
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import { couriersValidators } from './validators';

export const couriersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - following yourobc pattern

  // Core Identity
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),

  // Contact Information
  primaryContact: contactSchema,
  additionalContacts: v.array(contactSchema),

  // Address Information
  headquartersAddress: v.optional(addressSchema),

  // Service Coverage
  serviceCoverage: v.object({
    countries: v.array(v.string()),
    regions: v.optional(v.array(v.string())),
    cities: v.optional(v.array(v.string())),
    airports: v.optional(v.array(v.string())),
  }),

  // Service Types & Capabilities
  serviceTypes: v.array(couriersValidators.serviceType),
  deliverySpeeds: v.array(couriersValidators.deliverySpeed),

  // Capacity & Limitations
  maxWeightKg: v.optional(v.number()),
  maxDimensionsCm: v.optional(v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
  })),
  handlesHazmat: v.optional(v.boolean()),
  handlesRefrigerated: v.optional(v.boolean()),
  handlesFragile: v.optional(v.boolean()),

  // Pricing
  pricingModel: couriersValidators.pricingModel,
  defaultCurrency: currencyValidator,
  costStructure: v.optional(v.object({
    baseFee: v.optional(v.number()),
    perKgRate: v.optional(v.number()),
    perKmRate: v.optional(v.number()),
    fuelSurcharge: v.optional(v.number()),
    handlingFee: v.optional(v.number()),
    notes: v.optional(v.string()),
  })),

  // Delivery Times
  deliveryTimes: v.optional(v.object({
    standardDomestic: v.optional(v.string()), // e.g., "1-3 business days"
    standardInternational: v.optional(v.string()),
    expressDomestic: v.optional(v.string()),
    expressInternational: v.optional(v.string()),
    notes: v.optional(v.string()),
  })),

  // API Integration
  apiIntegration: v.optional(v.object({
    enabled: v.boolean(),
    apiType: couriersValidators.apiType,
    baseUrl: v.optional(v.string()),
    apiVersion: v.optional(v.string()),
    hasTracking: v.optional(v.boolean()),
    hasRateQuotes: v.optional(v.boolean()),
    hasLabelGeneration: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })),

  // API Credentials (encrypted in production)
  apiCredentials: v.optional(v.object({
    apiKey: v.optional(v.string()),
    apiSecret: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    additionalFields: v.optional(v.object({})),
  })),

  // Performance Metrics
  metrics: v.optional(v.object({
    reliabilityScore: v.optional(v.number()), // 0-100
    onTimeDeliveryRate: v.optional(v.number()), // percentage
    averageTransitDays: v.optional(v.number()),
    lastUpdated: v.optional(v.number()),
  })),

  // Status & Settings
  status: couriersValidators.status,
  isPreferred: v.optional(v.boolean()),
  isActive: v.optional(v.boolean()),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),

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
