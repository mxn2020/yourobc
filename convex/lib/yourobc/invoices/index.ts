// convex/lib/yourobc/invoices/index.ts
// convex/yourobc/invoices/index.ts

export { 
  INVOICE_CONSTANTS, 
  INVOICE_STATUS_COLORS,
  INVOICE_TYPE_COLORS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_SYMBOLS,
  OVERDUE_THRESHOLDS,
  COLLECTION_ATTEMPT_METHODS,
  TAX_RATES,
} from './constants'

export * from './types'

export {
  getInvoices,
  getInvoice,
  getInvoiceStats,
  getOverdueInvoices,
  getInvoiceAging,
  searchInvoices,
  getInvoicesByEntity,
  getMonthlyInvoiceStats,
} from './queries'

export {
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  processPayment,
  addCollectionAttempt,
  deleteInvoice,
} from './mutations'

export {
  validateInvoiceData,
  validateLineItems,
  validatePaymentData,
  generateInvoiceNumber,
  getInvoiceStatusColor,
  getInvoiceTypeColor,
  calculateDueDate,
  calculateTaxAmount,
  calculateTotalAmount,
  calculateLineItemTotal,
  getInvoiceOverdueStatus,
  formatCurrencyAmount,
  formatInvoiceDisplayName,
  sanitizeInvoiceForExport,
  getNextCollectionAction,
} from './utils'

// Invoice numbering system (YYMM0013 format)
export * as invoiceNumbering from './numbering'

// Export invoice number generator utilities
export {
  generateNextInvoiceNumber,
  isValidInvoiceNumber,
  parseInvoiceNumber,
  getMonthlyInvoiceCount,
  previewNextInvoiceNumber,
} from './invoiceNumberGenerator'