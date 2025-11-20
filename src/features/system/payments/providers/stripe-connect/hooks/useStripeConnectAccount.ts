// src/features/boilerplate/payments/providers/stripe-connect/hooks/useStripeConnectAccount.ts
/**
 * Stripe Connect Account Hook
 *
 * Manages the current user's connected account
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/boilerplate/auth';

/**
 * Hook to get and manage the connected Stripe account for the current user
 *
 * @returns Connected account data, loading state, and account status helpers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { account, isLoading, isActive, canAcceptPayments, needsOnboarding } = useStripeConnectAccount();
 *
 *   if (isLoading) return <Loading />;
 *   if (!account) return <CreateAccountButton />;
 *   if (needsOnboarding) return <CompleteOnboardingButton />;
 *   if (!canAcceptPayments) return <AccountRestricted />;
 *
 *   return <Dashboard account={account} />;
 * }
 * ```
 */
export function useStripeConnectAccount() {
  const { user } = useAuth();

  // Query connected account by user email
  const account = useQuery(
    api.lib.boilerplate.payments.stripe_connect.queries.getConnectedAccountByEmail,
    user?.email ? { email: user.email } : 'skip'
  );

  // Loading state
  const isLoading = account === undefined && !!user?.email;

  // Account status helpers
  const exists = account !== null && account !== undefined;
  const isActive = account?.accountStatus === 'active';
  const isPending = account?.accountStatus === 'pending';
  const isOnboarding = account?.accountStatus === 'onboarding';
  const isRestricted = account?.accountStatus === 'restricted';
  const isDisabled = account?.accountStatus === 'disabled';

  // Capability checks
  const onboardingCompleted = account?.onboarding_completed || false;
  const detailsSubmitted = account?.details_submitted || false;
  const chargesEnabled = account?.charges_enabled || false;
  const payoutsEnabled = account?.payouts_enabled || false;

  // Derived states
  const needsOnboarding = exists && !onboardingCompleted;
  const canAcceptPayments = exists && isActive && chargesEnabled;
  const canReceivePayouts = exists && isActive && payoutsEnabled;

  // Capabilities
  const capabilities = {
    cardPayments: account?.capabilities?.card_payments === 'active',
    transfers: account?.capabilities?.transfers === 'active',
  };

  // Account details
  const stripeAccountId = account?.stripeAccountId;
  const clientName = account?.clientName;
  const clientEmail = account?.clientEmail;
  const defaultCurrency = account?.default_currency || 'usd';
  const statementDescriptor = account?.statement_descriptor;

  return {
    // Raw account data
    account,

    // Loading state
    isLoading,

    // Existence
    exists,

    // Status flags
    isActive,
    isPending,
    isOnboarding,
    isRestricted,
    isDisabled,

    // Onboarding status
    onboardingCompleted,
    detailsSubmitted,
    needsOnboarding,

    // Capabilities
    chargesEnabled,
    payoutsEnabled,
    canAcceptPayments,
    canReceivePayouts,
    capabilities,

    // Account details
    stripeAccountId,
    clientName,
    clientEmail,
    defaultCurrency,
    statementDescriptor,
  };
}

/**
 * Hook to check if Stripe Connect is available for the current user
 *
 * Lighter version that only checks existence without loading full account data
 */
export function useHasStripeConnectAccount(): boolean {
  const { account, isLoading } = useStripeConnectAccount();
  if (isLoading) return false;
  return account !== null && account !== undefined;
}
