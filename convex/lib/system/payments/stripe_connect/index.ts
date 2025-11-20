// convex/lib/boilerplate/stripe-connect/index.ts
/**
 * Stripe Connect Module Exports
 *
 * Export all queries, mutations, constants, types, and utilities for easy access
 */

// Export constants
export { STRIPE_CONNECT_CONSTANTS } from './constants';

// Export types
export type {
  ConnectedAccount,
  ConnectedAccountId,
  AccountStatus,
  AccountType,
  CreateConnectedAccountData,
  UpdateConnectedAccountData,
  ClientProduct,
  ClientProductId,
  Interval,
  CreateProductData,
  UpdateProductData,
  ClientPayment,
  ClientPaymentId,
  PaymentType,
  PaymentStatus,
  SubscriptionStatus,
  CreatePaymentData,
  UpdatePaymentData,
  ConnectEvent,
  ConnectEventId,
  EventType,
  EventSource,
  CreateEventData,
  RevenueAnalytics,
  PaymentStatistics,
  AccountAnalytics,
  PlatformAnalytics,
  AccountFilters,
  ProductFilters,
  PaymentFilters,
  EventFilters,
} from './types';

// Export utilities
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

// Export queries and mutations
export * as queries from './queries';
export * as mutations from './mutations';
