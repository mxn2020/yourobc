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
  ownerId: v.id('userProfiles'),

  // Denormalized search field (ONLY if a searchIndex exists)
  searchableText: v.string(),

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
  employeeId: v.optional(v.id('yourobcEmployees')),

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
  // Full-text search indexes
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt', 'serviceType'],
  })

  // Standard indexes (required)
  .index('by_public_id', ['publicId'])
  .index('by_quote_number', ['quoteNumber'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer_id', ['customerId'])
  .index('by_service_type', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_owner_and_customer', ['ownerId', 'customerId'])
  .index('by_deadline', ['deadline'])
  .index('by_valid_until', ['validUntil'])
  .index('by_assigned_courier_id', ['assignedCourierId'])
  .index('by_employee_id', ['employeeId'])
  .index('by_created_at', ['createdAt']);
