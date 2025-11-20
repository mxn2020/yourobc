// src/features/boilerplate/payments/providers/stripe/hooks/useStripeSubscription.ts

import { Id } from "@/convex/_generated/dataModel";

/**
 * Stripe Subscription Hook
 *
 * Manages user subscriptions
 */

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/boilerplate/auth/hooks/useAuth';
import type { SubscriptionData } from '../types';

interface CancelResult {
  success: boolean;
  error?: string;
}

/**
 * Hook for managing Stripe subscriptions
 *
 * @returns Subscription data, status helpers, and management functions
 *
 * @example
 * ```tsx
 * function SubscriptionStatus() {
 *   const {
 *     subscription,
 *     isActive,
 *     isCanceled,
 *     cancelSubscription,
 *     resumeSubscription,
 *     isLoading
 *   } = useStripeSubscription();
 *
 *   if (isLoading) return <Loading />;
 *   if (!subscription) return <div>No subscription</div>;
 *
 *   return (
 *     <div>
 *       <p>Status: {subscription.status}</p>
 *       {isActive && (
 *         <button onClick={() => cancelSubscription()}>
 *           Cancel Subscription
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStripeSubscription() {
  const { user } = useAuth();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return {
      // Subscription data
      subscription: null,
      allSubscriptions: null,
      stripeSubscriptionId: null,

      // Status
      exists: false,
      isActive: false,
      isTrialing: false,
      isCanceled: false,
      isPastDue: false,
      willCancelAtPeriodEnd: false,

      // Dates
      currentPeriodEnd: null,
      currentPeriodStart: null,

      // Actions
      cancelSubscription: async () => ({ success: false, error: 'No user authenticated' }),
      resumeSubscription: async () => ({ success: false, error: 'No user authenticated' }),

      // State
      isLoading: false,
      isCanceling: false,
      isResuming: false,
      error: 'No user authenticated',
    };
  }

  // Query active subscription for user
  const subscription = useQuery(
    api.lib.boilerplate.payments.stripe.queries.getActiveSubscription,
    {}
  ) as SubscriptionData | undefined | null;

  // Query all subscriptions for user
  const allSubscriptions = useQuery(
    api.lib.boilerplate.payments.stripe.queries.getSubscriptionsByUserId,
    {}
  );

  // Loading state
  const isLoading = subscription === undefined && !!user;

  // Status helpers
  const exists = !!subscription;
  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  const isCanceled = subscription?.status === 'canceled';
  const isPastDue = subscription?.status === 'past_due';
  const willCancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || false;

  // Subscription details
  const stripeSubscriptionId = subscription?.stripeSubscriptionId;
  const currentPeriodEnd = subscription?.currentPeriodEnd;
  const currentPeriodStart = subscription?.currentPeriodStart;

  /**
   * Cancel subscription (at period end by default)
   */
  const cancelSubscription = async (cancelImmediately: boolean = false): Promise<CancelResult> => {
    if (!stripeSubscriptionId) {
      return { success: false, error: 'No active subscription found' };
    }

    setIsCanceling(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: stripeSubscriptionId,
          cancelImmediately,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCanceling(false);
    }
  };

  /**
   * Resume a canceled subscription
   */
  const resumeSubscription = async (): Promise<CancelResult> => {
    if (!stripeSubscriptionId) {
      return { success: false, error: 'No subscription found' };
    }

    if (!willCancelAtPeriodEnd) {
      return { success: false, error: 'Subscription is not set to cancel' };
    }

    setIsResuming(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/resume-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: stripeSubscriptionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume subscription');
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsResuming(false);
    }
  };

  return {
    // Subscription data
    subscription,
    allSubscriptions,
    stripeSubscriptionId,

    // Status
    exists,
    isActive,
    isTrialing,
    isCanceled,
    isPastDue,
    willCancelAtPeriodEnd,

    // Dates
    currentPeriodEnd,
    currentPeriodStart,

    // Actions
    cancelSubscription,
    resumeSubscription,

    // State
    isLoading,
    isCanceling,
    isResuming,
    error,
  };
}
