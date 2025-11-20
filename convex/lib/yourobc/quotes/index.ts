// convex/lib/yourobc/quotes/index.ts
// convex/yourobc/quotes/index.ts

export { 
  QUOTE_CONSTANTS, 
  QUOTE_STATUS_COLORS, 
  PRIORITY_COLORS,
  SERVICE_TYPE_LABELS,
  PRIORITY_LABELS,
  COMMON_AIRLINES,
  COMMON_AIRPORTS,
  QUOTE_WORKFLOW_STAGES,
} from './constants'

export * from './types'

export {
  getQuotes,
  getQuote,
  getQuotesByCustomer,
  getExpiringQuotes,
  getQuoteStats,
  searchQuotes,
  getQuotesByDeadline,
  getConvertibleQuotes,
} from './queries'

export {
  createQuote,
  updateQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  deleteQuote,
  addPartnerQuote,
  updatePricing,
} from './mutations'

export {
  validateQuoteData,
  validateCurrencyAmount,
  generateQuoteNumber,
  getQuoteStatusColor,
  getPriorityColor,
  getServiceTypeLabel,
  getPriorityLabel,
  calculateTotalPrice,
  calculateChargeableWeight,
  isQuoteExpiring,
  isQuoteExpired,
  canConvertToShipment,
  getQuoteRoute,
  getQuoteTimeRemaining,
  getBestPartnerQuote,
  formatQuoteDisplayName,
  sanitizeQuoteForExport,
  validateQuoteWorkflow,
} from './utils'