// convex/lib/yourobc/invoices/index.ts
// Public API exports for invoices module

// Constants & Configuration
export { INVOICES_CONSTANTS } from './constants';

// Types & Interfaces
export type * from './types';

// Utilities, Validation & Helpers
export {
  // Business logic
  calculateInvoiceTotals,
  formatInvoiceDisplayName,
  isInvoiceEditable,
  isInvoiceOverdue,
  calculateDaysUntilDue,
  calculateDaysOverdue,
  getDunningLevelLabel,
  getNextDunningLevel,
  getDunningFee,
  formatCurrencyAmount,
  // Validation & Trimming
  validateInvoiceData,
  validateLineItem,
  validateCurrencyAmount,
  validatePaymentData,
  trimInvoiceData,
  buildSearchableText,
} from './utils';

// Permissions
export {
  canViewInvoice,
  canEditInvoice,
  canDeleteInvoice,
  canProcessPayment,
  canManageDunning,
  canSendInvoice,
  canApproveInvoice,
  requireViewInvoiceAccess,
  requireEditInvoiceAccess,
  requireDeleteInvoiceAccess,
  requireProcessPaymentAccess,
  requireManageDunningAccess,
  requireSendInvoiceAccess,
  requireApproveInvoiceAccess,
  filterInvoicesByAccess,
  isFinanceRole,
  isViewerRole,
  isAdmin,
} from './permissions';

// Queries
export {
  getInvoices,
  getInvoice,
  getInvoiceByPublicId,
  getInvoiceByNumber,
  getInvoiceStats,
  getOverdueInvoices,
  getInvoicesRequiringDunning,
} from './queries';

// Mutations
export {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
  sendInvoice,
  processPayment,
  addCollectionAttempt,
  escalateDunning,
  markAsOverdue,
} from './mutations';
