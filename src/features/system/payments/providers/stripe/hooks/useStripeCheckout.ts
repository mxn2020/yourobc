// src/features/system/payments/providers/stripe/hooks/useStripeCheckout.ts
/**
 * Stripe Checkout Hook
 *
 * Creates checkout sessions for subscriptions and one-time payments
 */

import { useState } from 'react';
import { useStripeCustomer } from './useStripeCustomer';

interface CheckoutOptions {
  priceId?: string; // For subscriptions
  amount?: number; // For one-time payments (in cents)
  currency?: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Hook for creating Stripe checkout sessions
 *
 * @returns Checkout functions and loading states
 *
 * @example
 * ```tsx
 * function SubscribeButton({ priceId }: { priceId: string }) {
 *   const { createSubscriptionCheckout, isCreating } = useStripeCheckout();
 *
 *   const handleSubscribe = async () => {
 *     const result = await createSubscriptionCheckout({
 *       priceId,
 *       successUrl: window.location.origin + '/success',
 *       cancelUrl: window.location.origin + '/pricing',
 *     });
 *
 *     if (result.success && result.url) {
 *       window.location.href = result.url;
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSubscribe} disabled={isCreating}>
 *       {isCreating ? 'Loading...' : 'Subscribe'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStripeCheckout() {
  const { stripeCustomerId, user } = useStripeCustomer();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a subscription checkout session
   */
  const createSubscriptionCheckout = async (
    options: CheckoutOptions
  ): Promise<CheckoutResult> => {
    if (!options.priceId) {
      return { success: false, error: 'Price ID is required for subscription checkout' };
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: options.priceId,
          customerId: stripeCustomerId,
          email: user?.email,
          name: user?.name,
          successUrl: options.successUrl || `${window.location.origin}/dashboard?success=true`,
          cancelUrl: options.cancelUrl || window.location.href,
          trialPeriodDays: options.trialPeriodDays,
          metadata: options.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
        sessionId: data.sessionId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create a one-time payment checkout session
   */
  const createPaymentCheckout = async (options: CheckoutOptions): Promise<CheckoutResult> => {
    if (!options.amount) {
      return { success: false, error: 'Amount is required for payment checkout' };
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency || 'usd',
          description: options.description,
          customerId: stripeCustomerId,
          email: user?.email,
          name: user?.name,
          successUrl: options.successUrl || `${window.location.origin}/success`,
          cancelUrl: options.cancelUrl || window.location.href,
          metadata: options.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
        sessionId: data.sessionId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // Actions
    createSubscriptionCheckout,
    createPaymentCheckout,

    // State
    isCreating,
    error,

    // Customer info
    stripeCustomerId,
  };
}
