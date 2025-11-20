// convex/schema/software/yourobc/accounting/types.ts
/**
 * Accounting Types
 *
 * TypeScript type definitions extracted from accounting validators and schemas.
 * These types can be used throughout the application for type safety.
 *
 * @module convex/schema/software/yourobc/accounting/types
 */

import { Doc, Id } from '../../../../_generated/dataModel'

// ============================================================================
// Table Document Types
// ============================================================================

/**
 * Incoming Invoice Tracking document type
 */
export type IncomingInvoiceTracking = Doc<'yourobcIncomingInvoiceTracking'>

/**
 * Invoice Numbering document type
 */
export type InvoiceNumbering = Doc<'yourobcInvoiceNumbering'>

/**
 * Statement of Accounts document type
 */
export type StatementOfAccounts = Doc<'yourobcStatementOfAccounts'>

/**
 * Accounting Dashboard Cache document type
 */
export type AccountingDashboardCache = Doc<'yourobcAccountingDashboardCache'>

/**
 * Invoice Auto-Generation Log document type
 */
export type InvoiceAutoGenLog = Doc<'yourobcInvoiceAutoGenLog'>

// ============================================================================
// ID Types
// ============================================================================

export type IncomingInvoiceTrackingId = Id<'yourobcIncomingInvoiceTracking'>
export type InvoiceNumberingId = Id<'yourobcInvoiceNumbering'>
export type StatementOfAccountsId = Id<'yourobcStatementOfAccounts'>
export type AccountingDashboardCacheId = Id<'yourobcAccountingDashboardCache'>
export type InvoiceAutoGenLogId = Id<'yourobcInvoiceAutoGenLog'>

// ============================================================================
// Status Types (from base validators)
// ============================================================================

export type IncomingInvoiceStatus =
  | 'expected'
  | 'received'
  | 'approved'
  | 'paid'
  | 'missing'
  | 'disputed'
  | 'cancelled'

export type StatementTransactionType = 'invoice' | 'payment' | 'credit_note' | 'adjustment'

export type ExportFormat = 'pdf' | 'excel'

export type InvoiceAutoGenStatus = 'generated' | 'notification_sent' | 'notification_failed'

// ============================================================================
// Complex Object Types
// ============================================================================

/**
 * Statement transaction item
 */
export interface StatementTransaction {
  date: number
  type: StatementTransactionType
  reference: string
  description: string
  debit?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  credit?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  balance: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
}

/**
 * Outstanding invoice item
 */
export interface OutstandingInvoice {
  invoiceId: Id<'yourobcInvoices'>
  invoiceNumber: string
  issueDate: number
  dueDate: number
  amount: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  daysOverdue: number
}

/**
 * Overdue breakdown
 */
export interface OverdueBreakdown {
  overdue1to30: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  overdue31to60: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  overdue61to90: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  overdue90plus: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
}

/**
 * Cash flow forecast item
 */
export interface CashFlowItem {
  date: number
  amount: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  description: string
}

// ============================================================================
// Input Types for Mutations
// ============================================================================

/**
 * Input for creating an incoming invoice tracking record
 */
export interface CreateIncomingInvoiceTrackingInput {
  shipmentId: Id<'yourobcShipments'>
  partnerId: Id<'yourobcPartners'>
  expectedDate: number
  expectedAmount?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  internalNotes?: string
}

/**
 * Input for updating an incoming invoice tracking record
 */
export interface UpdateIncomingInvoiceTrackingInput {
  id: IncomingInvoiceTrackingId
  status?: IncomingInvoiceStatus
  invoiceId?: Id<'yourobcInvoices'>
  receivedDate?: number
  actualAmount?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
    exchangeRateDate?: number
  }
  approvedBy?: string
  approvedDate?: number
  approvalNotes?: string
  paidDate?: number
  paymentReference?: string
  disputeReason?: string
  disputeDate?: number
  disputeResolvedDate?: number
  internalNotes?: string
}

/**
 * Input for creating an invoice numbering record
 */
export interface CreateInvoiceNumberingInput {
  year: number
  month: number
  format: string
  incrementBy?: number
}

/**
 * Input for creating a statement of accounts
 */
export interface CreateStatementOfAccountsInput {
  customerId: Id<'yourobcCustomers'>
  startDate: number
  endDate: number
}

/**
 * Input for creating a dashboard cache entry
 */
export interface CreateDashboardCacheInput {
  date: number
}

/**
 * Input for creating an invoice auto-gen log entry
 */
export interface CreateInvoiceAutoGenLogInput {
  shipmentId: Id<'yourobcShipments'>
  invoiceId: Id<'yourobcInvoices'>
  podReceivedDate: number
  invoiceNumber: string
  notificationRecipients: string[]
}
