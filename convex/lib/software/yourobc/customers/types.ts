// convex/lib/software/yourobc/customers/types.ts
// TypeScript interfaces for customers module

import type { Id } from '@/generated/dataModel';
import type {
  Customer,
  CustomerId,
  CustomerStatus,
  Currency,
  PaymentMethod,
  Contact,
  Address,
  EntityStats,
} from '@/schema/software/yourobc/customers';

// Re-export schema types
export type {
  Customer,
  CustomerId,
  CustomerStatus,
  Currency,
  PaymentMethod,
  Contact,
  Address,
  EntityStats,
};

/**
 * Customer query filters
 */
export interface CustomerFilters {
  status?: CustomerStatus;
  ownerId?: Id<'userProfiles'>;
  country?: string;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  currency?: Currency;
  includeDeleted?: boolean;
  searchTerm?: string;
}

/**
 * Customer list options
 */
export interface CustomerListOptions {
  filters?: CustomerFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'companyName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Customer suspension data
 */
export interface CustomerSuspensionData {
  reason: string;
  notes?: string;
}

/**
 * Customer reactivation data
 */
export interface CustomerReactivationData {
  notes?: string;
}

/**
 * Customer statistics summary
 */
export interface CustomerStatsSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  blacklistedCustomers: number;
  suspendedCustomers: number;
  totalRevenue: number;
  averageRevenue: number;
}
