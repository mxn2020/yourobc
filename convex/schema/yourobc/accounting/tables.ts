// convex/schema/yourobc/accounting/accounting.ts
// Table definitions for accounting module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields } from '@/schema/base';
import { accountingValidators, accountingFields } from './validators';
import { currencyAmountSchema } from '@/schema/base';

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
  attachments: v.optional(v.array(accountingFields.attachment)),

  // Classification
  ...classificationFields,
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


/**
 * Accounting Dashboard Cache Table
 * Pre-calculated metrics for dashboard performance (invalidates daily)
 */
export const accountingDashboardCacheTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Period
  date: v.number(),

  // Receivables (money owed to us)
  totalReceivables: currencyAmountSchema,
  currentReceivables: currencyAmountSchema,
  overdueReceivables: currencyAmountSchema,
  overdueBreakdown: v.object({
    overdue1to30: currencyAmountSchema,
    overdue31to60: currencyAmountSchema,
    overdue61to90: currencyAmountSchema,
    overdue90plus: currencyAmountSchema,
  }),

  // Payables (money we owe)
  totalPayables: currencyAmountSchema,
  currentPayables: currencyAmountSchema,
  overduePayables: currencyAmountSchema,

  // Cash flow forecast (next 30 days)
  expectedIncoming: v.array(accountingFields.expectedCashflowItem),
  expectedOutgoing: v.array(accountingFields.expectedCashflowItem),

  // Dunning status
  dunningLevel1Count: v.number(),
  dunningLevel2Count: v.number(),
  dunningLevel3Count: v.number(),
  suspendedCustomersCount: v.number(),

  // Missing invoices
  missingInvoicesCount: v.number(),
  missingInvoicesValue: currencyAmountSchema,

  // Pending approvals
  pendingApprovalCount: v.number(),
  pendingApprovalValue: currencyAmountSchema,

  // Cache control
  calculatedAt: v.number(),
  validUntil: v.number(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_date', ['date'])
  .index('by_owner_date', ['ownerId', 'date'])
  .index('by_created_at', ['createdAt']);


/**
 * Incoming Invoice Tracking Table
 * Tracks expected invoices from suppliers (partners) and their lifecycle
 */
export const incomingInvoiceTrackingTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // References
  shipmentId: v.id('yourobcShipments'),
  partnerId: v.id('yourobcPartners'),

  // Expected invoice details
  expectedDate: v.number(),
  expectedAmount: v.optional(currencyAmountSchema),

  // Received status
  status: accountingValidators.incomingInvoiceStatus,

  // Received invoice details
  invoiceId: v.optional(v.id('yourobcInvoices')),
  receivedDate: v.optional(v.number()),
  actualAmount: v.optional(currencyAmountSchema),

  // Approval workflow
  approvedBy: v.optional(v.id('userProfiles')),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Payment details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),

  // Missing invoice tracking
  daysMissing: v.optional(v.number()),
  remindersSent: v.number(),
  lastReminderDate: v.optional(v.number()),

  // Dispute tracking
  disputeReason: v.optional(v.string()),
  disputeDate: v.optional(v.number()),
  disputeResolvedDate: v.optional(v.number()),

  // Notes
  internalNotes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_partner', ['partnerId'])
  .index('by_status', ['status'])
  .index('by_expected_date', ['expectedDate'])
  .index('by_status_expected_date', ['status', 'expectedDate'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);


/**
* Invoice Auto-Generation Log Table
* Tracks automatic invoice generation after POD with notification status
*/
export const invoiceAutoGenLogTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // References
  shipmentId: v.id('yourobcShipments'),
  invoiceId: v.id('yourobcInvoices'),

  // Generation details
  generatedDate: v.number(),
  podReceivedDate: v.number(),
  invoiceNumber: v.string(),

  // Notification tracking
  notificationSent: v.boolean(),
  notificationSentDate: v.optional(v.number()),
  notificationRecipients: v.array(v.string()),

  // Status
  status: accountingValidators.invoiceAutoGenStatus,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_generated_date', ['generatedDate'])
  .index('by_status', ['status'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);


/**
* Invoice Numbering Sequence Table
* Manages auto-increment invoice numbers with custom format (e.g., YYMM0013)
*/
export const invoiceNumberingTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Numbering sequence fields
  year: v.number(),
  month: v.number(),
  lastNumber: v.number(),
  format: v.string(),
  incrementBy: v.number(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner_year_month', ['ownerId', 'year', 'month'])
  .index('by_created_at', ['createdAt']);


/**
* Statement of Accounts Table
* Per-customer account statements with transaction history
*/
export const statementOfAccountsTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Customer reference
  customerId: v.id('yourobcCustomers'),

  // Period
  startDate: v.number(),
  endDate: v.number(),
  generatedDate: v.number(),

  // Summary
  openingBalance: currencyAmountSchema,
  totalInvoiced: currencyAmountSchema,
  totalPaid: currencyAmountSchema,
  closingBalance: currencyAmountSchema,

  // Transaction details (cached for performance)
  transactions: v.array(accountingFields.statementTransaction),

  // Outstanding invoices
  outstandingInvoices: v.array(accountingFields.outstandingInvoice),

  // Export tracking
  exportedAt: v.optional(v.number()),
  exportedBy: v.optional(v.id('userProfiles')),
  exportFormat: v.optional(accountingValidators.exportFormat),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_owner_customer', ['ownerId', 'customerId'])
  .index('by_period', ['startDate', 'endDate'])
  .index('by_generated_date', ['generatedDate'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);


