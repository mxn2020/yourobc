// src/features/boilerplate/payments/providers/stripe-connect/hooks/useStripeConnectProducts.ts
/**
 * Stripe Connect Products Hook
 *
 * Manages products and prices for connected accounts
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useStripeConnectAccount } from './useStripeConnectAccount';

interface CreateProductOptions {
  name: string;
  description?: string;
  price: number; // Amount in cents
  currency?: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount?: number;
  };
  metadata?: Record<string, string>;
}

interface ProductResult {
  success: boolean;
  productId?: string;
  priceId?: string;
  error?: string;
}

/**
 * Hook for managing products on a connected account
 *
 * @returns Product list, creation functions, and loading states
 *
 * @example
 * ```tsx
 * function ProductManager() {
 *   const { products, createProduct, isLoading } = useStripeConnectProducts();
 *
 *   const handleCreate = async () => {
 *     const result = await createProduct({
 *       name: 'Premium Plan',
 *       price: 9900, // $99.00
 *       recurring: { interval: 'month' }
 *     });
 *
 *     if (result.success) {
 *       console.log('Product created:', result.productId);
 *     }
 *   };
 *
 *   return <ProductList products={products} onCreate={handleCreate} />;
 * }
 * ```
 */
export function useStripeConnectProducts() {
  const { account, stripeAccountId } = useStripeConnectAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query products for this connected account
  const products = useQuery(
    api.lib.boilerplate.payments.stripe_connect.queries.getProductsByAccount,
    account?._id ? { connectedAccountId: account._id } : 'skip'
  );

  const upsertProduct = useMutation(api.lib.boilerplate.payments.stripe_connect.mutations.upsertClientProduct);

  /**
   * Create a new product and price for the connected account
   */
  const createProduct = async (options: CreateProductOptions): Promise<ProductResult> => {
    if (!stripeAccountId) {
      return { success: false, error: 'No connected account found' };
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call API route to create product with Stripe
      const response = await fetch('/api/payments/stripe-connect/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: stripeAccountId,
          productName: options.name,
          productDescription: options.description,
          priceAmount: options.price,
          currency: options.currency || 'usd',
          recurring: options.recurring,
          metadata: options.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await response.json();

      // Store product in Convex
      if (account?._id) {
        await upsertProduct({
          accountId: account._id,
          stripeProductId: data.productId,
          stripePriceId: data.priceId,
          name: options.name,
          description: options.description || '',
          amount: options.price,
          currency: options.currency || 'usd',
          interval: options.recurring?.interval || 'one_time',
          active: true,
          metadata: options.metadata || {},
        });
      }

      return {
        success: true,
        productId: data.productId,
        priceId: data.priceId,
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
   * Toggle product active status
   */
  const toggleProductStatus = async (productId: string, active: boolean): Promise<ProductResult> => {
    try {
      // Find product
      const product = products?.find((p) => p.stripeProductId === productId);
      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      // Update in Convex
      await upsertProduct({
        accountId: product.connectedAccountId,
        stripeProductId: product.stripeProductId!,
        stripePriceId: product.stripePriceId!,
        name: product.name,
        description: product.description || '',
        amount: product.amount,
        currency: product.currency,
        interval: product.interval || 'one_time',
        active,
        metadata: product.metadata || {},
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  return {
    // Products
    products,
    isLoading: products === undefined && !!account,

    // Actions
    createProduct,
    toggleProductStatus,

    // State
    isCreating,
    error,
  };
}
