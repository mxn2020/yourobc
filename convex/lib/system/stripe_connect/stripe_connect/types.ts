// convex/lib/boilerplate/stripe_connect/stripe_connect/types.ts
// TypeScript type definitions for stripe_connect module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  AccountStatus,
  AccountType,
  PaymentStatus,
  PaymentType,
  SubscriptionStatus,
  Interval,
  EventType,
  EventSource,
} from '@/schema/boilerplate/stripe_connect/stripe_connect/types';

// ============================================
// Connected Account Types
// ============================================

export type ConnectedAccount = Doc<'connectedAccounts'>;
export type ConnectedAccountId = Id<'connectedAccounts'>;

// Re-export schema types
export type { AccountStatus, AccountType };

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

// Re-export schema types
export type { Interval };

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

// Re-export schema types
export type { PaymentType, PaymentStatus, SubscriptionStatus };

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

// Re-export schema types
export type { EventType, EventSource };

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
