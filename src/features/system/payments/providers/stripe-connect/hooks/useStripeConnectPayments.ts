// src/features/system/payments/providers/stripe-connect/hooks/useStripeConnectPayments.ts
/**
 * Stripe Connect Payments Hook
 *
 * View payment history and analytics for connected accounts
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useStripeConnectAccount } from './useStripeConnectAccount';

/**
 * Hook for viewing payment history on a connected account
 *
 * @returns Payment list, analytics, and loading state
 *
 * @example
 * ```tsx
 * function PaymentDashboard() {
 *   const { payments, totalRevenue, platformFees, netRevenue, isLoading } = useStripeConnectPayments();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h2>Revenue: ${(totalRevenue / 100).toFixed(2)}</h2>
 *       <h3>Platform Fees: ${(platformFees / 100).toFixed(2)}</h3>
 *       <h3>Net Revenue: ${(netRevenue / 100).toFixed(2)}</h3>
 *       <PaymentList payments={payments} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useStripeConnectPayments() {
  const { account } = useStripeConnectAccount();

  // Query payments for this connected account
  const payments = useQuery(
    api.lib.system.payments.stripe_connect.queries.getPaymentsByAccount,
    account?._id ? { connectedAccountId: account._id } : 'skip'
  );

  // Query payment analytics
  const analytics = useQuery(
    api.lib.system.payments.stripe_connect.queries.getAccountAnalytics,
    account?._id ? { accountId: account._id } : 'skip'
  );

  // Loading states
  const isLoading = (payments === undefined || analytics === undefined) && !!account;

  // Revenue calculations
  const totalRevenue = analytics?.totalRevenue || 0;
  const platformFees = analytics?.totalApplicationFees || 0;
  const netRevenue = totalRevenue - platformFees;
  const paymentCount = payments?.length || 0;

  // Successful payments
  const successfulPayments = payments?.filter((p) => p.status === 'succeeded') || [];
  const successfulCount = successfulPayments.length;
  const successfulRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Failed payments
  const failedPayments = payments?.filter((p) => p.status === 'failed') || [];
  const failedCount = failedPayments.length;

  // Pending payments
  const pendingPayments = payments?.filter((p) => p.status === 'pending') || [];
  const pendingCount = pendingPayments.length;

  return {
    // Payments
    payments,
    successfulPayments,
    failedPayments,
    pendingPayments,

    // Counts
    paymentCount,
    successfulCount,
    failedCount,
    pendingCount,

    // Revenue (in cents)
    totalRevenue,
    platformFees,
    netRevenue,
    successfulRevenue,

    // Analytics
    analytics,

    // Loading
    isLoading,
  };
}

/**
 * Hook for platform-wide payment analytics (admin only)
 *
 * Shows aggregate data across all connected accounts
 */
export function usePlatformPaymentAnalytics() {
  // Query platform-wide analytics
  const analytics = useQuery(api.lib.system.payments.stripe_connect.queries.getPlatformAnalytics);

  return {
    analytics,
    isLoading: analytics === undefined,

    // Totals
    totalRevenue: analytics?.totalRevenue || 0,
    totalPlatformFees: analytics?.totalApplicationFees || 0,
    totalPayments: analytics?.totalPayments || 0,
    activeAccounts: analytics?.activeAccountCount || 0,
  };
}
