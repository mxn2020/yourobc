// convex/lib/software/yourobc/invoices/index.ts
// Public API exports for invoices module

// Constants
export { INVOICES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateInvoiceData,
  validateLineItem,
  validateCurrencyAmount,
  validatePaymentData,
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
  trimInvoiceData,
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
