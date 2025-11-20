// convex/lib/boilerplate/stripe/index.ts
/**
 * Stripe Standard Module Exports
 *
 * Export all queries and mutations for easy access
 */

// Export queries directly (not as namespace)
export {
  getCustomerByUserId,
  getCustomerByStripeId,
  getCustomerByEmail,
  getActiveSubscription,
  getSubscriptionsByUserId,
  getSubscriptionByStripeId,
  getAllActiveSubscriptions,
  getPaymentsByUserId,
  getPaymentByIntentId,
  getSuccessfulPaymentsByUserId,
  getPaymentsByStatus,
  getUserRevenueAnalytics,
  getPlatformRevenueAnalytics,
} from './queries';

// Export mutations directly (not as namespace)
export {
  upsertCustomer,
  deleteCustomer,
  upsertSubscription,
  updateSubscriptionStatus,
  deleteSubscription,
  upsertPayment,
  updatePaymentStatus,
  markPaymentRefunded,
} from './mutations';

// Also export as namespaces for convenience
export * as queries from './queries';
export * as mutations from './mutations';
