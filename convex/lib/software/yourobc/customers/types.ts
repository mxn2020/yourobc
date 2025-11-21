// convex/lib/software/yourobc/customers/types.ts
// TypeScript type definitions for customers module

import type { Doc, Id } from '@/generated/dataModel';
import type { CustomerStatus, CustomerCurrency, CustomerPaymentMethod } from '@/schema/software/yourobc/customers/types';

// Entity types
export type Customer = Doc<'yourobcCustomers'>;
export type CustomerId = Id<'yourobcCustomers'>;

// Contact interface (matching schema)
export interface ContactData {
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
}

// Address interface (matching schema)
export interface AddressData {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

// Statistics interface (matching schema)
export interface CustomerStats {
  totalQuotes: number;
  acceptedQuotes: number;
  totalRevenue: number;
  lastQuoteDate?: number;
  lastShipmentDate?: number;
}

// Data interfaces
export interface CreateCustomerData {
  companyName: string;
  shortName?: string;
  website?: string;
  primaryContact: ContactData;
  additionalContacts?: ContactData[];
  billingAddress: AddressData;
  shippingAddress?: AddressData;
  defaultCurrency: CustomerCurrency;
  paymentTerms: number;
  paymentMethod: CustomerPaymentMethod;
  margin: number;
  status?: CustomerStatus;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  serviceSuspended?: boolean;
  serviceSuspendedDate?: number;
  serviceSuspendedReason?: string;
  serviceReactivatedDate?: number;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateCustomerData {
  companyName?: string;
  shortName?: string;
  website?: string;
  primaryContact?: ContactData;
  additionalContacts?: ContactData[];
  billingAddress?: AddressData;
  shippingAddress?: AddressData;
  defaultCurrency?: CustomerCurrency;
  paymentTerms?: number;
  paymentMethod?: CustomerPaymentMethod;
  margin?: number;
  status?: CustomerStatus;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  serviceSuspended?: boolean;
  serviceSuspendedDate?: number;
  serviceSuspendedReason?: string;
  serviceReactivatedDate?: number;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
  customFields?: Record<string, unknown>;
}

// Response types
export interface CustomerWithRelations extends Customer {
  inquirySource?: Doc<'yourobcInquirySources'> | null;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface CustomerFilters {
  status?: CustomerStatus[];
  currency?: CustomerCurrency[];
  search?: string;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  country?: string;
  serviceSuspended?: boolean;
}

// Stats response type
export interface CustomerStatsResponse {
  total: number;
  byStatus: {
    active: number;
    inactive: number;
    blacklisted: number;
  };
  byCurrency: {
    EUR: number;
    USD: number;
  };
  serviceSuspended: number;
  averageMargin: number;
  averagePaymentTerms: number;
}
