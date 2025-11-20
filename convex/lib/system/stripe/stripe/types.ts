// convex/lib/boilerplate/stripe/stripe/types.ts
// TypeScript types for stripe module

import { Doc, Id } from '@/generated/dataModel';

/**
 * Stripe Customer Type
 */
export type StripeCustomer = Doc<'stripeCustomers'>;

/**
 * Stripe Subscription Type
 */
export type StripeSubscription = Doc<'stripeSubscriptions'>;

/**
 * Stripe Payment Type
 */
export type StripePayment = Doc<'stripePayments'>;

/**
 * Stripe Webhook Event Type
 */
export type StripeWebhookEvent = Doc<'stripeWebhookEvents'>;

/**
 * Subscription Status Type
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

/**
 * Payment Status Type
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

/**
 * Customer Status Type
 */
export type CustomerStatus = 'active' | 'inactive' | 'suspended';

/**
 * Webhook Status Type
 */
export type WebhookStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'retrying';

/**
 * Billing Interval Type
 */
export type BillingInterval = 'day' | 'week' | 'month' | 'year';

/**
 * Collection Method Type
 */
export type CollectionMethod = 'charge_automatically' | 'send_invoice';

/**
 * Address Type
 */
export type StripeAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

/**
 * Invoice Settings Type
 */
export type InvoiceSettings = {
  customFields?: any;
  defaultPaymentMethod?: string;
  footer?: string;
};

/**
 * Create Customer Input
 */
export interface CreateCustomerInput {
  email: string;
  name?: string;
  description?: string;
  phone?: string;
  address?: StripeAddress;
  metadata?: Record<string, any>;
}

/**
 * Update Customer Input
 */
export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  description?: string;
  phone?: string;
  address?: StripeAddress;
  status?: CustomerStatus;
  metadata?: Record<string, any>;
}

/**
 * Create Subscription Input
 */
export interface CreateSubscriptionInput {
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  productName?: string;
  trialDays?: number;
  metadata?: Record<string, any>;
}

/**
 * Update Subscription Input
 */
export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  cancelReason?: string;
  metadata?: Record<string, any>;
}

/**
 * Create Payment Input
 */
export interface CreatePaymentInput {
  amount: number;
  currency: string;
  description?: string;
  stripeCustomerId?: string;
  receiptEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Update Payment Input
 */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  stripeChargeId?: string;
  errorMessage?: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}

/**
 * Refund Payment Input
 */
export interface RefundPaymentInput {
  paymentId: Id<'stripePayments'>;
  amount?: number;
  reason?: string;
}

/**
 * Webhook Event Input
 */
export interface WebhookEventInput {
  stripeEventId: string;
  eventType: string;
  eventData: any;
  apiVersion?: string;
  livemode?: boolean;
  account?: string;
}

/**
 * Revenue Analytics Type
 */
export interface RevenueAnalytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  averagePayment: number;
}

/**
 * Platform Analytics Type
 */
export interface PlatformAnalytics extends RevenueAnalytics {
  totalCustomers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

/**
 * Subscription Analytics Type
 */
export interface SubscriptionAnalytics {
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledSubscriptions: number;
  pastDueSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
}

/**
 * Query Options Type
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search Options Type
 */
export interface SearchOptions extends QueryOptions {
  query: string;
  filters?: {
    status?: SubscriptionStatus | PaymentStatus | CustomerStatus;
    startDate?: number;
    endDate?: number;
  };
}

/**
 * Webhook Processing Result
 */
export interface WebhookProcessingResult {
  success: boolean;
  eventId: Id<'stripeWebhookEvents'>;
  message: string;
  error?: string;
}

/**
 * Stripe API Error
 */
export interface StripeApiError {
  type: string;
  code?: string;
  message: string;
  param?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}
