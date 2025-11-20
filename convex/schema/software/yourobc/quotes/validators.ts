// convex/schema/software/yourobc/quotes/validators.ts
/**
 * Quote Validators
 *
 * Defines Convex validators for quote management in the YouROBC system.
 * These validators ensure data integrity for quote status, service types,
 * priorities, and other quote-specific fields.
 *
 * @module convex/schema/software/yourobc/quotes/validators
 */

import { v } from 'convex/values'

// ============================================================================
// Quote Status Validators
// ============================================================================

/**
 * Quote status validator
 * Tracks the lifecycle of a quote from draft to accepted/rejected/expired
 */
export const quoteStatusValidator = v.union(
  v.literal('draft'),
  v.literal('sent'),
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('rejected'),
  v.literal('expired')
)

/**
 * Quote service type validator
 * Defines the type of service being quoted (OBC courier or NFO freight)
 */
export const quoteServiceTypeValidator = v.union(
  v.literal('OBC'),
  v.literal('NFO')
)

/**
 * Service priority validator
 * Defines the urgency level of the shipment
 */
export const servicePriorityValidator = v.union(
  v.literal('standard'),
  v.literal('urgent'),
  v.literal('critical')
)

/**
 * Shipment type validator (for NFO quotes)
 * Defines the pickup and delivery configuration
 */
export const shipmentTypeValidator = v.union(
  v.literal('door-door'),
  v.literal('door-airport'),
  v.literal('airport-door'),
  v.literal('airport-airport')
)

/**
 * Currency validator
 * Supported currencies for quotes
 */
export const currencyValidator = v.union(
  v.literal('EUR'),
  v.literal('USD')
)

/**
 * Dimension unit validator
 */
export const dimensionUnitValidator = v.union(
  v.literal('cm'),
  v.literal('inch')
)

/**
 * Weight unit validator
 */
export const weightUnitValidator = v.union(
  v.literal('kg'),
  v.literal('lb')
)

// ============================================================================
// Complex Schema Validators
// ============================================================================

/**
 * Address schema validator
 */
export const addressSchemaValidator = v.object({
  street: v.optional(v.string()),
  city: v.string(),
  postalCode: v.optional(v.string()),
  country: v.string(),
  countryCode: v.string(),
})

/**
 * Dimensions schema validator
 */
export const dimensionsSchemaValidator = v.object({
  length: v.number(),
  width: v.number(),
  height: v.number(),
  weight: v.number(),
  unit: dimensionUnitValidator,
  weightUnit: weightUnitValidator,
  chargeableWeight: v.optional(v.number()),
})

/**
 * Currency amount schema validator
 */
export const currencyAmountSchemaValidator = v.object({
  amount: v.number(),
  currency: currencyValidator,
  exchangeRate: v.optional(v.number()),
  exchangeRateDate: v.optional(v.number()),
})

/**
 * Flight details schema validator
 */
export const flightDetailsSchemaValidator = v.object({
  flightNumber: v.optional(v.string()),
  airline: v.optional(v.string()),
  airlineCode: v.optional(v.string()),
  departureTime: v.optional(v.number()),
  arrivalTime: v.optional(v.number()),
  departureAirport: v.optional(v.string()),
  arrivalAirport: v.optional(v.string()),
})

/**
 * Partner quote schema validator
 */
export const partnerQuoteSchemaValidator = v.object({
  partnerId: v.id('yourobcPartners'),
  partnerName: v.string(),
  quotedPrice: currencyAmountSchemaValidator,
  transitTime: v.optional(v.number()),
  validUntil: v.optional(v.number()),
  receivedAt: v.number(),
  notes: v.optional(v.string()),
  isSelected: v.optional(v.boolean()),
})

/**
 * Airline rules schema validator
 */
export const airlineRulesSchemaValidator = v.object({
  airlineCode: v.string(),
  airlineName: v.string(),
  maxBaggageWeight: v.number(),
  maxBaggagePieces: v.number(),
  excessBaggageFee: v.optional(v.number()),
  couriersRequired: v.optional(v.number()),
})

// ============================================================================
// Export Validators
// ============================================================================

export const quotesValidators = {
  status: quoteStatusValidator,
  serviceType: quoteServiceTypeValidator,
  priority: servicePriorityValidator,
  shipmentType: shipmentTypeValidator,
  currency: currencyValidator,
  dimensionUnit: dimensionUnitValidator,
  weightUnit: weightUnitValidator,
  address: addressSchemaValidator,
  dimensions: dimensionsSchemaValidator,
  currencyAmount: currencyAmountSchemaValidator,
  flightDetails: flightDetailsSchemaValidator,
  partnerQuote: partnerQuoteSchemaValidator,
  airlineRules: airlineRulesSchemaValidator,
} as const
