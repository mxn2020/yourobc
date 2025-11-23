// convex/schema/yourobc/shipments/shipments.ts
// Table definitions for shipments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  classificationFields,
  softDeleteFields,
} from '@/schema/base';
import {
  shipmentsValidators,
  shipmentsFields,
} from './validators';
import { baseValidators } from '@/schema/base.validators';

export const shipmentsTable = defineTable({
  // Required: Main display field
  shipmentNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who owns/manages this shipment record

  // Additional Identification
  awbNumber: v.optional(v.string()),
  customerReference: v.optional(v.string()),

  // Service & Classification
  serviceType: baseValidators.serviceType,
  priority: shipmentsValidators.priority,

  // Customer & Relationships
  customerId: v.id('yourobcCustomers'),
  quoteId: v.optional(v.id('yourobcQuotes')),

  // Routing & Logistics
  origin: shipmentsFields.address,
  destination: shipmentsFields.address,
  dimensions: shipmentsFields.dimensions,
  description: v.string(),
  specialInstructions: v.optional(v.string()),

  // SLA & Task Management
  currentStatus: shipmentsValidators.status,
  sla: shipmentsFields.sla,
  nextTask: v.optional(shipmentsFields.nextTask),

  // Assignment
  assignedCourierId: v.optional(v.id('yourobcCouriers')),
  courierInstructions: v.optional(v.string()),
  employeeId: v.optional(v.id('yourobcEmployees')), // Employee tracking for KPIs

  // Partner Details
  partnerId: v.optional(v.id('yourobcPartners')),
  partnerReference: v.optional(v.string()),
  routing: v.optional(shipmentsFields.routing),

  // Pricing
  agreedPrice: shipmentsFields.currencyAmount,
  actualCosts: v.optional(shipmentsFields.currencyAmount),
  totalPrice: v.optional(shipmentsFields.currencyAmount), // Total price for revenue tracking
  purchasePrice: v.optional(shipmentsFields.currencyAmount), // Cost from partner/vendor
  commission: v.optional(shipmentsFields.currencyAmount), // Employee commission

  // Documentation & Customs
  documentStatus: v.optional(shipmentsFields.documentStatusSchema),
  customsInfo: v.optional(shipmentsFields.customsInfo),

  // Timeline & Tracking
  pickupTime: v.optional(shipmentsFields.scheduledTime),
  deliveryTime: v.optional(shipmentsFields.scheduledTime),

  // Communication
  communicationChannel: v.optional(v.object({
    type: shipmentsValidators.communicationChannel,
    identifier: v.optional(v.string()), // email subject, WhatsApp group name, etc.
  })),

  // Lifecycle
  completedAt: v.optional(v.number()),

  // Classification
    ...classificationFields,

  // Metadata and audit fields
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
