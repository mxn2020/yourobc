// convex/lib/yourobc/invoices/types.ts
// TypeScript type definitions for invoices module

import type { Doc, Id } from '@/generated/dataModel';
import type { InvoiceStatus, InvoiceType, InvoiceCurrencyAmount, PaymentMethod } from '@/schema/yourobc/invoices/types';

// Entity types
export type Invoice = Doc<'yourobcInvoices'>;
export type InvoiceId = Id<'yourobcInvoices'>;

// Re-export schema types
export type { InvoiceStatus, InvoiceType, PaymentMethod };
export type CurrencyAmount = InvoiceCurrencyAmount;

// Line item interface
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: CurrencyAmount;
  totalPrice: CurrencyAmount;
}

// Address interface
export interface Address {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

// Collection attempt interface
export interface CollectionAttempt {
  date: number;
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
  result: string;
  createdBy: string;
}

// Data interfaces for mutations
export interface CreateInvoiceData {
  invoiceNumber: string;
  externalInvoiceNumber?: string;
  type: InvoiceType;
  shipmentId?: Id<'yourobcShipments'>;
  customerId?: Id<'yourobcCustomers'>;
  partnerId?: Id<'yourobcPartners'>;
  issueDate: number;
  dueDate: number;
  description: string;
  lineItems: LineItem[];
  billingAddress?: Address;
  subtotal: CurrencyAmount;
  taxRate?: number;
  taxAmount?: CurrencyAmount;
  totalAmount: CurrencyAmount;
  paymentTerms: number;
  purchaseOrderNumber?: string;
  status?: InvoiceStatus;
  notes?: string;
  tags?: string[];
}

export interface UpdateInvoiceData {
  invoiceNumber?: string;
  externalInvoiceNumber?: string;
  type?: InvoiceType;
  shipmentId?: Id<'yourobcShipments'>;
  customerId?: Id<'yourobcCustomers'>;
  partnerId?: Id<'yourobcPartners'>;
  issueDate?: number;
  dueDate?: number;
  description?: string;
  lineItems?: LineItem[];
  billingAddress?: Address;
  subtotal?: CurrencyAmount;
  taxRate?: number;
  taxAmount?: CurrencyAmount;
  totalAmount?: CurrencyAmount;
  paymentTerms?: number;
  purchaseOrderNumber?: string;
  status?: InvoiceStatus;
  notes?: string;
  tags?: string[];
}

export interface ProcessPaymentData {
  paymentMethod: PaymentMethod;
  paymentDate: number;
  paymentReference?: string;
  paidAmount: CurrencyAmount;
  notes?: string;
}

export interface AddCollectionAttemptData {
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
  result: string;
  notes?: string;
}

// Response types
export interface InvoiceWithRelations extends Invoice {
  customer?: Doc<'yourobcCustomers'> | null;
  partner?: Doc<'yourobcPartners'> | null;
  shipment?: Doc<'yourobcShipments'> | null;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface InvoiceFilters {
  status?: InvoiceStatus[];
  type?: InvoiceType[];
  customerId?: Id<'yourobcCustomers'>;
  partnerId?: Id<'yourobcPartners'>;
  shipmentId?: Id<'yourobcShipments'>;
  search?: string;
  fromDate?: number;
  toDate?: number;
  isOverdue?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// Statistics types
export interface InvoiceStats {
  total: number;
  byStatus: {
    draft: number;
    sent: number;
    pending_payment: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  byType: {
    incoming: number;
    outgoing: number;
  };
  totalAmount: CurrencyAmount;
  totalPaid: CurrencyAmount;
  totalOutstanding: CurrencyAmount;
  totalOverdue: CurrencyAmount;
  averagePaymentTerms: number;
}

// Dunning types
export interface DunningInfo {
  level: number;
  levelLabel: string;
  fee: number;
  lastDate?: number;
  nextActionDate?: number;
}
