// convex/schema/yourobc/shipments.ts
/**
 * YourOBC Shipment Schema
 *
 * Defines schemas for shipment management including logistics, tracking,
 * documentation, and status history.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/shipments
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  shipmentStatusValidator,
  quoteServiceTypeValidator,
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
} from './base'

// ============================================================================
// Shipments Table
// ============================================================================

/**
 * Shipment management table
 * Tracks shipments including routing, documentation, and delivery details
 */
export const shipmentsTable = defineTable({
  // Identification
  shipmentNumber: v.string(),
  awbNumber: v.optional(v.string()),
  customerReference: v.optional(v.string()),

  // Service & Classification
  serviceType: quoteServiceTypeValidator,
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
  currentStatus: shipmentStatusValidator,
  sla: slaSchema,
  nextTask: v.optional(nextTaskSchema),

  // Assignment
  assignedCourierId: v.optional(v.id('yourobcCouriers')),
  courierInstructions: v.optional(v.string()),
  employeeId: v.optional(v.id('yourobcEmployees')), // Employee tracking for KPIs

  // Partner Details
  partnerId: v.optional(v.id('yourobcPartners')),
  partnerReference: v.optional(v.string()),
  routing: v.optional(routingSchema),

  // Pricing
  agreedPrice: currencyAmountSchema,
  actualCosts: v.optional(currencyAmountSchema),
  totalPrice: v.optional(currencyAmountSchema), // Total price for revenue tracking
  purchasePrice: v.optional(currencyAmountSchema), // Cost from partner/vendor
  commission: v.optional(currencyAmountSchema), // Employee commission

  // Documentation & Customs
  documentStatus: v.optional(documentStatusSchema),
  customsInfo: v.optional(customsInfoSchema),

  // Timeline & Tracking
  pickupTime: v.optional(scheduledTimeSchema),
  deliveryTime: v.optional(scheduledTimeSchema),

  // Communication
  communicationChannel: v.optional(v.object({
    type: communicationChannelValidator,
    identifier: v.optional(v.string()), // email subject, WhatsApp group name, etc.
  })),

  // Lifecycle
  completedAt: v.optional(v.number()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_shipmentNumber', ['shipmentNumber'])
  .index('by_customer', ['customerId'])
  .index('by_status', ['currentStatus'])
  .index('by_sla_deadline', ['sla.deadline'])
  .index('by_sla_status', ['sla.status'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_partner', ['partnerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Shipment Status History Table
// ============================================================================

/**
 * Shipment status history table
 * Tracks all status changes and events during shipment lifecycle
 */
export const shipmentStatusHistoryTable = defineTable({
  shipmentId: v.id('yourobcShipments'),
  status: shipmentStatusValidator,
  timestamp: v.number(),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Event-specific metadata
  metadata: v.optional(v.object({
    flightNumber: v.optional(v.string()),
    estimatedArrival: v.optional(v.number()),
    delayReason: v.optional(v.string()),
    podReceived: v.optional(v.boolean()),
    customerSignature: v.optional(v.string()),
    courierAssigned: v.optional(v.id('yourobcCouriers')),
    courierNumber: v.optional(v.string()),
    oldDeadline: v.optional(v.number()),
    newDeadline: v.optional(v.number()),
    reason: v.optional(v.string()),
    actualCosts: v.optional(currencyAmountSchema),
    costNotes: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
  })),

  // Audit fields (history entries are immutable, so only creation tracking)
  createdBy: v.string(),
  createdAt: v.number(),
})
  .index('by_shipment', ['shipmentId'])
  .index('by_timestamp', ['timestamp'])
  .index('by_shipment_timestamp', ['shipmentId', 'timestamp'])