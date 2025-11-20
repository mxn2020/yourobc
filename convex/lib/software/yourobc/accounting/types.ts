// convex/lib/software/yourobc/accounting/types.ts
/**
 * Accounting Library Types
 *
 * TypeScript types for accounting library functions, parameters, and return values.
 *
 * @module convex/lib/software/yourobc/accounting/types
 */

import { Id } from '../../../../_generated/dataModel'

// Re-export types from schema
export type {
  IncomingInvoiceTracking,
  InvoiceNumbering,
  StatementOfAccounts,
  AccountingDashboardCache,
  InvoiceAutoGenLog,
  IncomingInvoiceTrackingId,
  InvoiceNumberingId,
  StatementOfAccountsId,
  AccountingDashboardCacheId,
  InvoiceAutoGenLogId,
  IncomingInvoiceStatus,
  StatementTransactionType,
  ExportFormat,
  InvoiceAutoGenStatus,
  StatementTransaction,
  OutstandingInvoice,
  OverdueBreakdown,
  CashFlowItem,
  CreateIncomingInvoiceTrackingInput,
  UpdateIncomingInvoiceTrackingInput,
  CreateInvoiceNumberingInput,
  CreateStatementOfAccountsInput,
  CreateDashboardCacheInput,
  CreateInvoiceAutoGenLogInput,
} from '../../../../schema/software/yourobc/accounting/types'

/**
 * Currency amount interface
 */
export interface CurrencyAmount {
  amount: number
  currency: 'EUR' | 'USD'
  exchangeRate?: number
  exchangeRateDate?: number
}

/**
 * Public ID generation options
 */
export interface PublicIdOptions {
  prefix: string
  year: number
  sequence: number
}

/**
 * Invoice number generation result
 */
export interface InvoiceNumberResult {
  invoiceNumber: string
  year: number
  month: number
  sequence: number
}

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  receivables: {
    total: CurrencyAmount
    current: CurrencyAmount
    overdue: CurrencyAmount
    breakdown: {
      overdue1to30: CurrencyAmount
      overdue31to60: CurrencyAmount
      overdue61to90: CurrencyAmount
      overdue90plus: CurrencyAmount
    }
  }
  payables: {
    total: CurrencyAmount
    current: CurrencyAmount
    overdue: CurrencyAmount
  }
  cashFlow: {
    incoming: Array<{
      date: number
      amount: CurrencyAmount
      description: string
    }>
    outgoing: Array<{
      date: number
      amount: CurrencyAmount
      description: string
    }>
  }
  dunning: {
    level1: number
    level2: number
    level3: number
    suspended: number
  }
  missingInvoices: {
    count: number
    value: CurrencyAmount
  }
  pendingApprovals: {
    count: number
    value: CurrencyAmount
  }
}

/**
 * Statement generation options
 */
export interface StatementGenerationOptions {
  customerId: Id<'yourobcCustomers'>
  startDate: number
  endDate: number
  includeTransactions?: boolean
  includeOutstandingInvoices?: boolean
}

/**
 * Reminder tracking info
 */
export interface ReminderInfo {
  remindersSent: number
  lastReminderDate?: number
  nextReminderDate?: number
}

/**
 * Invoice auto-gen notification result
 */
export interface NotificationResult {
  success: boolean
  sentDate?: number
  error?: string
}

/**
 * Overdue analysis result
 */
export interface OverdueAnalysis {
  daysOverdue: number
  agingBucket: '1-30' | '31-60' | '61-90' | '90+'
  isOverdue: boolean
}
