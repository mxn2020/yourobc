// convex/schema/boilerplate/stripe/stripe/validators.ts
// Grouped validators for stripe module

import { v } from 'convex/values';

/**
 * Stripe Validators
 *
 * Centralized validation schemas for all stripe entities
 */
export const stripeValidators = {
  // Subscription Status
  subscriptionStatus: v.union(
    v.literal('active'),
    v.literal('canceled'),
    v.literal('incomplete'),
    v.literal('incomplete_expired'),
    v.literal('past_due'),
    v.literal('trialing'),
    v.literal('unpaid')
  ),

  // Payment Status
  paymentStatus: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('succeeded'),
    v.literal('failed'),
    v.literal('canceled'),
    v.literal('refunded')
  ),

  // Currency Code (ISO 4217)
  currency: v.string(),

  // Customer Status
  customerStatus: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('suspended')
  ),

  // Billing Interval
  billingInterval: v.union(
    v.literal('day'),
    v.literal('week'),
    v.literal('month'),
    v.literal('year')
  ),

  // Invoice Status
  invoiceStatus: v.union(
    v.literal('draft'),
    v.literal('open'),
    v.literal('paid'),
    v.literal('uncollectible'),
    v.literal('void')
  ),

  // Webhook Event Type
  webhookEventType: v.string(),

  // Webhook Status
  webhookStatus: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('succeeded'),
    v.literal('failed'),
    v.literal('retrying')
  ),
} as const;
