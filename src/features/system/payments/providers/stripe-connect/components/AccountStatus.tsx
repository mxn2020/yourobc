// src/features/boilerplate/payments/providers/stripe-connect/components/AccountStatus.tsx
/**
 * Stripe Connect Account Status
 *
 * Displays the current status of the connected Stripe account
 */

import { Card, CardHeader, CardContent, CardTitle, CardDescription, Badge } from '@/components/ui';
import { useStripeConnectAccount } from '../hooks/useStripeConnectAccount';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AccountStatusProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Component to display Stripe Connect account status
 *
 * Shows:
 * - Account status (active, pending, onboarding, restricted)
 * - Capabilities (card payments, transfers)
 * - Onboarding status
 * - Charges/payouts enabled
 *
 * @example
 * ```tsx
 * <AccountStatus showDetails={true} />
 * ```
 */
export function AccountStatus({ showDetails = true, className }: AccountStatusProps) {
  const {
    account,
    isLoading,
    isActive,
    isPending,
    isOnboarding,
    isRestricted,
    isDisabled,
    onboardingCompleted,
    detailsSubmitted,
    chargesEnabled,
    payoutsEnabled,
    capabilities,
    stripeAccountId,
    defaultCurrency,
  } = useStripeConnectAccount();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-3 w-2/3 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Connected Account</CardTitle>
          <CardDescription>You don't have a Stripe Connect account yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Determine status badge
  const StatusBadge = () => {
    if (isActive) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    if (isRestricted) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Restricted
        </Badge>
      );
    }
    if (isDisabled) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Disabled
        </Badge>
      );
    }
    if (isOnboarding) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Onboarding
        </Badge>
      );
    }
    if (isPending) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Connected Account Status</CardTitle>
            <CardDescription className="mt-1">
              {account.clientName || 'Your Business'}
            </CardDescription>
          </div>
          <StatusBadge />
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Account ID */}
          <div>
            <p className="text-sm font-medium text-gray-700">Account ID</p>
            <p className="text-sm text-gray-600 font-mono">{stripeAccountId}</p>
          </div>

          {/* Capabilities */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Capabilities</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {chargesEnabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Charges Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                {payoutsEnabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Payouts Enabled</span>
              </div>
              <div className="flex items-center gap-2">
                {capabilities.cardPayments ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Card Payments</span>
              </div>
              <div className="flex items-center gap-2">
                {capabilities.transfers ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Transfers</span>
              </div>
            </div>
          </div>

          {/* Onboarding Status */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Onboarding</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {onboardingCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Onboarding Completed</span>
              </div>
              <div className="flex items-center gap-2">
                {detailsSubmitted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">Details Submitted</span>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div>
            <p className="text-sm font-medium text-gray-700">Default Currency</p>
            <p className="text-sm text-gray-600 uppercase">{defaultCurrency}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
