// convex/lib/yourobc/partners/types.ts
// TypeScript type definitions for partners module

import type { Doc, Id } from '@/generated/dataModel';
import type { PartnersStatus } from '@/schema/yourobc/partners/types';

// Entity types
export type Partner = Doc<'yourobcPartners'>;
export type PartnerId = Id<'yourobcPartners'>;

// Data interfaces
export interface CreatePartnerData {
  companyName: string;
  shortName?: string;
  partnerCode?: string;
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
  };
  quotingEmail?: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  serviceCoverage: {
    countries: string[];
    regions?: string[];
  };
  serviceType: 'air' | 'ocean' | 'road' | 'rail' | 'multimodal';
  preferredCurrency: 'EUR' | 'USD';
  paymentTerms: number;
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
  commissionRate?: number;
  apiEnabled?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  status?: PartnersStatus;
  notes?: string;
}

export interface UpdatePartnerData {
  companyName?: string;
  shortName?: string;
  partnerCode?: string;
  primaryContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  quotingEmail?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  serviceCoverage?: {
    countries: string[];
    regions?: string[];
  };
  serviceType?: 'air' | 'ocean' | 'road' | 'rail' | 'multimodal';
  preferredCurrency?: 'EUR' | 'USD';
  paymentTerms?: number;
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
  commissionRate?: number;
  apiEnabled?: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  status?: PartnersStatus;
  notes?: string;
}

// Response types
export interface PartnerListResponse {
  items: Partner[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface PartnerFilters {
  status?: PartnersStatus[];
  serviceType?: string[];
  search?: string;
  country?: string;
}
