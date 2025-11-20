// convex/schema/software/yourobc/quotes/quotes.ts
// Table definitions for quotes module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  addressSchema,
  dimensionsSchema,
  currencyAmountSchema,
  flightDetailsSchema,
  partnerQuoteSchema,
  airlineRulesSchema,
  shipmentTypeValidator,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from '@/schema/yourobc/base';
import { quotesValidators } from './validators';

export const quotesTable = defineTable({
  // Required: Main display field
  quoteNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - following yourobc pattern

  // Identification
  customerReference: v.optional(v.string()),

  // Service Details
  serviceType: quotesValidators.serviceType,
  priority: quotesValidators.priority,

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
  status: quotesValidators.status,
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
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_quoteNumber', ['quoteNumber'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer', ['customerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_deadline', ['deadline'])
  .index('by_validUntil', ['validUntil'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_created', ['createdAt']);
