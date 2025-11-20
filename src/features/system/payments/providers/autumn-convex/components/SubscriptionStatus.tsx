// src/features/system/payments/providers/autumn-convex/components/SubscriptionStatus.tsx
/**
 * Subscription Status Display
 */

import { useAutumnConvexCustomer } from '../hooks';
import { CreditCard, Calendar } from 'lucide-react';

export function SubscriptionStatus() {
  const { subscription, isLoading } = useAutumnConvexCustomer();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
        <p className="mt-2 text-sm text-gray-600">You're currently on the free plan.</p>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trialing: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{subscription.productName}</h3>
          <p className="mt-1 text-sm text-gray-600">{subscription.description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[subscription.status as keyof typeof statusColors] || statusColors.inactive
          }`}
        >
          {subscription.status}
        </span>
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              ${(subscription.amount / 100).toFixed(2)} / {subscription.interval}
            </p>
          </div>
        </div>

        {subscription.currentPeriodEnd && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}