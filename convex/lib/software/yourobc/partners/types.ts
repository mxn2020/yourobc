// convex/lib/software/yourobc/partners/types.ts
// Type definitions for partners module

import type { Doc, Id } from '@/generated/dataModel';

// Partner entity type
export type Partner = Doc<'yourobcPartners'>;

// Partner creation input type
export interface CreatePartnerInput {
  companyName: string;
  shortName?: string;
  partnerCode?: string;
  primaryContact: {
    name: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
    role?: string;
    position?: string;
    department?: string;
    mobile?: string;
    preferredContactMethod?: 'email' | 'phone' | 'mobile';
    notes?: string;
  };
  quotingEmail?: string;
  address: {
    street?: string;
    city: string;
    postalCode?: string;
    country: string;
    countryCode: string;
  };
  serviceCoverage: {
    countries: string[];
    cities: string[];
    airports: string[];
  };
  serviceType: 'OBC' | 'NFO' | 'both';
  preferredCurrency: 'EUR' | 'USD';
  paymentTerms: number;
  ranking?: 1 | 2 | 3 | 4 | 5;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: {
    handlesCustoms?: boolean;
    handlesPickup?: boolean;
    handlesDelivery?: boolean;
    handlesNFO?: boolean;
    handlesTrucking?: boolean;
  };
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
  tags?: string[];
  category?: string;
}

// Partner update input type
export interface UpdatePartnerInput {
  companyName?: string;
  shortName?: string;
  partnerCode?: string;
  primaryContact?: {
    name: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
    role?: string;
    position?: string;
    department?: string;
    mobile?: string;
    preferredContactMethod?: 'email' | 'phone' | 'mobile';
    notes?: string;
  };
  quotingEmail?: string;
  address?: {
    street?: string;
    city: string;
    postalCode?: string;
    country: string;
    countryCode: string;
  };
  serviceCoverage?: {
    countries: string[];
    cities: string[];
    airports: string[];
  };
  serviceType?: 'OBC' | 'NFO' | 'both';
  preferredCurrency?: 'EUR' | 'USD';
  paymentTerms?: number;
  ranking?: 1 | 2 | 3 | 4 | 5;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: {
    handlesCustoms?: boolean;
    handlesPickup?: boolean;
    handlesDelivery?: boolean;
    handlesNFO?: boolean;
    handlesTrucking?: boolean;
  };
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
  tags?: string[];
  category?: string;
}

// Partner list filters
export interface PartnerListFilters {
  status?: 'active' | 'inactive' | 'suspended';
  serviceType?: 'OBC' | 'NFO' | 'both';
  country?: string;
  city?: string;
  airport?: string;
  ranking?: 1 | 2 | 3 | 4 | 5;
  minRanking?: 1 | 2 | 3 | 4 | 5;
  searchQuery?: string;
  tags?: string[];
}

// Partner statistics
export interface PartnerStatistics {
  totalPartners: number;
  activePartners: number;
  inactivePartners: number;
  suspendedPartners: number;
  partnersByServiceType: {
    OBC: number;
    NFO: number;
    both: number;
  };
  partnersByCurrency: {
    EUR: number;
    USD: number;
  };
  averageRanking: number;
  partnersByRanking: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
