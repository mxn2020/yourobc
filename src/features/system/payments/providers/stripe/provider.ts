// src/features/system/payments/providers/stripe/provider.ts
/**
 * Stripe Standard Provider
 *
 * This provider handles regular SaaS subscriptions and one-time payments.
 * It is NOT for marketplace/platform payments - use 'stripe-connect' for that.
 *
 * Use Cases:
 * - Regular SaaS subscription billing
 * - One-time payments for products/services
 * - Usage-based billing
 * - Customer self-service billing portal
 *
 * Features:
 * - Subscription management (create, cancel, resume)
 * - One-time payment checkout
 * - Billing portal access
 * - Feature access control based on plan
 * - Usage tracking and limits
 */

import type { PaymentProvider, CheckoutOptions, CheckoutResult, FeatureAccess, UsageStats, Subscription } from '../../types';
import { PAYMENT_CONFIG } from '../../config/payment-config';

export const stripeProvider: PaymentProvider = {
  name: 'Stripe',
  type: 'stripe-standard',

  // ============================================================================
  // SUBSCRIPTION METHODS
  // ============================================================================

  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    if (!options.planId) {
      return {
        success: false,
        error: 'Plan ID is required for checkout',
      };
    }

    try {
      // Get the plan configuration
      const plan = PAYMENT_CONFIG.plans.find((p) => p.id === options.planId);

      if (!plan) {
        return {
          success: false,
          error: `Plan not found: ${options.planId}`,
        };
      }

      if (!plan.stripePriceId) {
        return {
          success: false,
          error: `Plan ${options.planId} does not have a Stripe price ID configured`,
        };
      }

      // Call the API to create checkout session
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          successUrl: options.successUrl || `${window.location.origin}/success`,
          cancelUrl: options.cancelUrl || window.location.href,
          trialPeriodDays: options.trialDays,
          metadata: {
            planId: options.planId,
            ...options.metadata,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to create checkout session',
        };
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return {
        success: true,
        sessionId: data.sessionId,
        url: data.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async openBillingPortal(returnUrl?: string): Promise<void> {
    try {
      // This method needs customer ID - should be called from a component
      // that has access to the customer data via useStripeCustomer hook
      throw new Error(
        'Use useStripeBillingPortal hook to open the billing portal. ' +
        'This provides proper customer context and error handling.'
      );
    } catch (error) {
      throw error;
    }
  },

  async cancelSubscription(immediate: boolean = false): Promise<void> {
    try {
      // This method needs subscription ID - should be called from a component
      // that has access to subscription data via useStripeSubscription hook
      throw new Error(
        'Use useStripeSubscription hook to cancel subscriptions. ' +
        'This provides proper subscription context and error handling.'
      );
    } catch (error) {
      throw error;
    }
  },

  async getSubscription(): Promise<Subscription | null> {
    // This is meant to be called client-side only
    // Use useStripeSubscription hook instead
    throw new Error(
      'Use useStripeSubscription hook to access subscription data. ' +
      'This provider method is for framework integration only.'
    );
  },

  // ============================================================================
  // FEATURE ACCESS METHODS
  // ============================================================================

  async checkAccess(featureKey: string): Promise<FeatureAccess> {
    // This would require subscription context
    // In practice, use the useStripeSubscription hook client-side
    // and check features based on the active plan

    throw new Error(
      'Feature access checks should be done client-side using useStripeSubscription hook. ' +
      'Check subscription.status and subscription.stripePriceId to determine feature access.'
    );
  },

  async trackUsage(
    featureKey: string,
    quantity: number,
    options?: { unit?: string; context?: string; metadata?: Record<string, any> }
  ): Promise<void> {
    // Usage tracking for metered billing
    // This would integrate with Stripe's usage reporting API

    throw new Error(
      'Usage tracking is not yet implemented for Stripe provider. ' +
      'For metered billing, integrate with Stripe Usage Records API directly.'
    );
  },

  async getUsageStats(featureKey?: string): Promise<UsageStats | Record<string, UsageStats>> {
    // Get usage statistics from Stripe
    throw new Error(
      'Usage statistics retrieval is not yet implemented. ' +
      'For metered billing, query Stripe Usage Records API directly.'
    );
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isConfigured(): boolean {
    // Check if Stripe is properly configured
    const hasPublishableKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;

    return hasPublishableKey && hasSecretKey;
  },
};
