// convex/lib/yourobc/quotes/index.ts
// Public API exports for quotes module

// Constants
export { QUOTES_CONSTANTS, QUOTES_VALUES } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateQuoteData,
  buildSearchableText,
  formatQuoteDisplayName,
  calculateTotalPrice,
  calculateValidityPeriodDays,
  isQuoteEditable,
  isQuoteExpired,
  canSendQuote,
  canAcceptQuote,
  canRejectQuote,
  canConvertToShipment,
  trimQuoteData,
} from './utils';

// Permissions
export {
  canViewQuote,
  canEditQuote,
  canDeleteQuote,
  canSendQuote as canSendQuotePermission,
  canAcceptOrRejectQuote,
  canConvertQuote,
  requireViewQuoteAccess,
  requireEditQuoteAccess,
  requireDeleteQuoteAccess,
  requireSendQuoteAccess,
  requireAcceptOrRejectQuoteAccess,
  requireConvertQuoteAccess,
  filterQuotesByAccess,
} from './permissions';

// Queries
export {
  getQuotes,
  getQuote,
  getQuoteByPublicId,
  getQuoteByQuoteNumber,
  getQuotesByCustomer,
  getQuoteStats,
  getExpiringQuotes,
} from './queries';

// Mutations
export {
  createQuote,
  updateQuote,
  deleteQuote,
  restoreQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  convertQuoteToShipment,
} from './mutations';
