// convex/lib/yourobc/quotes/types.ts
// TypeScript type definitions for quotes module

import type { Doc, Id } from '@/generated/dataModel';
import type { QuoteStatus, QuoteServiceType, QuotePriority } from '@/schema/yourobc/quotes/types';

// Entity types
export type Quote = Doc<'yourobcQuotes'>;
export type QuoteId = Id<'yourobcQuotes'>;

// Address interface (matching schema)
export interface AddressData {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

// Dimensions interface (matching schema)
export interface DimensionsData {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
  chargeableWeight?: number;
}

// Currency amount interface (matching schema)
export interface CurrencyAmountData {
  amount: number;
  currency: 'EUR' | 'USD';
  exchangeRate?: number;
  exchangeRateDate?: number;
}

// Flight details interface (matching schema)
export interface FlightDetailsData {
  flightNumber?: string;
  airline?: string;
  airlineCode?: string;
  departureTime?: number;
  arrivalTime?: number;
  departureAirport?: string;
  arrivalAirport?: string;
}

// Partner quote interface (matching schema)
export interface PartnerQuoteData {
  partnerId: Id<'yourobcPartners'>;
  partnerName: string;
  quotedPrice: CurrencyAmountData;
  transitTime?: number;
  validUntil?: number;
  receivedAt: number;
  notes?: string;
  isSelected?: boolean;
}

// Airline rules interface (matching schema)
export interface AirlineRulesData {
  airlineCode: string;
  airlineName: string;
  maxBaggageWeight: number;
  maxBaggagePieces: number;
  excessBaggageFee?: number;
  couriersRequired?: number;
}

// Data interfaces
export interface CreateQuoteData {
  quoteNumber: string;
  customerReference?: string;
  serviceType: QuoteServiceType;
  priority: QuotePriority;
  customerId: Id<'yourobcCustomers'>;
  inquirySourceId?: Id<'inquirySources'>;
  origin: AddressData;
  destination: AddressData;
  dimensions: DimensionsData;
  description: string;
  specialInstructions?: string;
  deadline: number;
  validUntil: number;
  baseCost?: CurrencyAmountData;
  markup?: number;
  totalPrice?: CurrencyAmountData;
  partnerQuotes?: PartnerQuoteData[];
  selectedPartnerQuote?: Id<'yourobcPartners'>;
  flightDetails?: FlightDetailsData;
  shipmentType?: 'door-door' | 'door-airport' | 'airport-door' | 'airport-airport';
  incoterms?: string;
  appliedAirlineRules?: AirlineRulesData;
  assignedCourierId?: Id<'yourobcCouriers'>;
  employeeId?: Id<'yourobcEmployees'>;
  status?: QuoteStatus;
  quoteText?: string;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateQuoteData {
  customerReference?: string;
  serviceType?: QuoteServiceType;
  priority?: QuotePriority;
  inquirySourceId?: Id<'inquirySources'>;
  origin?: AddressData;
  destination?: AddressData;
  dimensions?: DimensionsData;
  description?: string;
  specialInstructions?: string;
  deadline?: number;
  validUntil?: number;
  sentAt?: number;
  baseCost?: CurrencyAmountData;
  markup?: number;
  totalPrice?: CurrencyAmountData;
  partnerQuotes?: PartnerQuoteData[];
  selectedPartnerQuote?: Id<'yourobcPartners'>;
  flightDetails?: FlightDetailsData;
  shipmentType?: 'door-door' | 'door-airport' | 'airport-door' | 'airport-airport';
  incoterms?: string;
  appliedAirlineRules?: AirlineRulesData;
  assignedCourierId?: Id<'yourobcCouriers'>;
  employeeId?: Id<'yourobcEmployees'>;
  status?: QuoteStatus;
  convertedToShipmentId?: Id<'yourobcShipments'>;
  rejectionReason?: string;
  quoteText?: string;
  notes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

// Response types
export interface QuoteWithRelations extends Quote {
  customer?: Doc<'yourobcCustomers'> | null;
  inquirySource?: Doc<'inquirySources'> | null;
  assignedCourier?: Doc<'yourobcCouriers'> | null;
  employee?: Doc<'yourobcEmployees'> | null;
  convertedShipment?: Doc<'yourobcShipments'> | null;
}

export interface QuoteListResponse {
  items: Quote[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface QuoteFilters {
  status?: QuoteStatus[];
  serviceType?: QuoteServiceType[];
  priority?: QuotePriority[];
  search?: string;
  customerId?: Id<'yourobcCustomers'>;
  employeeId?: Id<'yourobcEmployees'>;
  assignedCourierId?: Id<'yourobcCouriers'>;
  deadlineFrom?: number;
  deadlineTo?: number;
  validUntilFrom?: number;
  validUntilTo?: number;
}

// Stats response type
export interface QuoteStatsResponse {
  total: number;
  byStatus: {
    draft: number;
    sent: number;
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
  };
  byServiceType: {
    OBC: number;
    NFO: number;
  };
  byPriority: {
    standard: number;
    urgent: number;
    critical: number;
  };
  conversionRate: number;
  averageResponseTime: number;
}
