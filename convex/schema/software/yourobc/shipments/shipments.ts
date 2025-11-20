// convex/schema/software/yourobc/shipments/shipments.ts
// Table definition for shipments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  shipmentStatusValidator,
  serviceTypeValidator,
  servicePriorityValidator,
  communicationChannelValidator,
  dimensionsSchema,
  currencyAmountSchema,
  addressSchema,
  slaSchema,
  nextTaskSchema,
  routingSchema,
  documentStatusSchema,
  customsInfoSchema,
  scheduledTimeSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators';

// ============================================================================
// Shipments Table
// ============================================================================

/**
 * Shipments table
 * Tracks shipments including routing, documentation, and delivery details
 */
export const shipmentsTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field
  shipmentNumber: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  currentStatus: shipmentStatusValidator,

  // Identification
  awbNumber: v.optional(v.string()),
  customerReference: v.optional(v.string()),

  // Service & Classification
  serviceType: serviceTypeValidator,
  priority: servicePriorityValidator,

  // Customer & Relationships
  customerId: v.id('yourobcCustomers'),
  quoteId: v.optional(v.id('yourobcQuotes')),

  // Routing & Logistics
  origin: addressSchema,
  destination: addressSchema,
  dimensions: dimensionsSchema,
  description: v.string(),
  specialInstructions: v.optional(v.string()),

  // SLA & Task Management
  sla: slaSchema,
  nextTask: v.optional(nextTaskSchema),

  // Assignment
  assignedCourierId: v.optional(v.id('yourobcCouriers')),
  courierInstructions: v.optional(v.string()),
  employeeId: v.optional(v.id('yourobcEmployees')),

  // Partner Details
  partnerId: v.optional(v.id('yourobcPartners')),
  partnerReference: v.optional(v.string()),
  routing: v.optional(routingSchema),

  // Pricing
  agreedPrice: currencyAmountSchema,
  actualCosts: v.optional(currencyAmountSchema),
  totalPrice: v.optional(currencyAmountSchema),
  purchasePrice: v.optional(currencyAmountSchema),
  commission: v.optional(currencyAmountSchema),

  // Documentation & Customs
  documentStatus: v.optional(documentStatusSchema),
  customsInfo: v.optional(customsInfoSchema),

  // Timeline & Tracking
  pickupTime: v.optional(scheduledTimeSchema),
  deliveryTime: v.optional(scheduledTimeSchema),

  // Communication
  communicationChannel: v.optional(v.object({
    type: communicationChannelValidator,
    identifier: v.optional(v.string()),
  })),

  // Lifecycle
  completedAt: v.optional(v.number()),

  // Standard metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_shipmentNumber', ['shipmentNumber'])
  .index('by_customer', ['customerId'])
  .index('by_status', ['currentStatus'])
  .index('by_sla_deadline', ['sla.deadline'])
  .index('by_sla_status', ['sla.status'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_partner', ['partnerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_created', ['createdAt']);
