// src/features/boilerplate/stripe-connect/types/stripe-connect.types.ts
/**
 * Type Definitions for Stripe Connect
 *
 * Comprehensive types for Stripe Connect Express accounts
 * with application fee support (revenue sharing).
 */

import type Stripe from 'stripe';

// ============================================
// Configuration Types
// ============================================

export interface StripeConnectConfig {
  secretKey: string;
  publishableKey?: string;
  connectClientId?: string;
  webhookSecret?: string;
  applicationFeePercent?: number;
}

// ============================================
// Connected Account Types
// ============================================

export interface ConnectedAccountData {
  clientName: string;
  clientEmail: string;
  stripeAccountId?: string;
  country?: string;
  businessType?: 'individual' | 'company';
  metadata?: Record<string, string>;
}

export interface ConnectedAccountResponse {
  id: string;
  stripeAccountId: string;
  accountStatus: 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_completed: boolean;
}

export interface OnboardingLinkRequest {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}

export interface OnboardingLinkResponse {
  url: string;
  expiresAt: number;
}

export interface AccountStatusResponse {
  accountId: string;
  status: 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  capabilities: {
    card_payments?: 'active' | 'inactive' | 'pending';
    transfers?: 'active' | 'inactive' | 'pending';
  };
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

// ============================================
// Product & Pricing Types
// ============================================

export interface ProductData {
  connectedAccountId: string;
  name: string;
  description?: string;
  amount: number; // in cents
  currency: string;
  interval?: 'one_time' | 'day' | 'week' | 'month' | 'year';
  applicationFeePercent?: number;
  metadata?: Record<string, string>;
}

export interface ProductResponse {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  amount: number;
  currency: string;
  interval?: string;
  applicationFeePercent: number;
  active: boolean;
}

// ============================================
// Checkout & Payment Types
// ============================================

export interface CheckoutRequest {
  connectedAccountId: string;
  productId: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
  expiresAt: number;
}

export interface SubscriptionCheckoutRequest extends CheckoutRequest {
  trialDays?: number;
}

export interface PaymentIntentRequest {
  connectedAccountId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  applicationFeeAmount: number;
}

// ============================================
// Payment Record Types
// ============================================

export interface PaymentRecord {
  id: string;
  connectedAccountId: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeSubscriptionId?: string;
  paymentType: 'one_time' | 'subscription';
  amount: number;
  applicationFeeAmount: number;
  netAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  customerEmail?: string;
  customerName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentListResponse {
  payments: PaymentRecord[];
  hasMore: boolean;
  total: number;
}

// ============================================
// Analytics Types
// ============================================

export interface RevenueAnalyticsData {
  totalPayments: number;
  totalRevenue: number; // Total amount processed
  totalFees: number; // Application fees earned
  netRevenue: number; // Amount clients received
  averagePayment: number;
  successfulPayments: number;
  failedPayments: number;
  period: {
    start: number;
    end: number;
  };
}

export interface ConnectedAccountAnalytics extends RevenueAnalyticsData {
  connectedAccountId: string;
  clientName: string;
  activeSubscriptions: number;
}

// ============================================
// Webhook Types
// ============================================

export interface WebhookEventData {
  type: string;
  data: {
    object: any;
  };
  account?: string;
}

export type ConnectEventType =
  | 'account.updated'
  | 'account.application.deauthorized'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.succeeded'
  | 'charge.failed'
  | 'charge.refunded'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

// ============================================
// Error Types
// ============================================

export interface StripeConnectError {
  error: {
    type: string;
    message: string;
    code?: string;
    decline_code?: string;
    param?: string;
  };
}

// ============================================
// Request/Response Wrappers
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedRequest {
  limit?: number;
  offset?: number;
  startDate?: number;
  endDate?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
  offset: number;
  limit: number;
}

// ============================================
// Fee Calculation Types
// ============================================

export interface FeeCalculation {
  amount: number; // Original amount in cents
  applicationFeePercent: number;
  applicationFeeAmount: number;
  netAmount: number; // Amount after fee
  stripeFeeEstimate?: number; // Estimated Stripe processing fee
  totalFees?: number; // Total of application fee + Stripe fee
}

// ============================================
// Re-export Stripe types for convenience
// ============================================

export type StripeAccount = Stripe.Account;
export type StripeAccountLink = Stripe.AccountLink;
export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripePaymentIntent = Stripe.PaymentIntent;
export type StripePrice = Stripe.Price;
export type StripeProduct = Stripe.Product;
export type StripeSubscription = Stripe.Subscription;
export type StripeCharge = Stripe.Charge;
export type StripeInvoice = Stripe.Invoice;
export type StripeCustomer = Stripe.Customer;
