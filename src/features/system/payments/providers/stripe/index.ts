// src/features/boilerplate/payments/providers/stripe/index.ts
/**
 * Stripe Standard Provider Exports
 *
 * This module provides standard Stripe functionality for SaaS subscriptions
 * and one-time payments.
 *
 * @example
 * ```tsx
 * import { Stripe } from '@/features/boilerplate/payments';
 *
 * // Use components
 * <Stripe.CheckoutButton priceId="price_xxx" />
 * <Stripe.SubscriptionStatus />
 * <Stripe.BillingPortalButton />
 * <Stripe.PricingCard plan={plan} />
 *
 * // Use hooks
 * const { customer } = Stripe.useStripeCustomer();
 * const { createSubscriptionCheckout } = Stripe.useStripeCheckout();
 * const { subscription, cancelSubscription } = Stripe.useStripeSubscription();
 * const { openBillingPortal } = Stripe.useStripeBillingPortal();
 * ```
 */

// Provider
export { stripeProvider } from './provider';
export { stripeProvider as default } from './provider';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types - export specific types to avoid conflicts
export type {
  StripeCustomerData,
  CustomerResponse,
  SubscriptionPlan,
  SubscriptionData,
  SubscriptionStatus as StripeSubscriptionStatus,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  OneTimePaymentRequest,
  PaymentIntentResponse,
  PaymentData,
  PaymentStatus,
  BillingPortalRequest,
  BillingPortalResponse,
  StripeEventType,
  StripeWebhookEvent,
  UsageRecord,
  UsageResponse,
  RefundRequest,
  RefundResponse,
} from './types';
