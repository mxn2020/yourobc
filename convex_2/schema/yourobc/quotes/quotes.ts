// convex/schema/yourobc/quotes/quotes.ts
// Table definitions for quotes module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import { quotesValidators, quotesFields } from './validators';
import { baseFields, baseValidators } from '@/schema/base.validators';

export const quotesTable = defineTable({
  // Required: Main display field
  quoteNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - following yourobc pattern

  // Identification
  customerReference: v.optional(v.string()),

  // Service Details
  serviceType: baseValidators.serviceType,
  priority: quotesValidators.priority,

  // Customer & Classification
  customerId: v.id('yourobcCustomers'),
  inquirySourceId: v.optional(v.id('inquirySources')),

  // Routing & Logistics
  origin: baseFields.address,
  destination: baseFields.address,
  dimensions: quotesFields.dimensions,
  description: v.string(),
  specialInstructions: v.optional(v.string()),

  // Timeline
  deadline: v.number(),
  validUntil: v.number(),
  sentAt: v.optional(v.number()),

  // Pricing
  baseCost: v.optional(baseFields.currencyAmount),
  markup: v.optional(v.number()),
  totalPrice: v.optional(baseFields.currencyAmount),

  // Partner Quotes
  partnerQuotes: v.optional(v.array(quotesFields.partnerQuote)),
  selectedPartnerQuote: v.optional(v.id('yourobcPartners')),

  // Flight Details (if applicable)
  flightDetails: v.optional(quotesFields.flightDetails),

  // NFO-specific fields
  shipmentType: v.optional(quotesValidators.shipmentType),
  incoterms: v.optional(v.string()),

  // Airline rules applied (for OBC courier calculation)
  appliedAirlineRules: v.optional(quotesFields.airlineRules),

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

  // Audit fields
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
