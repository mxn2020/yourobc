// convex/lib/software/yourobc/invoices/types.ts
// Library types for invoices module

import { Doc, Id } from '@/dataModel';

// Re-export schema types
export type {
  InvoiceStatus,
  InvoiceType,
  PaymentMethod,
  CollectionMethod,
} from '@/schema/software/yourobc/invoices/types';

// Database document types
export type Invoice = Doc<'yourobcInvoices'>;

// Input types for creating/updating invoices
export interface CreateInvoiceInput {
  invoiceNumber: string;
  type: 'incoming' | 'outgoing';
  description: string;
  customerId?: Id<'yourobcCustomers'>;
  partnerId?: Id<'yourobcPartners'>;
  shipmentId?: Id<'yourobcShipments'>;
  issueDate: number;
  dueDate: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: {
      amount: number;
      currency: 'EUR' | 'USD';
      exchangeRate?: number;
      exchangeRateDate?: number;
    };
    totalPrice: {
      amount: number;
      currency: 'EUR' | 'USD';
      exchangeRate?: number;
      exchangeRateDate?: number;
    };
  }>;
  subtotal: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  totalAmount: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  taxRate?: number;
  taxAmount?: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  paymentTerms?: number;
  billingAddress?: {
    street?: string;
    city: string;
    postalCode?: string;
    country: string;
    countryCode: string;
  };
  externalInvoiceNumber?: string;
  purchaseOrderNumber?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateInvoiceInput {
  invoiceNumber?: string;
  description?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: {
      amount: number;
      currency: 'EUR' | 'USD';
      exchangeRate?: number;
      exchangeRateDate?: number;
    };
    totalPrice: {
      amount: number;
      currency: 'EUR' | 'USD';
      exchangeRate?: number;
      exchangeRateDate?: number;
    };
  }>;
  subtotal?: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  totalAmount?: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  taxRate?: number;
  taxAmount?: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
  dueDate?: number;
  issueDate?: number;
  sentAt?: number;
  paymentTerms?: number;
  billingAddress?: {
    street?: string;
    city: string;
    postalCode?: string;
    country: string;
    countryCode: string;
  };
  externalInvoiceNumber?: string;
  purchaseOrderNumber?: string;
  notes?: string;
  tags?: string[];
}

export interface ProcessPaymentInput {
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal' | 'wire_transfer' | 'other';
  paymentDate: number;
  paymentReference?: string;
  paidAmount: {
    amount: number;
    currency: 'EUR' | 'USD';
    exchangeRate?: number;
    exchangeRateDate?: number;
  };
}

export interface AddCollectionAttemptInput {
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
  result: string;
}

export interface UpdateDunningLevelInput {
  dunningLevel: number;
  dunningFee?: number;
}

// Query filter types
export interface InvoiceFilters {
  type?: 'incoming' | 'outgoing';
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customerId?: Id<'yourobcCustomers'>;
  partnerId?: Id<'yourobcPartners'>;
  shipmentId?: Id<'yourobcShipments'>;
  fromDate?: number;
  toDate?: number;
  overdue?: boolean;
  searchText?: string;
}

// Statistics types
export interface InvoiceStats {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
  averagePaymentDays: number;
}
