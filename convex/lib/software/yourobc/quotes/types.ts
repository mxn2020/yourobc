// convex/lib/software/yourobc/quotes/types.ts
/**
 * Quote TypeScript Types
 *
 * TypeScript type definitions for quote entities and operations.
 *
 * @module convex/lib/software/yourobc/quotes/types
 */

import type { Doc, Id } from '@/generated/dataModel'
import type {
  QuoteStatus,
  QuoteServiceType,
  ServicePriority,
  ShipmentType,
  Address,
  Dimensions,
  CurrencyAmount,
  FlightDetails,
  PartnerQuote,
  AirlineRules,
} from '@/schema/software/yourobc/quotes/types'

// ============================================================================
// Entity Types
// ============================================================================

export type Quote = Doc<'yourobcQuotes'>
export type QuoteId = Id<'yourobcQuotes'>

// ============================================================================
// Create Quote Data Interface
// ============================================================================

export interface CreateQuoteData {
  // Required fields
  quoteNumber: string
  serviceType: QuoteServiceType
  priority: ServicePriority
  customerId: Id<'yourobcCustomers'>
  origin: Address
  destination: Address
  dimensions: Dimensions
  description: string
  deadline: number
  validUntil: number
  status?: QuoteStatus

  // Optional fields
  customerReference?: string
  inquirySourceId?: Id<'yourobcInquirySources'>
  specialInstructions?: string
  baseCost?: CurrencyAmount
  markup?: number
  totalPrice?: CurrencyAmount
  partnerQuotes?: PartnerQuote[]
  selectedPartnerQuote?: Id<'yourobcPartners'>
  flightDetails?: FlightDetails
  shipmentType?: ShipmentType
  incoterms?: string
  appliedAirlineRules?: AirlineRules
  assignedCourierId?: Id<'yourobcCouriers'>
  employeeId?: Id<'yourobcEmployees'>
  quoteText?: string
  notes?: string
  tags?: string[]
  category?: string
}

// ============================================================================
// Update Quote Data Interface
// ============================================================================

export interface UpdateQuoteData {
  quoteNumber?: string
  customerReference?: string
  serviceType?: QuoteServiceType
  priority?: ServicePriority
  customerId?: Id<'yourobcCustomers'>
  inquirySourceId?: Id<'yourobcInquirySources'>
  origin?: Address
  destination?: Address
  dimensions?: Dimensions
  description?: string
  specialInstructions?: string
  deadline?: number
  validUntil?: number
  baseCost?: CurrencyAmount
  markup?: number
  totalPrice?: CurrencyAmount
  partnerQuotes?: PartnerQuote[]
  selectedPartnerQuote?: Id<'yourobcPartners'>
  flightDetails?: FlightDetails
  shipmentType?: ShipmentType
  incoterms?: string
  appliedAirlineRules?: AirlineRules
  assignedCourierId?: Id<'yourobcCouriers'>
  employeeId?: Id<'yourobcEmployees'>
  status?: QuoteStatus
  convertedToShipmentId?: Id<'yourobcShipments'>
  rejectionReason?: string
  quoteText?: string
  notes?: string
  tags?: string[]
  category?: string
}

// ============================================================================
// Response Types
// ============================================================================

export interface QuoteWithRelations extends Quote {
  customer?: Doc<'yourobcCustomers'> | null
  inquirySource?: Doc<'yourobcInquirySources'> | null
  assignedCourier?: Doc<'yourobcCouriers'> | null
  employee?: Doc<'yourobcEmployees'> | null
  convertedShipment?: Doc<'yourobcShipments'> | null
}

export interface QuoteListResponse {
  items: Quote[]
  total: number
  hasMore: boolean
}

// ============================================================================
// Filter Types
// ============================================================================

export interface QuoteFilters {
  status?: QuoteStatus[]
  serviceType?: QuoteServiceType[]
  priority?: ServicePriority[]
  customerId?: Id<'yourobcCustomers'>
  employeeId?: Id<'yourobcEmployees'>
  assignedCourierId?: Id<'yourobcCouriers'>
  search?: string
  dateFrom?: number
  dateTo?: number
  validUntilFrom?: number
  validUntilTo?: number
  deadlineFrom?: number
  deadlineTo?: number
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface QuoteStats {
  total: number
  byStatus: Record<QuoteStatus, number>
  byServiceType: Record<QuoteServiceType, number>
  byPriority: Record<ServicePriority, number>
  expiringQuotes: number
  totalValue: number
  averageValue: number
  conversionRate: number
}
