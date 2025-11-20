// src/features/boilerplate/payments/providers/stripe-connect/provider.ts
/**
 * Stripe Connect Provider
 *
 * This provider handles marketplace/platform payments with connected accounts.
 * It is NOT for regular subscriptions - use 'stripe-standard' provider for that.
 *
 * Use Cases:
 * - Multi-tenant platforms where clients accept payments
 * - Marketplaces with vendor/seller payments
 * - Platforms that collect application fees
 *
 * Features:
 * - Connected account onboarding
 * - Application fee splitting
 * - Client product management
 * - Payment routing to connected accounts
 */

import type { PaymentProvider } from '../../types';
import { PAYMENT_CONFIG } from '../../config/payment-config';

export const stripeConnectProvider: PaymentProvider = {
  name: 'Stripe Connect',
  type: 'stripe-connect',

  // ============================================================================
  // SUBSCRIPTION METHODS - NOT APPLICABLE FOR MARKETPLACE PROVIDER
  // ============================================================================

  async createCheckout() {
    throw new Error(
      'Stripe Connect is for marketplace payments, not subscriptions. ' +
      'Use useStripeConnectCheckout hook for connected account checkout, ' +
      'or use "stripe-standard" provider for regular subscriptions.'
    );
  },

  async openBillingPortal() {
    throw new Error(
      'Stripe Connect is for marketplace payments. ' +
      'Billing portal is not applicable for connected accounts. ' +
      'Use "stripe-standard" provider for subscription billing.'
    );
  },

  async cancelSubscription() {
    throw new Error(
      'Stripe Connect is for marketplace payments. ' +
      'Subscription management is not applicable. ' +
      'Use "stripe-standard" provider for subscription management.'
    );
  },

  async getSubscription() {
    // Return null - this provider doesn't handle subscriptions
    return null;
  },

  // ============================================================================
  // FEATURE ACCESS METHODS - ADAPTED FOR CONNECTED ACCOUNT STATUS
  // ============================================================================

  async checkAccess(featureKey: string) {
    // For Stripe Connect, "feature access" means checking if the connected
    // account has the capability to perform certain actions

    // This is a client-side-only provider - actual checks should use hooks
    throw new Error(
      'Stripe Connect feature checks must be done client-side. ' +
      'Use useStripeConnectAccount hook to check account capabilities.'
    );
  },

  async trackUsage() {
    // For Stripe Connect, usage tracking isn't about feature limits,
    // but could track transaction volume, payment counts, etc.

    // This is handled by the payment webhooks and mutations
    throw new Error(
      'Stripe Connect usage tracking is handled automatically via webhooks. ' +
      'Payment events are recorded in clientPayments and connectEvents tables.'
    );
  },

  async getUsageStats(featureKey?: string) {
    // Usage stats for Stripe Connect would be payment analytics,
    // revenue metrics, transaction counts, etc.

    throw new Error(
      'Stripe Connect analytics must be accessed client-side. ' +
      'Use useStripeConnectPayments or useStripeConnectAnalytics hooks.'
    );
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isConfigured(): boolean {
    return PAYMENT_CONFIG.enabledProviders['stripe-connect'] || false;
  },
};

/**
 * Helper function to check if Stripe Connect provider is available
 */
export function isStripeConnectEnabled(): boolean {
  return stripeConnectProvider.isConfigured();
}

/**
 * Stripe Connect-specific operations
 *
 * These operations are specific to the marketplace/connected accounts use case.
 * They don't fit the standard PaymentProvider interface.
 *
 * Access these via dedicated hooks:
 * - useStripeConnectAccount() - Connected account management
 * - useStripeConnectOnboarding() - Account onboarding flow
 * - useStripeConnectProducts() - Product management for connected accounts
 * - useStripeConnectCheckout() - Create checkout sessions for connected accounts
 * - useStripeConnectPayments() - View payment history and analytics
 */
export const StripeConnectOperations = {
  /**
   * Operations that are unique to Stripe Connect:
   * - Create connected Express account
   * - Generate onboarding links
   * - Manage connected account products
   * - Create checkout with application fees
   * - Process platform fee distribution
   * - Handle account webhooks
   *
   * These are accessed via hooks, not through this provider interface.
   */
} as const;
