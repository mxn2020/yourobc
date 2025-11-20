// src/features/boilerplate/payments/providers/autumn-betterauth/hooks/useAutumnCheckout.ts
/**
 * Autumn Checkout Hook
 */

import { useCallback } from 'react';
import { useAutumnCustomer, CheckoutDialog } from './useAutumnCustomer';
import type { CheckoutOptions, CheckoutResult } from '../../../types';

export function useAutumnCheckout() {
  const { attach } = useAutumnCustomer();

  const createCheckout = useCallback(
    async (options: CheckoutOptions): Promise<CheckoutResult> => {
      try {
        const result = await attach({
          productId: options.planId,
          dialog: CheckoutDialog,
          metadata: options.metadata,
        });

        // Handle autumn-js Result type
        if (result.error) {
          return {
            error: result.error.message || 'Checkout failed',
          };
        }

        // Type assertion needed as data is a union type
        const data = result.data as any;
        return {
          url: data?.checkout_url,
          sessionId: undefined, // Autumn-js doesn't provide sessionId
        };
      } catch (error) {
        console.error('Autumn checkout error:', error);
        return {
          error: error instanceof Error ? error.message : 'Checkout failed',
        };
      }
    },
    [attach]
  );

  return {
    createCheckout,
  };
}