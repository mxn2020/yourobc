// convex/lib/software/yourobc/quotes/index.ts
/**
 * Quote Module Public API
 *
 * Barrel export file for clean imports of quote module components.
 *
 * @module convex/lib/software/yourobc/quotes
 */

// Constants
export { QUOTES_CONSTANTS } from './constants'

// Types
export type * from './types'

// Utilities
export {
  validateQuoteData,
  formatQuoteDisplayName,
  isQuoteEditable,
  isQuoteExpired,
  isQuoteExpiringSoon,
  calculateValidUntil,
  calculateTotalPrice,
  formatCurrencyAmount,
  canConvertToShipment,
  canSendQuote,
  canAcceptQuote,
  canRejectQuote,
} from './utils'

// Permissions
export {
  canViewQuote,
  canEditQuote,
  canDeleteQuote,
  requireViewQuoteAccess,
  requireEditQuoteAccess,
  requireDeleteQuoteAccess,
  requireSendQuoteAccess,
  requireAcceptQuoteAccess,
  requireRejectQuoteAccess,
  requireConvertToShipmentAccess,
  filterQuotesByAccess,
} from './permissions'

// Queries
export {
  getQuotes,
  getQuote,
  getQuoteByPublicId,
  getQuoteByQuoteNumber,
  getQuotesByCustomer,
  getQuotesByEmployee,
  getExpiringQuotes,
  getExpiredQuotes,
  getQuoteStats,
} from './queries'

// Mutations
export {
  createQuote,
  updateQuote,
  deleteQuote,
  restoreQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  expireQuote,
  convertQuoteToShipment,
} from './mutations'
