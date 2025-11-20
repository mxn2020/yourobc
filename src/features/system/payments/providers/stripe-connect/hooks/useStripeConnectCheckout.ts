// src/features/boilerplate/payments/providers/stripe-connect/hooks/useStripeConnectCheckout.ts
/**
 * Stripe Connect Checkout Hook
 *
 * Creates checkout sessions for connected account products
 */

import { useState } from 'react';
import { useStripeConnectAccount } from './useStripeConnectAccount';

interface CheckoutOptions {
  priceId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Hook for creating checkout sessions on connected accounts
 *
 * @returns Function to create checkout sessions with application fees
 *
 * @example
 * ```tsx
 * function BuyButton({ priceId }) {
 *   const { createCheckout, isCreating } = useStripeConnectCheckout();
 *
 *   const handleClick = async () => {
 *     const result = await createCheckout({
 *       priceId,
 *       successUrl: window.location.origin + '/success',
 *       cancelUrl: window.location.origin + '/cancel',
 *     });
 *
 *     if (result.success && result.url) {
 *       window.location.href = result.url;
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isCreating}>
 *       {isCreating ? 'Loading...' : 'Buy Now'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStripeConnectCheckout() {
  const { account, stripeAccountId, canAcceptPayments } = useStripeConnectAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a checkout session for the connected account
   *
   * This will automatically apply the platform's application fee
   * as configured in the environment variables
   */
  const createCheckout = async (options: CheckoutOptions): Promise<CheckoutResult> => {
    if (!stripeAccountId) {
      return { success: false, error: 'No connected account found' };
    }

    if (!canAcceptPayments) {
      return { success: false, error: 'Connected account cannot accept payments yet. Complete onboarding first.' };
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call API route to create checkout session
      const response = await fetch('/api/payments/stripe-connect/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          priceId: options.priceId,
          quantity: options.quantity || 1,
          successUrl: options.successUrl || `${window.location.origin}/payment/success`,
          cancelUrl: options.cancelUrl || `${window.location.origin}/payment/cancel`,
          customerEmail: options.customerEmail,
          metadata: options.metadata || {},
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
    // Account status
    canAcceptPayments,
    stripeAccountId,

    // Actions
    createCheckout,

    // State
    isCreating,
    error,
  };
}
