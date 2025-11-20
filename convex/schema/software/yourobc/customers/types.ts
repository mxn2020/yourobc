// convex/schema/software/yourobc/customers/types.ts
// Type exports for customers module

import type { Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import {
  customerStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  contactRoleValidator,
  preferredContactMethodValidator,
  contactSchema,
  addressSchema,
  entityStatsSchema,
} from './validators';

// ============================================================================
// Validator-derived Types
// ============================================================================

export type CustomerStatus = Infer<typeof customerStatusValidator>;
export type Currency = Infer<typeof currencyValidator>;
export type PaymentMethod = Infer<typeof paymentMethodValidator>;
export type ContactRole = Infer<typeof contactRoleValidator>;
export type PreferredContactMethod = Infer<typeof preferredContactMethodValidator>;

// ============================================================================
// Schema-derived Types
// ============================================================================

export type Contact = Infer<typeof contactSchema>;
export type Address = Infer<typeof addressSchema>;
export type EntityStats = Infer<typeof entityStatsSchema>;

// ============================================================================
// Document Types
// ============================================================================

export type Customer = Doc<'yourobcCustomers'>;
export type CustomerId = Id<'yourobcCustomers'>;

// ============================================================================
// Data Transfer Types
// ============================================================================

/**
 * Create customer input data
 */
export interface CreateCustomerInput {
  companyName: string;
  shortName?: string;
  website?: string;
  primaryContact: Contact;
  additionalContacts?: Contact[];
  billingAddress: Address;
  shippingAddress?: Address;
  defaultCurrency: Currency;
  paymentTerms: number;
  paymentMethod: PaymentMethod;
  margin: number;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
}

/**
 * Update customer input data
 */
export interface UpdateCustomerInput {
  companyName?: string;
  shortName?: string;
  website?: string;
  primaryContact?: Contact;
  additionalContacts?: Contact[];
  billingAddress?: Address;
  shippingAddress?: Address;
  defaultCurrency?: Currency;
  paymentTerms?: number;
  paymentMethod?: PaymentMethod;
  margin?: number;
  status?: CustomerStatus;
  inquirySourceId?: Id<'yourobcInquirySources'>;
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  category?: string;
}

/**
 * Customer with populated relations
 */
export interface CustomerWithRelations extends Customer {
  inquirySource?: Doc<'yourobcInquirySources'>;
  owner?: Doc<'userProfiles'>;
}
