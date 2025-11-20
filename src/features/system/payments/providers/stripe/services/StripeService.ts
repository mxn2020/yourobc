// src/features/system/payments/providers/stripe/services/StripeService.ts
/**
 * Stripe Standard Service
 *
 * Handles standard Stripe operations:
 * - Customer management
 * - Subscriptions
 * - One-time payments
 * - Billing portal
 * - Refunds
 */

import Stripe from 'stripe';
import type {
  StripeCustomerData,
  CustomerResponse,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  OneTimePaymentRequest,
  PaymentIntentResponse,
  BillingPortalRequest,
  BillingPortalResponse,
  RefundRequest,
  RefundResponse,
} from '../types';

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;
  private configured: boolean = false;

  private constructor() {
    const secretKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      // Don't throw - just mark as not configured
      this.configured = false;
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
    this.configured = true;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Check if Stripe is configured and ready to use
   */
  public isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Get the Stripe instance (throws if not configured)
   */
  private getStripe(): Stripe {
    if (!this.configured || !this.stripe) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please set it in your environment variables.');
    }
    return this.stripe;
  }

  // ============================================
  // Customer Management
  // ============================================

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(data: StripeCustomerData): Promise<CustomerResponse> {
    try {
      const stripe = this.getStripe();

      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: data.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return {
          success: true,
          customerId: existingCustomers.data[0].id,
        };
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata || {},
      });

      return {
        success: true,
        customerId: customer.id,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer',
      };
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string) {
    try {
      const customer = await this.getStripe().customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, data: Partial<StripeCustomerData>) {
    try {
      const customer = await this.getStripe().customers.update(customerId, {
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      });
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  /**
   * Create a subscription checkout session
   */
  async createSubscriptionCheckout(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    try {
      // Create or get customer
      let customerId = request.customerId;

      if (!customerId && request.email) {
        const customerResult = await this.createOrGetCustomer({
          stripeCustomerId: '',
          email: request.email,
          name: request.name,
          metadata: request.metadata,
        });

        if (!customerResult.success || !customerResult.customerId) {
          return {
            success: false,
            error: customerResult.error || 'Failed to create customer',
          };
        }

        customerId = customerResult.customerId;
      }

      // Create checkout session
      const session = await this.getStripe().checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: request.priceId,
            quantity: 1,
          },
        ],
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        subscription_data: request.trialPeriodDays
          ? {
              trial_period_days: request.trialPeriodDays,
              metadata: request.metadata || {},
            }
          : {
              metadata: request.metadata || {},
            },
        metadata: request.metadata || {},
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url || undefined,
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      };
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.getStripe().subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  /**
   * List customer subscriptions
   */
  async listCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await this.getStripe().subscriptions.list({
        customer: customerId,
        limit: 100,
      });
      return subscriptions.data;
    } catch (error) {
      console.error('Error listing subscriptions:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    try {
      if (cancelAtPeriodEnd) {
        // Cancel at period end
        const subscription = await this.getStripe().subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return subscription;
      } else {
        // Cancel immediately
        const subscription = await this.getStripe().subscriptions.cancel(subscriptionId);
        return subscription;
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(subscriptionId: string) {
    try {
      const subscription = await this.getStripe().subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
      return subscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  // ============================================
  // One-Time Payments
  // ============================================

  /**
   * Create a one-time payment checkout session
   */
  async createOneTimePaymentCheckout(
    request: OneTimePaymentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      // Create or get customer if email provided
      let customerId = request.customerId;

      if (!customerId && request.email) {
        const customerResult = await this.createOrGetCustomer({
          stripeCustomerId: '',
          email: request.email,
          name: request.name,
          metadata: request.metadata,
        });

        if (customerResult.success && customerResult.customerId) {
          customerId = customerResult.customerId;
        }
      }

      // Create checkout session
      const session = await this.getStripe().checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: request.currency || 'usd',
              unit_amount: request.amount,
              product_data: {
                name: request.description || 'Payment',
              },
            },
            quantity: 1,
          },
        ],
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        metadata: request.metadata || {},
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url || undefined,
      };
    } catch (error) {
      console.error('Error creating payment checkout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      };
    }
  }

  /**
   * Create a payment intent (for direct payment)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string
  ): Promise<PaymentIntentResponse> {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  /**
   * Get payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  // ============================================
  // Billing Portal
  // ============================================

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(
    request: BillingPortalRequest
  ): Promise<BillingPortalResponse> {
    try {
      const session = await this.getStripe().billingPortal.sessions.create({
        customer: request.customerId,
        return_url: request.returnUrl,
      });

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create billing portal session',
      };
    }
  }

  // ============================================
  // Refunds
  // ============================================

  /**
   * Create a refund
   */
  async createRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refund = await this.getStripe().refunds.create({
        payment_intent: request.paymentIntentId,
        amount: request.amount,
        reason: request.reason,
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create refund',
      };
    }
  }

  // ============================================
  // Webhooks
  // ============================================

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event | null {
    try {
      const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return null;
      }

      const event = this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return null;
    }
  }

  /**
   * Get raw Stripe instance (for advanced operations)
   */
  getStripeInstance(): Stripe {
    return this.getStripe();
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();
