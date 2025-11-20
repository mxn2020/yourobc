// src/features/system/payments/providers/autumn-betterauth/components/SubscriptionStatus.tsx
/**
 * Subscription Status Display
 */

import { useAutumnCustomer } from '../hooks';
import { CreditCard, Calendar, Package } from 'lucide-react';

export function SubscriptionStatus() {
  const { customer, subscription, products } = useAutumnCustomer();

  // Show message if no subscription/products
  if (!subscription && (!products || products.length === 0)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
        <p className="mt-2 text-sm text-gray-600">
          You're currently on the free plan.
        </p>
      </div>
    );
  }

  // Use subscription (primary product) for display
  const product = subscription;
  
  if (!product) return null;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trialing: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
  };

  // Format timestamps (Autumn uses Unix timestamps in milliseconds)
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString();
  };

  // Check if subscription is cancelled
  const isCancelled = product.canceled_at !== null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name || 'Subscription'}
          </h3>
          {product.group && (
            <p className="mt-1 text-sm text-gray-600">{product.group}</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[product.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.status}
        </span>
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        {/* Show product items/features */}
        {product.items && product.items.length > 0 && (
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Included Features</p>
              <ul className="mt-1 space-y-1">
                {product.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {item.feature?.name || item.feature_id}
                    {item.included_usage && item.included_usage !== 'inf' && (
                      <span className="ml-1 text-gray-500">
                        ({item.included_usage} / {item.interval || 'month'})
                      </span>
                    )}
                    {item.included_usage === 'inf' && (
                      <span className="ml-1 text-gray-500">(unlimited)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Show pricing if available */}
        {product.items?.some(item => item.price) && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              {product.items
                .filter(item => item.price)
                .map((item, idx) => (
                  <p key={idx} className="text-sm font-medium text-gray-900">
                    ${(item.price! / 100).toFixed(2)}
                    {item.interval && ` / ${item.interval}`}
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* Show billing period */}
        {product.current_period_end && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {isCancelled ? 'Ends on' : 'Renews on'}{' '}
                {formatDate(product.current_period_end)}
              </p>
              {product.current_period_start && (
                <p className="text-xs text-gray-500">
                  Started: {formatDate(product.current_period_start)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Show trial info if in trial */}
        {product.status === 'trialing' && product.trial_ends_at && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              Trial ends on {formatDate(product.trial_ends_at)}
            </p>
          </div>
        )}

        {/* Show cancellation info */}
        {isCancelled && product.canceled_at && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Cancelled on {formatDate(product.canceled_at)}
            </p>
          </div>
        )}
      </div>

      {/* Show add-ons if any */}
      {products && products.length > 1 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Add-ons</p>
          <div className="space-y-2">
            {products
              .filter(p => p.is_add_on && p.status === 'active')
              .map((addon) => (
                <div key={addon.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{addon.name || addon.id}</span>
                  <span className="text-gray-500">{addon.status}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}