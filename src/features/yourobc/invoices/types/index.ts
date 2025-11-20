// src/features/yourobc/invoices/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { CurrencyAmount, CustomerId, PartnerId, PaymentMethod, ShipmentId } from '@/convex/lib/yourobc'
import { CollectionAttempt, LineItem } from '@/convex/lib/yourobc/invoices'
import { Address } from '@/convex/lib/yourobc/shared'

// Base types from Convex schema
export type Invoice = Doc<'yourobcInvoices'>
export type InvoiceId = Id<'yourobcInvoices'>

// Re-export types from convex for consistency
export type {
  CreateInvoiceData,
  UpdateInvoiceData,
  ProcessPaymentData,
  CreateCollectionAttemptData,
  LineItem,
  CollectionAttempt,
} from '@/convex/lib/yourobc/invoices/types'

// Extended invoice type with additional computed fields
export interface InvoiceWithDetails extends Invoice {
  customer?: {
    _id: Id<'yourobcCustomers'>
    companyName: string
    shortName?: string
    primaryContact?: {
      name: string
      email?: string
      phone?: string
    }
    billingAddress?: Address
    paymentTerms?: number
  } | null
  partner?: {
    _id: Id<'yourobcPartners'>
    companyName: string
    shortName?: string
    primaryContact?: {
      name: string
      email?: string
      phone?: string
    }
    address?: Address
  } | null
  shipment?: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
    description?: string
    customerId?: CustomerId
  } | null
  overdueStatus: {
    isOverdue: boolean
    daysOverdue: number
    severity: 'warning' | 'critical' | 'severe' | null
  }
  collectionAttemptsWithUsers?: Array<CollectionAttempt & {
    createdByUser?: {
      name: string
      email: string
    } | null
  }>
}

// UI-specific types
export interface InvoiceFormData {
  type: 'incoming' | 'outgoing'
  shipmentId?: ShipmentId
  customerId?: CustomerId
  partnerId?: PartnerId
  invoiceNumber?: string
  externalInvoiceNumber?: string
  issueDate: number
  dueDate?: number
  description: string
  lineItems: LineItem[]
  subtotal: CurrencyAmount
  taxAmount?: CurrencyAmount
  taxRate?: number
  totalAmount: CurrencyAmount
  paymentTerms?: number
  billingAddress?: Address
  purchaseOrderNumber?: string
  notes?: string
}

export interface PaymentFormData {
  paymentDate: number
  paymentMethod: PaymentMethod
  paidAmount: CurrencyAmount
  paymentReference?: string
  notes?: string
}

export interface CollectionAttemptFormData {
  method: 'email' | 'phone' | 'letter' | 'legal_notice' | 'debt_collection'
  result: string
  notes?: string
}

export interface InvoiceListItem extends InvoiceWithDetails {
  formattedTotal?: string
  formattedDueDate?: string
  daysToDue?: number
  agingCategory?: 'current' | 'overdue_1_30' | 'overdue_31_60' | 'overdue_61_90' | 'overdue_90_plus'
}

export interface InvoiceDetailsProps {
  invoice: InvoiceWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onProcessPayment?: () => void
  onAddCollectionAttempt?: () => void
}

