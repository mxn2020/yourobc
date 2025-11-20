// src/features/system/payments/providers/stripe-connect/components/ProductList.tsx
/**
 * Product List Component
 *
 * Displays products for a connected account
 */

import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading } from '@/components/ui';
import { useStripeConnectProducts } from '../hooks/useStripeConnectProducts';
import { Package, ToggleLeft, ToggleRight } from 'lucide-react';

interface ProductListProps {
  showInactive?: boolean;
  onProductClick?: (productId: string) => void;
}

/**
 * Component to display connected account products
 *
 * @example
 * ```tsx
 * <ProductList
 *   showInactive={true}
 *   onProductClick={(id) => console.log('Clicked:', id)}
 * />
 * ```
 */
export function ProductList({ showInactive = false, onProductClick }: ProductListProps) {
  const { products, isLoading, toggleProductStatus } = useStripeConnectProducts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first product.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter products based on showInactive prop
  const displayedProducts = showInactive
    ? products
    : products.filter((p) => p.active);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatInterval = (interval?: string, count?: number) => {
    if (!interval) return 'one-time';
    const countStr = count && count > 1 ? `${count} ` : '';
    return `${countStr}${interval}${count && count > 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({displayedProducts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => product.stripeProductId && onProductClick?.(product.stripeProductId)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  {product.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {product.interval && product.interval !== 'one_time' && (
                    <Badge variant="secondary">Subscription</Badge>
                  )}
                </div>
                {product.description && (
                  <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {formatPrice(product.amount, product.currency)}
                  </span>
                  {product.interval && product.interval !== 'one_time' && (
                    <span>
                      / {product.interval}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.stripeProductId) {
                    toggleProductStatus(product.stripeProductId, !product.active);
                  }
                }}
              >
                {product.active ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
