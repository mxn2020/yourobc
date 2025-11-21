// convex/schema/software/yourobc/accounting/accounting.ts
// Table definitions for accounting module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { accountingValidators } from './validators';

export const accountingTable = defineTable({
  // Required: Main display field
  journalEntryNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Transaction details
  referenceNumber: v.optional(v.string()),
  status: accountingValidators.status,
  transactionType: accountingValidators.transactionType,
  transactionDate: v.number(),
  postingDate: v.optional(v.number()),

  // Amounts
  debitAmount: v.number(),
  creditAmount: v.number(),
  currency: v.string(), // ISO 4217 currency code (EUR, USD, etc.)

  // Account references
  debitAccountId: v.optional(v.string()),
  creditAccountId: v.optional(v.string()),
  accountCode: v.optional(v.string()),

  // Related entity references
  relatedInvoiceId: v.optional(v.id('yourobcInvoices')),
  relatedExpenseId: v.optional(v.string()),
  relatedShipmentId: v.optional(v.id('yourobcShipments')),
  relatedCustomerId: v.optional(v.id('yourobcCustomers')),
  relatedPartnerId: v.optional(v.id('yourobcPartners')),

  // Memo and description
  memo: v.optional(v.string()),
  description: v.optional(v.string()),

  // Tax tracking
  taxAmount: v.optional(v.number()),
  taxRate: v.optional(v.number()),
  taxCategory: v.optional(v.string()),
  isTaxable: v.optional(v.boolean()),

  // Reconciliation
  reconciliationStatus: v.optional(accountingValidators.reconciliationStatus),
  reconciledDate: v.optional(v.number()),
  reconciledBy: v.optional(v.id('userProfiles')),
  bankStatementDate: v.optional(v.number()),

  // Approval workflow
  approvalStatus: v.optional(accountingValidators.approvalStatus),
  approvedBy: v.optional(v.id('userProfiles')),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),
  rejectedBy: v.optional(v.id('userProfiles')),
  rejectedDate: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Supporting documents
  attachments: v.optional(v.array(v.object({
    id: v.string(),
    name: v.string(),
    url: v.string(),
    type: v.string(),
  }))),

  // Classification
  tags: v.optional(v.array(v.string())),
  category: v.optional(v.string()),
  fiscalYear: v.optional(v.number()),
  fiscalPeriod: v.optional(v.number()),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_journal_entry_number', ['journalEntryNumber'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_transaction_type', ['transactionType'])
  .index('by_transaction_date', ['transactionDate'])
  .index('by_reconciliation_status', ['reconciliationStatus'])
  .index('by_approval_status', ['approvalStatus'])
  .index('by_related_invoice', ['relatedInvoiceId'])
  .index('by_related_shipment', ['relatedShipmentId'])
  .index('by_related_customer', ['relatedCustomerId'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_fiscal_year_period', ['fiscalYear', 'fiscalPeriod'])
  .index('by_created_at', ['createdAt']);
