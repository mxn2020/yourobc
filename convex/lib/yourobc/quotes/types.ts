// convex/lib/yourobc/quotes/types.ts
// convex/yourobc/quotes/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import { Address } from '../shared';
import { CustomerId } from '../customers';
import { Partner, PartnerId } from '../partners';
import { CourierId } from '../couriers';
import { InquirySourceId } from '../supporting';

export type Quote = Doc<'yourobcQuotes'>;
export type QuoteId = Id<'yourobcQuotes'>;

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
}

export interface CurrencyAmount {
  amount: number;
  currency: 'EUR' | 'USD';
  exchangeRate?: number;
}

export interface FlightDetails {
  flightNumber?: string;
  airline?: string;
  departureTime?: number;
  arrivalTime?: number;
}

export interface PartnerQuote {
  partnerId: PartnerId;
  partnerName: string;
  quotedPrice: CurrencyAmount;
  transitTime?: number;
  validUntil?: number;
  receivedAt: number;
}

export interface CreateQuoteData {
  customerReference?: string;
  serviceType: 'OBC' | 'NFO';
  priority: 'standard' | 'urgent' | 'critical';
  customerId: CustomerId;
  inquirySourceId?: InquirySourceId;
  origin: Address;
  destination: Address;
  dimensions: Dimensions;
  description: string;
  specialInstructions?: string;
  deadline: number;
  baseCost?: CurrencyAmount;
  markup?: number;
  totalPrice?: CurrencyAmount;
  partnerQuotes?: PartnerQuote[];
  selectedPartnerQuote?: PartnerId;
  flightDetails?: FlightDetails;
  assignedCourierId?: CourierId;
  validUntil?: number;
  quoteText?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface UpdateQuoteData {
  customerReference?: string;
  serviceType?: 'OBC' | 'NFO';
  priority?: 'standard' | 'urgent' | 'critical';
  origin?: Address;
  destination?: Address;
  dimensions?: Dimensions;
  description?: string;
  specialInstructions?: string;
  deadline?: number;
  baseCost?: CurrencyAmount;
  markup?: number;
  totalPrice?: CurrencyAmount;
  partnerQuotes?: PartnerQuote[];
  selectedPartnerQuote?: PartnerId;
  flightDetails?: FlightDetails;
  assignedCourierId?: CourierId;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil?: number;
  quoteText?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface QuoteFilters {
  status?: ('draft' | 'sent' | 'accepted' | 'rejected' | 'expired')[];
  serviceType?: ('OBC' | 'NFO')[];
  priority?: ('standard' | 'urgent' | 'critical')[];
  customerId?: CustomerId[];
  assignedCourierId?: CourierId[];
  originCountry?: string[];
  destinationCountry?: string[];
  dateRange?: {
    start: number;
    end: number;
    field?: 'createdAt' | 'deadline' | 'validUntil' | 'sentAt';
  };
  priceRange?: {
    min?: number;
    max?: number;
    currency?: 'EUR' | 'USD';
  };
  search?: string;
}

export interface QuoteListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'quoteNumber' | 'createdAt' | 'deadline' | 'validUntil' | 'totalPrice' | 'status';
  sortOrder?: 'asc' | 'desc';
  filters?: QuoteFilters;
}

export interface QuoteStats {
  totalQuotes: number;
  quotesByStatus: Record<string, number>;
  quotesByServiceType: Record<string, number>;
  quotesByPriority: Record<string, number>;
  conversionRate: number;
  averageQuoteValue: CurrencyAmount;
  expiringQuotes: number;
  overdueQuotes: number;
}

export interface QuotePricingData {
  baseCost: CurrencyAmount;
  markup: number;
  totalPrice: CurrencyAmount;
  selectedPartnerQuote?: Id<'yourobcPartners'>;
  partnerQuotes?: PartnerQuote[];
}

export interface QuoteConversionData {
  quoteId: Id<'yourobcQuotes'>;
  shipmentOverrides?: {
    description?: string;
    specialInstructions?: string;
    courierInstructions?: string;
    assignedCourierId?: Id<'yourobcCouriers'>;
    agreedPrice?: CurrencyAmount;
  };
}