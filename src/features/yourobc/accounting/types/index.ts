// src/features/yourobc/accounting/types/index.ts

import type { Id, Doc } from '@/convex/_generated/dataModel'

// Invoice Types
export type Invoice = Doc<'yourobcInvoices'>
export type InvoiceId = Id<'yourobcInvoices'>

export type IncomingInvoiceTracking = Doc<'yourobcIncomingInvoiceTracking'>
export type IncomingInvoiceTrackingId = Id<'yourobcIncomingInvoiceTracking'>

export type StatementOfAccounts = Doc<'yourobcStatementOfAccounts'>
export type StatementOfAccountsId = Id<'yourobcStatementOfAccounts'>

// Currency types
export type Currency = 'EUR' | 'USD'

export interface CurrencyAmount {
  amount: number
  currency: Currency
  exchangeRate?: number
}

// Invoice status types
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'partial'

export type IncomingInvoiceStatus =
  | 'expected'
  | 'received'
  | 'approved'
  | 'paid'
  | 'missing'
  | 'disputed'
  | 'cancelled'

// Create/Update types
export interface CreateOutgoingInvoiceData {
  shipmentId?: Id<'yourobcShipments'>
  customerId: Id<'yourobcCustomers'>
  description: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: CurrencyAmount
    totalPrice: CurrencyAmount
  }>
  currency: Currency
  taxRate?: number
  paymentTerms: number
  notes?: string
}

export interface CreateIncomingInvoiceTrackingData {
  shipmentId: Id<'yourobcShipments'>
  partnerId: Id<'yourobcPartners'>
  expectedDate: number
  expectedAmount?: CurrencyAmount
}

export interface UpdateIncomingInvoiceTrackingData {
  status?: IncomingInvoiceStatus
  actualAmount?: CurrencyAmount
  receivedDate?: number
  approvedDate?: number
  approvedBy?: string
  approvalNotes?: string
  disputeReason?: string
  internalNotes?: string
}

export interface GenerateStatementData {
  customerId: Id<'yourobcCustomers'>
  startDate: number
  endDate: number
}

// Dashboard metrics
export interface AccountingMetrics {
  totalReceivables: CurrencyAmount
  currentReceivables: CurrencyAmount
  overdueReceivables: CurrencyAmount
  overdueBreakdown: {
    overdue1to30: CurrencyAmount
    overdue31to60: CurrencyAmount
    overdue61to90: CurrencyAmount
    overdue90plus: CurrencyAmount
  }
  totalPayables: CurrencyAmount
  currentPayables: CurrencyAmount
  overduePayables: CurrencyAmount
  expectedIncoming: Array<{
    date: number
    amount: CurrencyAmount
    description: string
  }>
  expectedOutgoing: Array<{
    date: number
    amount: CurrencyAmount
    description: string
  }>
  dunningLevel1Count: number
  dunningLevel2Count: number
  dunningLevel3Count: number
  suspendedCustomersCount: number
  missingInvoicesCount: number
  missingInvoicesValue: CurrencyAmount
  pendingApprovalCount: number
  pendingApprovalValue: CurrencyAmount
  calculatedAt: number
}

// List options
export interface InvoiceListOptions {
  limit?: number
  offset?: number
  status?: InvoiceStatus | InvoiceStatus[]
  customerId?: Id<'yourobcCustomers'>
  startDate?: number
  endDate?: number
}

export interface IncomingInvoiceListOptions {
  limit?: number
  status?: IncomingInvoiceStatus
  partnerId?: Id<'yourobcPartners'>
  minDaysOverdue?: number
}
