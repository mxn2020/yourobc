// src/features/yourobc/invoices/index.ts

// === Types ===
export type {
  Invoice,
  InvoiceId,
  InvoiceFormData,
  PaymentFormData,
  CollectionAttemptFormData,
  InvoiceListItem,
  InvoiceWithDetails,
  InvoiceDetailsProps,
  InvoiceCardProps,
  InvoiceCreationParams,
  InvoiceUpdateParams,
  InvoicePaymentParams,
  InvoiceStats as InvoiceStatsType,
  InvoiceAging as InvoiceAgingType,
  MonthlyInvoiceStats,
  InvoiceSearchFilters,
  InvoiceSortOptions,
  InvoiceDashboardMetrics,
  CreateInvoiceData,
  UpdateInvoiceData,
  ProcessPaymentData,
  CreateCollectionAttemptData,
  LineItem,
  CollectionAttempt,
} from './types'

import type { Address, CurrencyAmount } from '@/convex/lib/yourobc'

export {
  INVOICE_CONSTANTS,
  INVOICE_STATUS_COLORS,
  INVOICE_TYPE_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_SYMBOLS,
  COLLECTION_ATTEMPT_METHODS,
  COLLECTION_METHOD_LABELS,
  TAX_RATES,
} from './types'

// === Services ===
export { InvoicesService, invoicesService } from './services/InvoicesService'

// === Hooks ===
export {
  useInvoices,
  useInvoice,
  useOverdueInvoices,
  useInvoiceSearch,
  useInvoiceAging,
  useMonthlyInvoiceStats,
  useInvoiceForm,
} from './hooks/useInvoices'

// === Components ===
export { InvoiceCard } from './components/InvoiceCard'
export { InvoiceList } from './components/InvoiceList'
export { InvoiceForm } from './components/InvoiceForm'
export { InvoiceStats } from './components/InvoiceStats'
export { InvoiceSearch } from './components/InvoiceSearch'
export { InvoiceAging } from './components/InvoiceAging'
export { PaymentForm } from './components/PaymentForm'
export { CollectionAttemptForm } from './components/CollectionAttemptForm'

// === Pages ===
export { InvoicesPage } from './pages/InvoicesPage'
export { InvoiceDetailsPage } from './pages/InvoiceDetailsPage'
export { CreateInvoicePage } from './pages/CreateInvoicePage'
export { OverdueInvoicesPage } from './pages/OverdueInvoicesPage'