export interface InvoiceCardProps {
  invoice: InvoiceListItem
  onClick?: (invoice: InvoiceListItem) => void
  showCustomer?: boolean
  showPartner?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface InvoiceCreationParams {
  invoiceData: InvoiceFormData
  autoGenerateNumber?: boolean
  sendImmediately?: boolean
}

export interface InvoiceUpdateParams {
  invoiceId: InvoiceId
  updates: Partial<InvoiceFormData>
  updateReason?: string
}

export interface InvoicePaymentParams {
  invoiceId: InvoiceId
  paymentData: PaymentFormData
}

// Stats types
export interface InvoiceStats {
  totalInvoices: number
  totalOutgoingAmount: number
  totalIncomingAmount: number
  paidInvoices: number
  overdueInvoices: number
  draftInvoices: number
  avgPaymentTime: number
  outstandingAmount: number
  invoicesByStatus: Record<string, number>
  invoicesByType: Record<string, number>
  monthlyRevenue: number
  monthlyExpenses: number
}

export interface InvoiceAging {
  current: { count: number; amount: number }
  days1to30: { count: number; amount: number }
  days31to60: { count: number; amount: number }
  days61to90: { count: number; amount: number }
  over90: { count: number; amount: number }
}

export interface MonthlyInvoiceStats {
  year: number
  monthlyStats: Array<{
    month: number
    monthName: string
    totalInvoices: number
    outgoingInvoices: number
    incomingInvoices: number
    outgoingRevenue: number
    incomingExpenses: number
    paidRevenue: number
    netProfit: number
  }>
  yearTotals: {
    totalInvoices: number
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
  }
}

// Filter and search types
export interface InvoiceSearchFilters {
  type?: ('incoming' | 'outgoing')[]
  status?: ('draft' | 'sent' | 'paid' | 'overdue' | 'cancelled')[]
  customerId?: CustomerId
  partnerId?: PartnerId
  shipmentId?: ShipmentId
  isOverdue?: boolean
  dateRange?: {
    start: number
    end: number
    field?: 'issueDate' | 'dueDate' | 'paymentDate'
  }
  amountRange?: {
    min: number
    max: number
    currency: 'EUR' | 'USD'
  }
  search?: string
}

export interface InvoiceSortOptions {
  sortBy: 'invoiceNumber' | 'issueDate' | 'dueDate' | 'totalAmount' | 'status' | 'customer' | 'partner'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface InvoiceDashboardMetrics {
  totalInvoices: number
  totalRevenue: number
  totalExpenses: number
  outstandingAmount: number
  overdueInvoices: number
  avgPaymentTime: number
  monthlyGrowth: number
  profitMargin: number
  recentInvoices: Array<{
    invoiceId: InvoiceId
    invoiceNumber: string
    customerName?: string
    amount: number
    status: string
    dueDate: number
  }>
}

// Export constants
export const INVOICE_CONSTANTS = {
  TYPE: {
    INCOMING: 'incoming' as const,
    OUTGOING: 'outgoing' as const,
  },
  STATUS: {
    DRAFT: 'draft' as const,
    SENT: 'sent' as const,
    PAID: 'paid' as const,
    OVERDUE: 'overdue' as const,
    CANCELLED: 'cancelled' as const,
  },
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer' as const,
    CREDIT_CARD: 'credit_card' as const,
    CASH: 'cash' as const,
    CHECK: 'check' as const,
    PAYPAL: 'paypal' as const,
    WIRE_TRANSFER: 'wire_transfer' as const,
  },
  CURRENCY: {
    EUR: 'EUR' as const,
    USD: 'USD' as const,
  },
  DEFAULT_VALUES: {
    CURRENCY: 'EUR' as const,
    PAYMENT_TERMS: 30,
    TAX_RATE: 19,
    STATUS: 'draft' as const,
  },
  LIMITS: {
    MAX_INVOICE_NUMBER_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MAX_REFERENCE_LENGTH: 50,
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999,
    MAX_LINE_ITEMS: 50,
    MAX_COLLECTION_ATTEMPTS: 10,
  },
  PERMISSIONS: {
    VIEW: 'invoices.view',
    CREATE: 'invoices.create',
    EDIT: 'invoices.edit',
    DELETE: 'invoices.delete',
    APPROVE: 'invoices.approve',
    PROCESS_PAYMENT: 'invoices.process_payment',
    SEND: 'invoices.send',
    CANCEL: 'invoices.cancel',
    VIEW_FINANCIAL_DATA: 'invoices.view_financial_data',
  },
} as const

export const INVOICE_STATUS_COLORS = {
  [INVOICE_CONSTANTS.STATUS.DRAFT]: '#6b7280',
  [INVOICE_CONSTANTS.STATUS.SENT]: '#3b82f6',
  [INVOICE_CONSTANTS.STATUS.PAID]: '#10b981',
  [INVOICE_CONSTANTS.STATUS.OVERDUE]: '#ef4444',
  [INVOICE_CONSTANTS.STATUS.CANCELLED]: '#9ca3af',
} as const

export const INVOICE_TYPE_COLORS = {
  [INVOICE_CONSTANTS.TYPE.INCOMING]: '#8b5cf6',
  [INVOICE_CONSTANTS.TYPE.OUTGOING]: '#06b6d4',
} as const

export const INVOICE_STATUS_LABELS = {
  [INVOICE_CONSTANTS.STATUS.DRAFT]: 'Draft',
  [INVOICE_CONSTANTS.STATUS.SENT]: 'Sent',
  [INVOICE_CONSTANTS.STATUS.PAID]: 'Paid',
  [INVOICE_CONSTANTS.STATUS.OVERDUE]: 'Overdue',
  [INVOICE_CONSTANTS.STATUS.CANCELLED]: 'Cancelled',
} as const

export const INVOICE_TYPE_LABELS = {
  [INVOICE_CONSTANTS.TYPE.INCOMING]: 'Incoming',
  [INVOICE_CONSTANTS.TYPE.OUTGOING]: 'Outgoing',
} as const

export const PAYMENT_METHOD_LABELS = {
  [INVOICE_CONSTANTS.PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.CREDIT_CARD]: 'Credit Card',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.CASH]: 'Cash',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.CHECK]: 'Check',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.PAYPAL]: 'PayPal',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.WIRE_TRANSFER]: 'Wire Transfer',
  other: 'Other',
} as const

export const CURRENCY_SYMBOLS = {
  [INVOICE_CONSTANTS.CURRENCY.EUR]: '€',
  [INVOICE_CONSTANTS.CURRENCY.USD]: '$',
} as const

export const COLLECTION_ATTEMPT_METHODS = [
  'email',
  'phone',
  'letter',
  'legal_notice',
  'debt_collection',
] as const

export const COLLECTION_METHOD_LABELS = {
  email: 'Email',
  phone: 'Phone Call',
  letter: 'Formal Letter',
  legal_notice: 'Legal Notice',
  debt_collection: 'Debt Collection',
} as const

export const TAX_RATES = {
  GERMANY: {
    STANDARD: 19,
    REDUCED: 7,
    EXEMPT: 0,
  },
  EU: {
    REVERSE_CHARGE: 0,
  },
  INTERNATIONAL: {
    EXEMPT: 0,
  },
} as const