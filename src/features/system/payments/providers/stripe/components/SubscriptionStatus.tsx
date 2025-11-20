// src/features/boilerplate/payments/providers/stripe/components/SubscriptionStatus.tsx
/**
 * Subscription Status Component
 *
 * Displays current subscription status and management options
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { CheckCircle2, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';

interface SubscriptionStatusProps {
  showDetails?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Component to display subscription status
 *
 * @example
 * ```tsx
 * <SubscriptionStatus showDetails={true} showActions={true} />
 * ```
 */
export function SubscriptionStatus({
  showDetails = true,
  showActions = true,
  className,
}: SubscriptionStatusProps) {
  const {
    subscription,
    isActive,
    isTrialing,
    isCanceled,
    isPastDue,
    willCancelAtPeriodEnd,
    currentPeriodEnd,
    cancelSubscription,
    resumeSubscription,
    isLoading,
    isCanceling,
    isResuming,
  } = useStripeSubscription();

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

  if (!subscription) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>You don't have an active subscription.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Status badge
  const StatusBadge = () => {
    if (isActive) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    if (isTrialing) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Trial
        </Badge>
      );
    }
    if (isPastDue) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Past Due
        </Badge>
      );
    }
    if (isCanceled) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Canceled
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        {subscription.status}
      </Badge>
    );
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle cancel
  const handleCancel = async () => {
    const confirmed = confirm(
      'Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.'
    );
    if (confirmed) {
      await cancelSubscription();
    }
  };

  // Handle resume
  const handleResume = async () => {
    await resumeSubscription();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription className="mt-1">
              {willCancelAtPeriodEnd
                ? `Cancels on ${currentPeriodEnd ? formatDate(currentPeriodEnd) : 'N/A'}`
                : `Renews on ${currentPeriodEnd ? formatDate(currentPeriodEnd) : 'N/A'}`}
            </CardDescription>
          </div>
          <StatusBadge />
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4">
          {/* Cancellation Warning */}
          {willCancelAtPeriodEnd && (
            <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Subscription Ending
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will end on {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'N/A'}.
                    You'll continue to have access until then.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Details */}
          <div className="space-y-3">
            {/* Current Period */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Current Period</p>
                <p className="text-sm text-gray-600">
                  {currentPeriodEnd ? formatDate(currentPeriodEnd) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Subscription ID */}
            <div>
              <p className="text-sm font-medium text-gray-700">Subscription ID</p>
              <p className="text-xs text-gray-600 font-mono">
                {subscription.stripeSubscriptionId}
              </p>
            </div>
          </div>

          {/* Actions */}
          {showActions && (isActive || isTrialing || willCancelAtPeriodEnd) && (
            <div className="flex gap-2 pt-2">
              {willCancelAtPeriodEnd ? (
                <Button
                  onClick={handleResume}
                  disabled={isResuming}
                  variant="primary"
                  size="sm"
                >
                  {isResuming ? 'Resuming...' : 'Resume Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={handleCancel}
                  disabled={isCanceling}
                  variant="outline"
                  size="sm"
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
