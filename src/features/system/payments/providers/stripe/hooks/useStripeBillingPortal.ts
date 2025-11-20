// src/features/boilerplate/payments/providers/stripe/hooks/useStripeBillingPortal.ts
/**
 * Stripe Billing Portal Hook
 *
 * Provides access to Stripe's hosted billing portal
 */

import { useState } from 'react';
import { useStripeCustomer } from './useStripeCustomer';

interface BillingPortalResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Hook for accessing Stripe billing portal
 *
 * The billing portal allows customers to:
 * - Update payment methods
 * - View invoices
 * - Manage subscriptions
 * - Update billing details
 *
 * @returns Function to open billing portal and loading state
 *
 * @example
 * ```tsx
 * function BillingPortalButton() {
 *   const { openBillingPortal, isOpening } = useStripeBillingPortal();
 *
 *   const handleClick = async () => {
 *     const result = await openBillingPortal();
 *     if (result.success && result.url) {
 *       window.location.href = result.url;
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isOpening}>
 *       {isOpening ? 'Loading...' : 'Manage Billing'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useStripeBillingPortal() {
  const { stripeCustomerId } = useStripeCustomer();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Open the billing portal
   */
  const openBillingPortal = async (
    returnUrl?: string
  ): Promise<BillingPortalResult> => {
    if (!stripeCustomerId) {
      return {
        success: false,
        error: 'No customer ID found. Please subscribe first.',
      };
    }

    setIsOpening(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          returnUrl: returnUrl || window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create billing portal session');
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOpening(false);
    }
  };

  return {
    // Actions
    openBillingPortal,

    // State
    isOpening,
    error,

    // Customer info
    stripeCustomerId,
    hasCustomer: !!stripeCustomerId,
  };
}
