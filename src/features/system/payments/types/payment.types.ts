// src/features/boilerplate/payments/types/payment.types.ts

import { Id } from "@/convex/_generated/dataModel";

/**
 * Common Payment Types
 * 
 * Shared interfaces that all payment providers must implement
 */

/**
 * Subscription status - common across all providers
 */
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'cancelled'
  | 'past_due'
  | 'inactive'
  | 'unpaid';

/**
 * Plan type
 */
export type PlanType = 'free' | 'paid';

/**
 * Billing interval
 */
export type BillingInterval = 'month' | 'year' | 'one_time' | 'day' | 'week';

/**
 * Common subscription interface
 */
export interface Subscription {
  id: string;
  userId: Id<"userProfiles">;
  planId: string;
  planName: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  trialEndDate?: number;
  metadata?: Record<string, any>;
}

/**
 * Feature access result
 */
export interface FeatureAccess {
  hasAccess: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  remaining?: number;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  featureKey: string;
  currentUsage: number;
  limit?: number;
  remaining?: number;
  resetAt?: number;
}

/**
 * Checkout options
 */
export interface CheckoutOptions {
  planId: string;
  trialDays?: number;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Checkout result
 */
export interface CheckoutResult {
  success?: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Pricing plan feature
 */
export interface PlanFeature {
  key: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

/**
 * Pricing plan
 */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  displayPrice: string;
  currency: string;
  interval: BillingInterval;
  intervalDisplay: string;
  features: PlanFeature[];
  limits?: Record<string, number>;
  isPopular?: boolean;
  trialDays?: number;
  ctaText: string;
  stripePriceId?: string; // Stripe price ID for standard Stripe integration
  metadata?: Record<string, any>;
}
