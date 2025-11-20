// src/features/boilerplate/payments/providers/autumn-betterauth/hooks/useAutumnCustomer.ts
/**
 * Autumn Customer Hook
 * 
 * Re-exports and enhances the autumn-js/react useCustomer hook
 */

import { useCustomer } from 'autumn-js/react';
import type { PaymentProvider } from '../../../types';

/**
 * Hook to access Autumn customer data and functions
 * 
 * This is a thin wrapper around autumn-js/react's useCustomer
 */
export function useAutumnCustomer() {
  const customer = useCustomer();
  
  // Get the primary active product as the "subscription"
  // Autumn allows customers to have multiple products, but typically
  // there's one main subscription product
  const primaryProduct = customer.customer?.products?.find(
    p => p.status === 'active' && !p.is_add_on
  ) || customer.customer?.products?.[0] || null;
  
  return {
    ...customer,
    
    // Map the primary product to subscription for compatibility
    subscription: primaryProduct,
    
    // Also expose all products for more complex use cases
    products: customer.customer?.products || [],
    
    isLoading: customer.isLoading,
  };
}

// Export CheckoutDialog (AttachDialog has been replaced)
export { CheckoutDialog, PaywallDialog } from 'autumn-js/react';

// Note: Use CheckoutDialog with both attach() and checkout() methods
// Example: await attach({ productId: "pro", dialog: CheckoutDialog })