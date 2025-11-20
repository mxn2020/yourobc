// src/features/boilerplate/payments/providers/stripe/hooks/useStripeCustomer.ts

import { Id } from "@/convex/_generated/dataModel";

/**
 * Stripe Customer Hook
 *
 * Manages Stripe customer data and operations
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/boilerplate/auth/hooks/useAuth';

/**
 * Hook for managing Stripe customer data
 *
 * @returns Customer data and loading state
 *
 * @example
 * ```tsx
 * function CustomerInfo() {
 *   const { customer, stripeCustomerId, isLoading } = useStripeCustomer();
 *
 *   if (isLoading) return <Loading />;
 *   if (!customer) return <div>No customer data</div>;
 *
 *   return <div>Customer ID: {stripeCustomerId}</div>;
 * }
 * ```
 */
export function useStripeCustomer() {
  const { user } = useAuth();

  if (!user) {
    return {
      customer: null,
      stripeCustomerId: null,
      exists: false,
      isLoading: false,
      user: null,
    };
  }

  // Query customer data from Convex
  const customer = useQuery(
    api.lib.boilerplate.payments.stripe.queries.getCustomerByUserId,
    {}
  );

  // Loading state
  const isLoading = customer === undefined && !!user;

  // Customer exists
  const exists = !!customer;

  // Stripe customer ID
  const stripeCustomerId = customer?.stripeCustomerId;

  return {
    // Customer data
    customer,
    stripeCustomerId,
    exists,

    // State
    isLoading,

    // User info
    user,
  };
}
