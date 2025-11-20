// src/features/system/payments/providers/stripe/types/stripe.types.ts
/**
 * Stripe Standard Types
 *
 * Type definitions for standard Stripe operations (subscriptions & one-time payments)
 */

import { Id } from '@/convex/_generated/dataModel';

// ============================================
// Customer Types
// ============================================

export interface StripeCustomerData {
  stripeCustomerId: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CustomerResponse {
  success: boolean;
  customerId?: string;
  error?: string;
}

// ============================================
// Subscription Types
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number; // In cents
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
  features?: string[];
  stripePriceId?: string;
  stripeProductId?: string;
  active: boolean;
}

export interface SubscriptionData {
  _id: Id<'stripeSubscriptions'>;
  userId: Id<"userProfiles">;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeProductId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: number;
  trialStart?: number;
  trialEnd?: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface CreateSubscriptionRequest {
  priceId: string;
  customerId?: string;
  email?: string;
  name?: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  sessionId?: string;
  url?: string;
  error?: string;
}

// ============================================
// One-Time Payment Types
// ============================================

export interface OneTimePaymentRequest {
  amount: number; // In cents
  currency?: string;
  description?: string;
  customerId?: string;
  email?: string;
  name?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface PaymentData {
  _id: Id<'stripePayments'>;
  userId?: Id<"userProfiles">;
  stripeCustomerId?: string;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

// ============================================
// Billing Portal Types
// ============================================

export interface BillingPortalRequest {
  customerId: string;
  returnUrl: string;
}

export interface BillingPortalResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// ============================================
// Webhook Types
// ============================================

export type StripeEventType =
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'payment_intent.created'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.refunded'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'checkout.session.completed'
  | 'checkout.session.expired';

export interface StripeWebhookEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: any;
  };
  created: number;
}

// ============================================
// Usage-Based Billing Types (Optional)
// ============================================

export interface UsageRecord {
  quantity: number;
  timestamp?: number;
  action?: 'set' | 'increment';
}

export interface UsageResponse {
  success: boolean;
  usageRecordId?: string;
  error?: string;
}

// ============================================
// Refund Types
// ============================================

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // In cents, optional for partial refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}
