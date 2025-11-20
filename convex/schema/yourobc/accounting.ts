// convex/schema/yourobc/accounting.ts
/**
 * YourOBC Accounting Schema
 *
 * Defines schemas for accounting and financial management including invoices,
 * statement of accounts, and financial tracking.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/accounting
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  incomingInvoiceStatusValidator,
  statementTransactionTypeValidator,
  exportFormatValidator,
  invoiceAutoGenStatusValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Incoming Invoice Tracking Table
// ============================================================================

/**
 * Incoming Invoice Tracking
 * Tracks expected invoices from suppliers and their status
 */
export const incomingInvoiceTrackingTable = defineTable({
  // References
  shipmentId: v.id('yourobcShipments'),
  partnerId: v.id('yourobcPartners'), // Supplier/carrier

  // Expected invoice details
  expectedDate: v.number(), // When we expect to receive the invoice
  expectedAmount: v.optional(currencyAmountSchema),

  // Received status
  status: incomingInvoiceStatusValidator,

  // Received invoice details
  invoiceId: v.optional(v.id('yourobcInvoices')), // Link to actual invoice when received
  receivedDate: v.optional(v.number()),
  actualAmount: v.optional(currencyAmountSchema),

  // Approval workflow
  approvedBy: v.optional(v.string()),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Payment details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),

  // Missing invoice tracking
  daysMissing: v.optional(v.number()), // Auto-calculated
  remindersSent: v.number(), // Count of reminders sent to supplier
  lastReminderDate: v.optional(v.number()),

  // Dispute tracking
  disputeReason: v.optional(v.string()),
  disputeDate: v.optional(v.number()),
  disputeResolvedDate: v.optional(v.number()),

  // Notes
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_shipment', ['shipmentId'])
  .index('by_partner', ['partnerId'])
  .index('by_status', ['status'])
  .index('by_expectedDate', ['expectedDate'])
  .index('by_status_expectedDate', ['status', 'expectedDate'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Invoice Numbering Table
// ============================================================================

/**
 * Invoice Numbering Sequence
 * Manages auto-increment invoice numbers with custom format (YYMM0013)
 */
export const invoiceNumberingTable = defineTable({
  year: v.number(), // e.g., 2025
  month: v.number(), // e.g., 1-12
  lastNumber: v.number(), // Last used number in this month
  format: v.string(), // e.g., 'YYMM####' where #### is the number
  incrementBy: v.number(), // Default 13

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_year_month', ['year', 'month'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Statement of Accounts Table
// ============================================================================

/**
 * Statement of Accounts
 * Per-customer account statements with transaction history
 */
export const statementOfAccountsTable = defineTable({
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
  transactions: v.array(v.object({
    date: v.number(),
    type: statementTransactionTypeValidator,
    reference: v.string(), // Invoice number, payment reference, etc.
    description: v.string(),
    debit: v.optional(currencyAmountSchema),
    credit: v.optional(currencyAmountSchema),
    balance: currencyAmountSchema,
  })),

  // Outstanding invoices
  outstandingInvoices: v.array(v.object({
    invoiceId: v.id('yourobcInvoices'),
    invoiceNumber: v.string(),
    issueDate: v.number(),
    dueDate: v.number(),
    amount: currencyAmountSchema,
    daysOverdue: v.number(),
  })),

  // Export tracking
  exportedAt: v.optional(v.number()),
  exportedBy: v.optional(v.string()),
  exportFormat: v.optional(exportFormatValidator),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_customer', ['customerId'])
  .index('by_period', ['startDate', 'endDate'])
  .index('by_generatedDate', ['generatedDate'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Accounting Dashboard Cache Table
// ============================================================================

/**
 * Accounting Dashboard Cache
 * Pre-calculated metrics for dashboard performance (invalidates daily)
 */
export const accountingDashboardCacheTable = defineTable({
  // Period
  date: v.number(), // Date this cache is for (daily)

  // Receivables (money owed to us)
  totalReceivables: currencyAmountSchema,
  currentReceivables: currencyAmountSchema, // Not overdue
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
  expectedIncoming: v.array(v.object({
    date: v.number(),
    amount: currencyAmountSchema,
    description: v.string(),
  })),
  expectedOutgoing: v.array(v.object({
    date: v.number(),
    amount: currencyAmountSchema,
    description: v.string(),
  })),

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
  validUntil: v.number(), // Cache expiry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_date', ['date'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Invoice Auto-Generation Log Table
// ============================================================================

/**
 * Invoice Auto-Generation Log
 * Tracks automatic invoice generation after POD with notification status
 */
export const invoiceAutoGenLogTable = defineTable({
  // References
  shipmentId: v.id('yourobcShipments'),
  invoiceId: v.id('yourobcInvoices'),

  // Generation details
  generatedDate: v.number(),
  podReceivedDate: v.number(), // When POD was uploaded
  invoiceNumber: v.string(),

  // Notification tracking
  notificationSent: v.boolean(),
  notificationSentDate: v.optional(v.number()),
  notificationRecipients: v.array(v.string()), // Email addresses

  // Status
  status: invoiceAutoGenStatusValidator,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_shipment', ['shipmentId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_generatedDate', ['generatedDate'])
  .index('by_status', ['status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (incomingInvoiceStatusValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, currencyAmountSchema, metadataSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for audit/metadata fields: ...auditFields, ...softDeleteFields, ...metadataSchema
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit or metadata fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Incoming Invoice Tracking:
 *    - Tracks expected invoices from suppliers (partners)
 *    - Links to shipments and partners
 *    - Monitors missing invoices with reminder tracking
 *    - Supports approval workflow before payment
 *    - Handles dispute tracking and resolution
 *
 * 2. Invoice Numbering:
 *    - Auto-increment invoice numbers per month
 *    - Format: YYMM#### (e.g., 250100013)
 *    - incrementBy: Typically 13 for sequential numbering
 *
 * 3. Statement of Accounts:
 *    - Per-customer account statements
 *    - Period-based with opening/closing balances
 *    - Cached transaction history for performance
 *    - Outstanding invoices with aging
 *    - Export tracking (PDF/Excel)
 *
 * 4. Dashboard Cache:
 *    - Pre-calculated metrics for performance
 *    - Daily cache invalidation
 *    - Receivables and payables tracking
 *    - Overdue breakdown by aging buckets
 *    - Cash flow forecasting
 *    - Dunning status tracking
 *
 * 5. Auto-Generation Log:
 *    - Tracks automatic invoice creation after POD
 *    - Monitors notification delivery
 *    - Links shipment to generated invoice
 *
 * 6. Currency Support:
 *    - Uses currencyAmountSchema for all financial amounts
 *    - Supports EUR and USD with exchange rates
 *
 * 7. Indexes:
 *    - by_shipment, by_partner, by_customer: For entity lookups
 *    - by_status, by_expectedDate: For tracking and alerts
 *    - by_status_expectedDate: Compound index for filtered queries
 *    - by_year_month: For invoice numbering
 *    - by_period: For statement generation
 */
