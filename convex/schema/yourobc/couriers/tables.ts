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
import { baseFields, baseValidators } from '@/schema/base.validators';

/**
* Couriers table
* Stores information about courier companies used for shipments
* Includes service capabilities, contact info, API integration, and performance metrics
*/
export const couriersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Denormalized search field (ONLY if a searchIndex exists)
  searchableText: v.string(),

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
  // Full-text search indexes
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt', 'isActive'],
  })

  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_is_active', ['isActive'])
  .index('by_is_preferred', ['isPreferred'])
  .index('by_created_at', ['createdAt']);


/**
* Commissions table
* Tracks courier payments for shipments based on performance
*/
export const commissionsTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field (date-based for commissions)
  displayDate: v.number(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Commission Target
  courierId: v.id('yourobcCouriers'),
  shipmentId: v.id('yourobcShipments'),

  // Commission Type & Calculation
  type: couriersValidators.commissionType,
  rate: v.number(), // Percentage (e.g., 15 for 15%) or fixed amount
  baseAmount: v.number(), // Amount commission is calculated from (e.g., shipment revenue)
  commissionAmount: v.number(), // Final calculated commission amount

  // Currency support
  currency: v.optional(baseValidators.currency),

  // Payment Status & Tracking
  status: couriersValidators.commissionSimpleStatus,
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()), // Bank transfer reference, check number, etc.
  paymentMethod: v.optional(baseValidators.paymentMethod),

  // Approval
  approvedBy: v.optional(v.string()), // authUserId of approver
  approvedDate: v.optional(v.number()),
  notes: v.optional(v.string()),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_display_date', ['displayDate'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_courier', ['courierId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_status', ['status'])
  .index('by_paidDate', ['paidDate'])
  .index('by_courier_status', ['courierId', 'status']) // For courier commission dashboard
  .index('by_created', ['createdAt']);
