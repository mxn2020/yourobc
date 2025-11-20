// src/features/system/payments/providers/stripe-connect/components/RevenueAnalytics.tsx
/**
 * Revenue Analytics Component
 *
 * Displays revenue metrics and analytics for connected accounts
 */

import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { useStripeConnectPayments } from '../hooks/useStripeConnectPayments';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';

interface RevenueAnalyticsProps {
  className?: string;
}

/**
 * Component to display revenue analytics for a connected account
 *
 * Shows:
 * - Total revenue
 * - Platform fees
 * - Net revenue
 * - Payment counts
 * - Success rate
 *
 * @example
 * ```tsx
 * <RevenueAnalytics />
 * ```
 */
export function RevenueAnalytics({ className }: RevenueAnalyticsProps) {
  const {
    totalRevenue,
    platformFees,
    netRevenue,
    successfulCount,
    failedCount,
    paymentCount,
    isLoading,
  } = useStripeConnectPayments();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const successRate = paymentCount > 0
    ? ((successfulCount / paymentCount) * 100).toFixed(1)
    : '0.0';

  const metrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Platform Fees',
      value: formatCurrency(platformFees),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Net Revenue',
      value: formatCurrency(netRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Successful Payments',
      value: `${successfulCount} / ${paymentCount}`,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className={className}>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Rate Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Payment Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-gray-200"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="stroke-green-500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${(parseFloat(successRate) / 100) * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{successRate}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {successfulCount} successful
                  </span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-600">
                      {failedCount} failed
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="text-right">
              <p className="text-sm text-gray-600">Fee Percentage</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRevenue > 0
                  ? ((platformFees / totalRevenue) * 100).toFixed(1)
                  : '0.0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
