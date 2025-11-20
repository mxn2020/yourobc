// convex/schema/yourobc/quotes.ts
/**
 * YourOBC Quote Schema
 *
 * Defines schemas for quote management including partner quotes and quote tracking.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/quotes
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  quoteStatusValidator,
  quoteServiceTypeValidator,
  servicePriorityValidator,
  dimensionsSchema,
  currencyAmountSchema,
  addressSchema,
  flightDetailsSchema,
  partnerQuoteSchema,
  airlineRulesSchema,
  shipmentTypeValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Quotes Table
// ============================================================================

/**
 * Quote management table
 * Tracks customer quotes with pricing, routing, and fulfillment details
 */
export const quotesTable = defineTable({
  // Identification
  quoteNumber: v.string(),
  customerReference: v.optional(v.string()),

  // Service Details
  serviceType: quoteServiceTypeValidator,
  priority: servicePriorityValidator,

  // Customer & Classification
  customerId: v.id('yourobcCustomers'),
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),

  // Routing & Logistics
  origin: addressSchema,
  destination: addressSchema,
  dimensions: dimensionsSchema,
  description: v.string(),
  specialInstructions: v.optional(v.string()),

  // Timeline
  deadline: v.number(),
  validUntil: v.number(),
  sentAt: v.optional(v.number()),

  // Pricing
  baseCost: v.optional(currencyAmountSchema),
  markup: v.optional(v.number()),
  totalPrice: v.optional(currencyAmountSchema),

  // Partner Quotes
  partnerQuotes: v.optional(v.array(partnerQuoteSchema)),
  selectedPartnerQuote: v.optional(v.id('yourobcPartners')),

  // Flight Details (if applicable)
  flightDetails: v.optional(flightDetailsSchema),

  // NFO-specific fields
  shipmentType: v.optional(shipmentTypeValidator),
  incoterms: v.optional(v.string()),

  // Airline rules applied (for OBC courier calculation)
  appliedAirlineRules: v.optional(airlineRulesSchema),

  // Assignment
  assignedCourierId: v.optional(v.id('yourobcCouriers')),
  employeeId: v.optional(v.id('yourobcEmployees')), // Employee tracking for KPIs

  // Status & Conversion
  status: quoteStatusValidator,
  convertedToShipmentId: v.optional(v.id('yourobcShipments')),
  rejectionReason: v.optional(v.string()),

  // Notes & Communication
  quoteText: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_quoteNumber', ['quoteNumber'])
  .index('by_customer', ['customerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_deadline', ['deadline'])
  .index('by_validUntil', ['validUntil'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])