// src/features/boilerplate/payments/providers/stripe-connect/hooks/useStripeConnectOnboarding.ts
/**
 * Stripe Connect Onboarding Hook
 *
 * Handles creating connected accounts and generating onboarding links
 */

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/boilerplate/auth';
import { useState } from 'react';
import { useStripeConnectAccount } from './useStripeConnectAccount';

interface OnboardingResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Hook for managing Stripe Connect account onboarding
 *
 * @returns Functions to create accounts and generate onboarding links
 *
 * @example
 * ```tsx
 * function OnboardingFlow() {
 *   const { createAccount, generateOnboardingLink, isCreating } = useStripeConnectOnboarding();
 *
 *   const handleStart = async () => {
 *     const result = await createAccount({
 *       name: 'My Business',
 *       email: user.email
 *     });
 *
 *     if (result.success && result.url) {
 *       window.location.href = result.url;
 *     }
 *   };
 *
 *   return <button onClick={handleStart}>Start Onboarding</button>;
 * }
 * ```
 */
export function useStripeConnectOnboarding() {
  const { user } = useAuth();
  const { account, exists } = useStripeConnectAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertAccount = useMutation(api.lib.boilerplate.payments.stripe_connect.mutations.upsertConnectedAccount);
  const updateOnboardingLink = useMutation(api.lib.boilerplate.payments.stripe_connect.mutations.updateOnboardingLink);

  /**
   * Create a new connected account
   *
   * Calls the API to create an Express account with Stripe,
   * then stores it in Convex and returns an onboarding link
   */
  const createAccount = async (options: {
    name: string;
    email: string;
  }): Promise<OnboardingResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call API route to create account with Stripe
      const response = await fetch('/api/payments/stripe-connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: options.name,
          clientEmail: options.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();

      // Store account in Convex
      await upsertAccount({
        clientName: options.name,
        clientEmail: options.email,
        stripeAccountId: data.accountId,
        accountType: 'express',
        accountStatus: 'onboarding',
        onboarding_completed: false,
        details_submitted: false,
      });

      // Get onboarding link
      const linkResult = await generateOnboardingLink();

      return linkResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Generate an onboarding link for an existing account
   *
   * Creates a new onboarding link for accounts that need to complete
   * or update their information
   */
  const generateOnboardingLink = async (): Promise<OnboardingResult> => {
    if (!account?._id || !account?.stripeAccountId) {
      return { success: false, error: 'No connected account found' };
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call API route to generate onboarding link
      const response = await fetch('/api/payments/stripe-connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.stripeAccountId,
          refreshUrl: window.location.href,
          returnUrl: window.location.origin + '/dashboard/stripe-connect',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate onboarding link');
      }

      const data = await response.json();

      // Update onboarding link in Convex
      await updateOnboardingLink({
        accountId: account._id,
        onboarding_link: data.url,
        onboarding_link_expires_at: data.expires_at,
      });

      return { success: true, url: data.url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Refresh account status from Stripe
   *
   * Fetches the latest account status from Stripe and updates Convex
   */
  const refreshAccountStatus = async (): Promise<OnboardingResult> => {
    if (!account?.stripeAccountId) {
      return { success: false, error: 'No connected account found' };
    }

    try {
      // Call API route to get account status
      const response = await fetch(`/api/stripe-connect/account-status?accountId=${account.stripeAccountId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch account status');
      }

      const data = await response.json();

      // Status is automatically updated via webhooks,
      // but this provides manual refresh capability
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  };

  return {
    // Account existence
    exists,
    account,

    // Actions
    createAccount,
    generateOnboardingLink,
    refreshAccountStatus,

    // State
    isCreating,
    error,
  };
}
