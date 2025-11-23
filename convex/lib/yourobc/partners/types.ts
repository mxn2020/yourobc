// convex/lib/yourobc/partners/types.ts
// TypeScript type definitions for partners module

import type { Doc, Id } from '@/generated/dataModel';
import type { Infer } from 'convex/values';
import type { PartnersStatus } from '@/schema/yourobc/partners/types';
import { partnersValidators, partnersFields } from '@/schema/yourobc/partners/validators';

// Entity types
export type Partner = Doc<'yourobcPartners'>;
export type PartnerId = Id<'yourobcPartners'>;

// Extracted types from validators
export type PartnersContactRole = Infer<typeof partnersValidators.contactRole>;
export type PartnersPreferredContactMethod = Infer<typeof partnersValidators.preferredContactMethod>;
export type PartnersPartnerServiceType = Infer<typeof partnersValidators.partnerServiceType>;

// Extracted types from fields
export type PartnersAddress = Infer<typeof partnersFields.address>;
export type PartnersContact = Infer<typeof partnersFields.contact>;
export type PartnersServiceCoverage = Infer<typeof partnersFields.serviceCoverage>;
export type PartnersServiceCapabilities = Infer<typeof partnersFields.serviceCapabilities>;

// Data interfaces
export interface CreatePartnerData {
  companyName: string;
  shortName?: string;
  partnerCode?: string;
  primaryContact: PartnersContact;
  quotingEmail?: string;
  address: PartnersAddress;
  serviceCoverage: PartnersServiceCoverage;
  serviceType: PartnersPartnerServiceType;
  preferredCurrency: 'EUR' | 'USD';
  paymentTerms: number;
  ranking?: number;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: PartnersServiceCapabilities;
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
  primaryContact?: PartnersContact;
  quotingEmail?: string;
  address?: PartnersAddress;
  serviceCoverage?: PartnersServiceCoverage;
  serviceType?: PartnersPartnerServiceType;
  preferredCurrency?: 'EUR' | 'USD';
  paymentTerms?: number;
  ranking?: number;
  rankingNotes?: string;
  internalPaymentNotes?: string;
  serviceCapabilities?: PartnersServiceCapabilities;
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
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter types
export interface PartnerFilters {
  status?: PartnersStatus[];
  serviceType?: PartnersPartnerServiceType[];
  search?: string;
  country?: string;
}
