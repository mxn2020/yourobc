// convex/schema/software/yourobc/quotes/types.ts
/**
 * Quote Type Extractions
 *
 * Extracts TypeScript types from quote validators for type-safe usage
 * throughout the application.
 *
 * @module convex/schema/software/yourobc/quotes/types
 */

import { Infer } from 'convex/values'
import {
  quoteStatusValidator,
  quoteServiceTypeValidator,
  servicePriorityValidator,
  shipmentTypeValidator,
  currencyValidator,
  dimensionUnitValidator,
  weightUnitValidator,
  addressSchemaValidator,
  dimensionsSchemaValidator,
  currencyAmountSchemaValidator,
  flightDetailsSchemaValidator,
  partnerQuoteSchemaValidator,
  airlineRulesSchemaValidator,
} from './validators'

// ============================================================================
// Status and Enum Types
// ============================================================================

export type QuoteStatus = Infer<typeof quoteStatusValidator>
export type QuoteServiceType = Infer<typeof quoteServiceTypeValidator>
export type ServicePriority = Infer<typeof servicePriorityValidator>
export type ShipmentType = Infer<typeof shipmentTypeValidator>
export type Currency = Infer<typeof currencyValidator>
export type DimensionUnit = Infer<typeof dimensionUnitValidator>
export type WeightUnit = Infer<typeof weightUnitValidator>

// ============================================================================
// Complex Schema Types
// ============================================================================

export type Address = Infer<typeof addressSchemaValidator>
export type Dimensions = Infer<typeof dimensionsSchemaValidator>
export type CurrencyAmount = Infer<typeof currencyAmountSchemaValidator>
export type FlightDetails = Infer<typeof flightDetailsSchemaValidator>
export type PartnerQuote = Infer<typeof partnerQuoteSchemaValidator>
export type AirlineRules = Infer<typeof airlineRulesSchemaValidator>
