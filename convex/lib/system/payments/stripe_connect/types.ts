// convex/lib/boilerplate/payments/stripe_connect/types.ts

/**
 * Stripe Connect Types
 *
 * Type definitions for Stripe Connect module
 */

import { Doc, Id } from '@/generated/dataModel';

// ============================================
// Connected Account Types
// ============================================

export type ConnectedAccount = Doc<'connectedAccounts'>;
export type ConnectedAccountId = Id<'connectedAccounts'>;

export type AccountStatus = 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
export type AccountType = 'express';

export interface CreateConnectedAccountData {
  clientName: string;
  clientEmail: string;
  stripeAccountId: string;
  accountType?: AccountType;
  accountStatus?: AccountStatus;
  onboarding_completed?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  statement_descriptor?: string;
  default_currency?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateConnectedAccountData {
  clientName?: string;
  clientEmail?: string;
  accountStatus?: AccountStatus;
  onboarding_completed?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  statement_descriptor?: string;
  default_currency?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Product Types
// ============================================

export type ClientProduct = Doc<'clientProducts'>;
export type ClientProductId = Id<'clientProducts'>;

export type Interval = 'one_time' | 'day' | 'week' | 'month' | 'year';

export interface CreateProductData {
  connectedAccountId: ConnectedAccountId;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval?: Interval;
  application_fee_percent?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  amount?: number;
  active?: boolean;
  application_fee_percent?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Payment Types
// ============================================

export type ClientPayment = Doc<'clientPayments'>;
export type ClientPaymentId = Id<'clientPayments'>;

export type PaymentType = 'one_time' | 'subscription';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'unpaid';

export interface CreatePaymentData {
  connectedAccountId: ConnectedAccountId;
  productId?: ClientProductId;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  customerEmail?: string;
  customerName?: string;
  stripeCustomerId?: string;
  paymentType: PaymentType;
  amount: number;
  application_fee_amount: number;
  net_amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  stripeChargeId?: string;
  subscription_status?: SubscriptionStatus;
  subscription_current_period_end?: number;
  refunded?: boolean;
  refund_amount?: number;
  refund_date?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Event Types
// ============================================

export type ConnectEvent = Doc<'connectEvents'>;
export type ConnectEventId = Id<'connectEvents'>;

export type EventType =
  | 'account_created'
  | 'account_updated'
  | 'account_onboarded'
  | 'payment_created'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'refund_created'
  | 'webhook_received'
  | 'api_error'
  | 'other';

export type EventSource = 'stripe_webhook' | 'api_call' | 'manual';

export interface CreateEventData {
  connectedAccountId?: ConnectedAccountId;
  paymentId?: ClientPaymentId;
  eventType: EventType;
  stripeEventId?: string;
  eventData?: unknown;
  source: EventSource;
  processed?: boolean;
  error?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface RevenueAnalytics {
  totalPayments: number;
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  averagePayment: number;
  successfulPayments: number;
  period: {
    start: number;
    end: number;
  };
}

export interface PaymentStatistics {
  total: number;
  succeeded: number;
  failed: number;
  refunded: number;
  subscriptions: number;
  oneTime: number;
  successRate: number;
}

export interface AccountAnalytics {
  totalRevenue: number;
  totalApplicationFees: number;
  netRevenue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  subscriptions: number;
  oneTimePayments: number;
  averagePayment: number;
  successRate: number;
}

export interface PlatformAnalytics {
  totalRevenue: number;
  totalApplicationFees: number;
  netRevenue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  activeAccountCount: number;
  totalAccountCount: number;
  averagePayment: number;
  averageRevenuePerAccount: number;
}

// ============================================
// Filter Types
// ============================================

export interface AccountFilters {
  accountStatus?: AccountStatus;
  onboarding_completed?: boolean;
}

export interface ProductFilters {
  connectedAccountId?: ConnectedAccountId;
  active?: boolean;
}

export interface PaymentFilters {
  connectedAccountId?: ConnectedAccountId;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export interface EventFilters {
  connectedAccountId?: ConnectedAccountId;
  eventType?: EventType;
  processed?: boolean;
  limit?: number;
}
