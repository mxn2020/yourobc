// convex/lib/yourobc/invoices/types.ts
// convex/yourobc/invoices/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import { CustomerId } from '../customers';
import { PartnerId } from '../partners';
import { ShipmentId } from '../shipments';
import { Address, CurrencyAmount } from '../shared';
import { PaymentMethod } from '../../../schema/yourobc';

export type Invoice = Doc<'yourobcInvoices'>;
export type InvoiceId = Id<'yourobcInvoices'>;

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: CurrencyAmount;
  totalPrice: CurrencyAmount;
}

export interface CollectionAttempt {
  date: number;
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
  result: string;
  createdBy: string;
}

export interface CreateInvoiceData {
  type: 'incoming' | 'outgoing';
  shipmentId?: ShipmentId;
  customerId?: CustomerId;
  partnerId?: PartnerId;
  invoiceNumber?: string;
  externalInvoiceNumber?: string;
  issueDate: number;
  dueDate?: number;
  description: string;
  lineItems: LineItem[];
  subtotal: CurrencyAmount;
  taxAmount?: CurrencyAmount;
  taxRate?: number;
  totalAmount: CurrencyAmount;
  paymentTerms?: number;
  billingAddress?: Address;
  purchaseOrderNumber?: string;
  notes?: string;
}

export interface UpdateInvoiceData {
  invoiceNumber?: string;
  externalInvoiceNumber?: string;
  issueDate?: number;
  dueDate?: number;
  description?: string;
  lineItems?: LineItem[];
  subtotal?: CurrencyAmount;
  taxAmount?: CurrencyAmount;
  taxRate?: number;
  totalAmount?: CurrencyAmount;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: PaymentMethod;
  paymentDate?: number;
  paymentReference?: string;
  paidAmount?: CurrencyAmount;
  paymentTerms?: number;
  billingAddress?: Address;
  purchaseOrderNumber?: string;
  notes?: string;
}

export interface ProcessPaymentData {
  paymentDate: number;
  paymentMethod: PaymentMethod;
  paidAmount: CurrencyAmount;
  paymentReference?: string;
  notes?: string;
}

export interface InvoiceFilters {
  type?: ('incoming' | 'outgoing')[];
  status?: ('draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')[];
  customerId?: CustomerId;
  partnerId?: PartnerId;
  shipmentId?: ShipmentId;
  isOverdue?: boolean;
  dateRange?: {
    start: number;
    end: number;
    field: 'issueDate' | 'dueDate' | 'paymentDate';
  };
  amountRange?: {
    min: number;
    max: number;
    currency: 'EUR' | 'USD';
  };
  search?: string;
}

export interface InvoiceListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'invoiceNumber' | 'issueDate' | 'dueDate' | 'totalAmount' | 'status' | 'customer' | 'partner';
  sortOrder?: 'asc' | 'desc';
  filters?: InvoiceFilters;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalOutgoingAmount: number;
  totalIncomingAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  avgPaymentTime: number; // days
  outstandingAmount: number;
  invoicesByStatus: Record<string, number>;
  invoicesByType: Record<string, number>;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface InvoiceAging {
  current: { count: number; amount: number };
  days1to30: { count: number; amount: number };
  days31to60: { count: number; amount: number };
  days61to90: { count: number; amount: number };
  over90: { count: number; amount: number };
}

export interface CreateCollectionAttemptData {
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection';
  result: string;
  notes?: string;
}