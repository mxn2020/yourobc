// convex/lib/yourobc/accounting/types.ts
// TypeScript type definitions for accounting module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  AccountingStatus,
  AccountingTransactionType,
  AccountingReconciliationStatus,
  AccountingApprovalStatus,
} from '@/schema/yourobc/accounting/types';

// Entity types
export type AccountingEntry = Doc<'softwareYourObcAccounting'>;
export type AccountingEntryId = Id<'softwareYourObcAccounting'>;

// Sub-types
export interface AccountingAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

// Data interfaces
export interface CreateAccountingEntryData {
  journalEntryNumber?: string; // Auto-generated if not provided
  referenceNumber?: string;
  status?: AccountingStatus;
  transactionType: AccountingTransactionType;
  transactionDate: number;
  postingDate?: number;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  debitAccountId?: string;
  creditAccountId?: string;
  accountCode?: string;
  relatedInvoiceId?: Id<'yourobcInvoices'>;
  relatedExpenseId?: string;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  relatedPartnerId?: Id<'yourobcPartners'>;
  memo?: string;
  description?: string;
  taxAmount?: number;
  taxRate?: number;
  taxCategory?: string;
  isTaxable?: boolean;
  attachments?: AccountingAttachment[];
  tags?: string[];
  category?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
}

export interface UpdateAccountingEntryData {
  referenceNumber?: string;
  status?: AccountingStatus;
  transactionType?: AccountingTransactionType;
  transactionDate?: number;
  postingDate?: number;
  debitAmount?: number;
  creditAmount?: number;
  currency?: string;
  debitAccountId?: string;
  creditAccountId?: string;
  accountCode?: string;
  memo?: string;
  description?: string;
  taxAmount?: number;
  taxRate?: number;
  taxCategory?: string;
  isTaxable?: boolean;
  reconciliationStatus?: AccountingReconciliationStatus;
  approvalStatus?: AccountingApprovalStatus;
  approvalNotes?: string;
  rejectionReason?: string;
  attachments?: AccountingAttachment[];
  tags?: string[];
  category?: string;
}

// Response types
export interface AccountingEntryWithRelations extends AccountingEntry {
  relatedInvoice?: Doc<'yourobcInvoices'> | null;
  relatedShipment?: Doc<'yourobcShipments'> | null;
  relatedCustomer?: Doc<'yourobcCustomers'> | null;
  relatedPartner?: Doc<'yourobcPartners'> | null;
}

export interface AccountingEntryListResponse {
  items: AccountingEntry[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface AccountingEntryFilters {
  status?: AccountingStatus[];
  transactionType?: AccountingTransactionType[];
  reconciliationStatus?: AccountingReconciliationStatus[];
  approvalStatus?: AccountingApprovalStatus[];
  search?: string;
  relatedInvoiceId?: Id<'yourobcInvoices'>;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  fiscalYear?: number;
  fiscalPeriod?: number;
  dateFrom?: number;
  dateTo?: number;
}
