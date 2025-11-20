// convex/lib/yourobc/partners/types.ts
// convex/yourobc/partners/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import { Address, Contact } from '../shared';

export type Partner = Doc<'yourobcPartners'>;
export type PartnerId = Id<'yourobcPartners'>;

export interface ServiceCoverage {
  countries: string[];
  cities: string[];
  airports: string[];
}

export interface CreatePartnerData {
  companyName: string;
  shortName?: string;
  partnerCode?: string;
  serviceType: 'OBC' | 'NFO' | 'both';
  primaryContact: Contact;
  address: Address;
  serviceCoverage: ServiceCoverage;
  preferredCurrency?: 'EUR' | 'USD';
  paymentTerms?: number;
  quotingEmail?: string;
  notes?: string;
  ranking?: number;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: {
    handlesCustoms?: boolean;
    handlesPickup?: boolean;
    handlesDelivery?: boolean;
    handlesNFO?: boolean;
    handlesTrucking?: boolean;
  };
}

export interface UpdatePartnerData {
  companyName?: string;
  shortName?: string;
  partnerCode?: string;
  status?: 'active' | 'inactive';
  serviceType?: 'OBC' | 'NFO' | 'both';
  primaryContact?: Contact;
  address?: Address;
  serviceCoverage?: ServiceCoverage;
  preferredCurrency?: 'EUR' | 'USD';
  paymentTerms?: number;
  quotingEmail?: string;
  notes?: string;
  ranking?: number;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: {
    handlesCustoms?: boolean;
    handlesPickup?: boolean;
    handlesDelivery?: boolean;
    handlesNFO?: boolean;
    handlesTrucking?: boolean;
  };
}

export interface PartnerFilters {
  status?: ('active' | 'inactive')[];
  serviceType?: ('OBC' | 'NFO' | 'both')[];
  countries?: string[];
  cities?: string[];
  airports?: string[];
  search?: string;
}

export interface PartnerListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'companyName' | 'partnerCode' | 'serviceType' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  filters?: PartnerFilters;
}

export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  partnersByServiceType: Record<string, number>;
  partnersByCountry: Record<string, number>;
  avgQuotesPerPartner: number;
}

export interface PartnerQuoteRequest {
  partnerId: PartnerId;
  quoteId: Id<'yourobcQuotes'>;
  serviceType: 'OBC' | 'NFO';
  origin: Address;
  destination: Address;
  description: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'cm' | 'inch';
    weightUnit: 'kg' | 'lb';
  };
  deadline: number;
  specialInstructions?: string;
  requestedAt: number;
  requestedBy: string;
}

export interface PartnerQuoteResponse {
  partnerId: PartnerId;
  partnerName: string;
  quotedPrice: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
  };
  transitTime?: number;
  validUntil?: number;
  receivedAt: number;
  notes?: string;
}