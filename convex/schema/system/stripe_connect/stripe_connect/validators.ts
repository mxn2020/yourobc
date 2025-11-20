// convex/schema/boilerplate/stripe_connect/stripe_connect/validators.ts
// Grouped validators for stripe_connect module

import { v } from 'convex/values';

export const stripeConnectValidators = {
  // Account status validator
  accountStatus: v.union(
    v.literal('pending'),
    v.literal('onboarding'),
    v.literal('active'),
    v.literal('restricted'),
    v.literal('disabled')
  ),

  // Account type validator
  accountType: v.literal('express'),

  // Payment status validator
  paymentStatus: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('succeeded'),
    v.literal('failed'),
    v.literal('cancelled'),
    v.literal('refunded')
  ),

  // Payment type validator
  paymentType: v.union(
    v.literal('one_time'),
    v.literal('subscription')
  ),

  // Subscription status validator
  subscriptionStatus: v.union(
    v.literal('active'),
    v.literal('past_due'),
    v.literal('cancelled'),
    v.literal('unpaid')
  ),

  // Billing interval validator
  interval: v.union(
    v.literal('one_time'),
    v.literal('day'),
    v.literal('week'),
    v.literal('month'),
    v.literal('year')
  ),

  // Event type validator
  eventType: v.union(
    v.literal('account_created'),
    v.literal('account_updated'),
    v.literal('account_onboarded'),
    v.literal('payment_created'),
    v.literal('payment_succeeded'),
    v.literal('payment_failed'),
    v.literal('subscription_created'),
    v.literal('subscription_updated'),
    v.literal('subscription_cancelled'),
    v.literal('refund_created'),
    v.literal('webhook_received'),
    v.literal('api_error'),
    v.literal('other')
  ),

  // Event source validator
  eventSource: v.union(
    v.literal('stripe_webhook'),
    v.literal('api_call'),
    v.literal('manual')
  ),

  // Member role validator (for project members pattern)
  memberRole: v.union(
    v.literal('owner'),
    v.literal('admin'),
    v.literal('member'),
    v.literal('viewer')
  ),
} as const;
