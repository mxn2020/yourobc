// convex/schema/software/yourobc/quotes/quotes.ts
/**
 * Quote Table Definition
 *
 * Defines the database table for quote management in the YouROBC system.
 * Tracks customer quotes with pricing, routing, and fulfillment details.
 *
 * @module convex/schema/software/yourobc/quotes/quotes
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { quotesValidators } from './validators'

// ============================================================================
// Quotes Table
// ============================================================================

/**
 * Quote management table
 * Tracks customer quotes with pricing, routing, and fulfillment details
 */
export const quotesTable = defineTable({
  // ============================================================================
  // Required Standard Fields
  // ============================================================================

  // Main display field
  quoteNumber: v.string(),

  // Core identification fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // ============================================================================
  // Identification
  // ============================================================================

  customerReference: v.optional(v.string()),

  // ============================================================================
  // Service Details
  // ============================================================================

  serviceType: quotesValidators.serviceType,
  priority: quotesValidators.priority,

  // ============================================================================
  // Customer & Classification
  // ============================================================================

  customerId: v.id('yourobcCustomers'),
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),

  // ============================================================================
  // Routing & Logistics
  // ============================================================================

  origin: quotesValidators.address,
  destination: quotesValidators.address,
  dimensions: quotesValidators.dimensions,
  description: v.string(),
  specialInstructions: v.optional(v.string()),

  // ============================================================================
  // Timeline
  // ============================================================================

  deadline: v.number(),
  validUntil: v.number(),
  sentAt: v.optional(v.number()),

  // ============================================================================
  // Pricing
  // ============================================================================

  baseCost: v.optional(quotesValidators.currencyAmount),
  markup: v.optional(v.number()),
  totalPrice: v.optional(quotesValidators.currencyAmount),

  // ============================================================================
  // Partner Quotes
  // ============================================================================

  partnerQuotes: v.optional(v.array(quotesValidators.partnerQuote)),
  selectedPartnerQuote: v.optional(v.id('yourobcPartners')),

  // ============================================================================
  // Flight Details (if applicable)
  // ============================================================================

  flightDetails: v.optional(quotesValidators.flightDetails),

  // ============================================================================
  // NFO-specific fields
  // ============================================================================

  shipmentType: v.optional(quotesValidators.shipmentType),
  incoterms: v.optional(v.string()),

  // ============================================================================
  // Airline rules applied (for OBC courier calculation)
  // ============================================================================

  appliedAirlineRules: v.optional(quotesValidators.airlineRules),

  // ============================================================================
  // Assignment
  // ============================================================================

  assignedCourierId: v.optional(v.id('yourobcCouriers')),
  employeeId: v.optional(v.id('yourobcEmployees')),

  // ============================================================================
  // Status & Conversion
  // ============================================================================

  status: quotesValidators.status,
  convertedToShipmentId: v.optional(v.id('yourobcShipments')),
  rejectionReason: v.optional(v.string()),

  // ============================================================================
  // Notes & Communication
  // ============================================================================

  quoteText: v.optional(v.string()),
  notes: v.optional(v.string()),

  // ============================================================================
  // Metadata
  // ============================================================================

  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),

  // ============================================================================
  // Audit Fields
  // ============================================================================

  createdBy: v.string(), // authUserId
  createdAt: v.number(),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),

  // ============================================================================
  // Soft Delete Fields
  // ============================================================================

  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
})
  // ============================================================================
  // Required Indexes
  // ============================================================================
  .index('by_public_id', ['publicId'])
  .index('by_quoteNumber', ['quoteNumber'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // ============================================================================
  // Module-specific Indexes
  // ============================================================================
  .index('by_customer', ['customerId'])
  .index('by_serviceType', ['serviceType'])
  .index('by_status', ['status'])
  .index('by_deadline', ['deadline'])
  .index('by_validUntil', ['validUntil'])
  .index('by_assignedCourier', ['assignedCourierId'])
  .index('by_employee', ['employeeId'])
  .index('by_created', ['createdAt'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_customer_and_status', ['customerId', 'status'])
