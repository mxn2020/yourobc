// convex/schema/boilerplate/payments/payments/validators.ts
// Grouped validators for payments module

import { v } from 'convex/values';

export const paymentsValidators = {
  // Subscription status
  subscriptionStatus: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('cancelled'),
    v.literal('past_due'),
    v.literal('trialing')
  ),

  // Plan type
  planType: v.union(
    v.literal('free'),
    v.literal('paid')
  ),

  // Payment event type
  eventType: v.union(
    v.literal('subscription_created'),
    v.literal('subscription_updated'),
    v.literal('subscription_cancelled'),
    v.literal('payment_succeeded'),
    v.literal('payment_failed'),
    v.literal('trial_started'),
    v.literal('trial_ended'),
    v.literal('plan_upgraded'),
    v.literal('plan_downgraded'),
    v.literal('usage_tracked'),
    v.literal('limit_exceeded'),
    v.literal('other')
  ),

  // Event source
  eventSource: v.union(
    v.literal('autumn'),
    v.literal('app')
  ),

  // Subscription limits object
  limitsObject: v.optional(v.object({
    aiRequests: v.optional(v.number()),
    projects: v.optional(v.number()),
    storage: v.optional(v.number()),
    teamMembers: v.optional(v.number()),
    customFeature: v.optional(v.any()),
  })),

  // Usage object
  usageObject: v.optional(v.object({
    aiRequests: v.optional(v.number()),
    projects: v.optional(v.number()),
    storage: v.optional(v.number()),
    lastResetAt: v.optional(v.number()),
  })),
} as const;
