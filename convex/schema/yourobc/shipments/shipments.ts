// convex/schema/yourobc/shipments/shipments.ts
// Table definitions for shipments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressSchema,
  contactSchema,
  dimensionsSchema,
  currencyAmountSchema,
  slaSchema,
  nextTaskSchema,
  routingSchema,
  documentStatusSchema,
  customsInfoSchema,
  scheduledTimeSchema,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import { shipmentsValidators } from './validators';

export const shipmentsTable = defineTable({
  // Required: Main display field
  shipmentNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - following yourobc pattern

  // Additional Identification
  awbNumber: v.optional(v.string()),
  customerReference: v.optional(v.string()),

  // Service & Classification
  serviceType: shipmentsValidators.serviceType,
  priority: shipmentsValidators.priority,

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
  currentStatus: shipmentsValidators.status,
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
    type: shipmentsValidators.communicationChannel,
    identifier: v.optional(v.string()), // email subject, WhatsApp group name, etc.
  })),

  // Lifecycle
  completedAt: v.optional(v.number()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_shipmentNumber', ['shipmentNumber'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer', ['customerId'])
  .index('by_status', ['currentStatus'])
  .index('by_sla_deadline', ['sla.deadline'])
  .index('by_sla_status', ['sla.status'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_partner', ['partnerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_created', ['createdAt']);
