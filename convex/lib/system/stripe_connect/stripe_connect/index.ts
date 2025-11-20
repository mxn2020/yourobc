// convex/lib/boilerplate/stripe_connect/stripe_connect/index.ts
// Public API exports for stripe_connect module

// Constants
export { STRIPE_CONNECT_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCreateConnectedAccountData,
  validateUpdateConnectedAccountData,
  validateCreateProductData,
  validateUpdateProductData,
  validateCreatePaymentData,
  calculateNetAmount,
  calculateApplicationFeeAmount,
  determineAccountStatus,
} from './utils';

// Permissions
export {
  canViewConnectedAccount,
  canEditConnectedAccount,
  canDeleteConnectedAccount,
  requireViewConnectedAccountAccess,
  requireEditConnectedAccountAccess,
  requireDeleteConnectedAccountAccess,
  canViewProduct,
  canEditProduct,
  canDeleteProduct,
  requireViewProductAccess,
  requireEditProductAccess,
  requireDeleteProductAccess,
  canViewPayment,
  requireViewPaymentAccess,
  canViewEvent,
  requireViewEventAccess,
  filterConnectedAccountsByAccess,
  filterProductsByAccess,
  filterPaymentsByAccess,
  filterEventsByAccess,
} from './permissions';

// Queries
export {
  getAllConnectedAccounts,
  getConnectedAccount,
  getConnectedAccountByStripeId,
  getConnectedAccountByEmail,
  getActiveConnectedAccounts,
  getPendingOnboardingAccounts,
  getConnectedAccountByPublicId,
  getProductsByAccount,
  getActiveProductsByAccount,
  getProduct,
  getProductByStripeId,
  getClientProductByPublicId,
  getPaymentsByAccount,
  getPayment,
  getPaymentByStripeId,
  getClientPaymentByPublicId,
  getSuccessfulPayments,
  getPaymentsByStatus,
  getSubscriptionsByAccount,
  getActiveSubscriptionsByAccount,
  getAccountRevenue,
  getPlatformRevenue,
  getAccountPaymentStats,
  getAccountAnalytics,
  getPlatformAnalytics,
  getEventsByAccount,
  getEventsByType,
  getUnprocessedEvents,
} from './queries';

// Mutations
export {
  upsertConnectedAccount,
  updateAccountStatus,
  updateOnboardingLink,
  deleteConnectedAccount,
  createProduct,
  upsertClientProduct,
  updateProduct,
  deleteProduct,
  createPayment,
  updatePaymentStatus,
  updateSubscriptionStatus,
  markPaymentRefunded,
  updatePaymentByStripeId,
  logConnectEvent,
  markEventProcessed,
  syncAccountFromStripe,
} from './mutations';
