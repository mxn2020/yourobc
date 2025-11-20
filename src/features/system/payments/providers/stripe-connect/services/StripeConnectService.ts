// src/features/system/stripe-connect/services/StripeConnectService.ts
/**
 * Stripe Connect Service
 *
 * Comprehensive service for Stripe Connect Express accounts
 * Handles account creation, onboarding, payments with application fees
 */

import Stripe from 'stripe';
import type {
  StripeConnectConfig,
  ConnectedAccountData,
  ConnectedAccountResponse,
  OnboardingLinkRequest,
  OnboardingLinkResponse,
  AccountStatusResponse,
  ProductData,
  ProductResponse,
  CheckoutRequest,
  CheckoutResponse,
  SubscriptionCheckoutRequest,
  PaymentIntentRequest,
  PaymentIntentResponse,
  FeeCalculation,
} from '../types/stripe-connect.types';

/**
 * Stripe Connect API Service
 */
export class StripeConnectService {
  private static instance: StripeConnectService | null = null;
  private stripe: Stripe;
  private config: StripeConnectConfig;

  private constructor(config: StripeConnectConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: StripeConnectConfig): StripeConnectService {
    if (!StripeConnectService.instance && config) {
      StripeConnectService.instance = new StripeConnectService(config);
    } else if (!StripeConnectService.instance) {
      throw new Error('StripeConnectService must be initialized with config first');
    }
    return StripeConnectService.instance;
  }

  /**
   * Initialize service
   */
  public static initialize(config: StripeConnectConfig): StripeConnectService {
    StripeConnectService.instance = new StripeConnectService(config);
    return StripeConnectService.instance;
  }

  /**
   * Reset instance (useful for testing)
   */
  public static reset(): void {
    StripeConnectService.instance = null;
  }

  // ============================================
  // Account Management
  // ============================================

  /**
   * Create a new Stripe Connect Express account
   */
  public async createConnectedAccount(
    data: ConnectedAccountData
  ): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: data.country || 'US',
        email: data.clientEmail,
        business_type: data.businessType || 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          clientName: data.clientName,
          ...data.metadata,
        },
      });

      return account;
    } catch (error) {
      console.error('Error creating connected account:', error);
      throw new Error(`Failed to create connected account: ${(error as Error).message}`);
    }
  }

  /**
   * Get account details
   */
  public async getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.retrieve(accountId);
    } catch (error) {
      console.error('Error retrieving account:', error);
      throw new Error(`Failed to retrieve account: ${(error as Error).message}`);
    }
  }

  /**
   * Generate onboarding link for Express account
   */
  public async createOnboardingLink(
    request: OnboardingLinkRequest
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: request.accountId,
        refresh_url: request.refreshUrl,
        return_url: request.returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Error creating onboarding link:', error);
      throw new Error(`Failed to create onboarding link: ${(error as Error).message}`);
    }
  }

  /**
   * Get account status and capabilities
   */
  public async getAccountStatus(accountId: string): Promise<AccountStatusResponse> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);

      let status: AccountStatusResponse['status'] = 'pending';

      if (account.charges_enabled && account.payouts_enabled) {
        status = 'active';
      } else if (account.details_submitted) {
        status = 'onboarding';
      } else if (account.requirements?.disabled_reason) {
        status = 'restricted';
      }

      return {
        accountId: account.id,
        status,
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        details_submitted: account.details_submitted || false,
        capabilities: {
          card_payments: account.capabilities?.card_payments,
          transfers: account.capabilities?.transfers,
        },
        requirements: account.requirements
          ? {
            currently_due: account.requirements.currently_due || [],
            eventually_due: account.requirements.eventually_due || [],
            past_due: account.requirements.past_due || [],
          }
          : undefined,
      };
    } catch (error) {
      console.error('Error getting account status:', error);
      throw new Error(`Failed to get account status: ${(error as Error).message}`);
    }
  }

  // ============================================
  // Products & Pricing
  // ============================================

  /**
   * Create a product and price on the connected account
   */
  public async createProduct(data: ProductData): Promise<ProductResponse> {
    try {
      const { connectedAccountId, ...productData } = data;

      // Create product
      const product = await this.stripe.products.create(
        {
          name: productData.name,
          description: productData.description,
          metadata: productData.metadata,
        },
        {
          stripeAccount: connectedAccountId,
        }
      );

      // Create price
      const priceData: Stripe.PriceCreateParams = {
        product: product.id,
        currency: productData.currency.toLowerCase(),
        unit_amount: productData.amount,
        metadata: productData.metadata,
      };

      // Add recurring interval if not one-time
      if (productData.interval && productData.interval !== 'one_time') {
        priceData.recurring = {
          interval: productData.interval as Stripe.PriceCreateParams.Recurring.Interval,
        };
      }

      const price = await this.stripe.prices.create(priceData, {
        stripeAccount: connectedAccountId,
      });

      return {
        id: product.id,
        stripeProductId: product.id,
        stripePriceId: price.id,
        name: product.name!,
        amount: productData.amount,
        currency: productData.currency,
        interval: productData.interval,
        applicationFeePercent:
          productData.applicationFeePercent || this.config.applicationFeePercent || 5,
        active: product.active,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${(error as Error).message}`);
    }
  }

  /**
   * List products for a connected account
   */
  public async listProducts(accountId: string): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list(
        {
          limit: 100,
          active: true,
        },
        {
          stripeAccount: accountId,
        }
      );

      return products.data;
    } catch (error) {
      console.error('Error listing products:', error);
      throw new Error(`Failed to list products: ${(error as Error).message}`);
    }
  }

  // ============================================
  // Checkout & Payments
  // ============================================

  /**
   * Create checkout session for one-time payment
   */
  public async createCheckoutSession(
    request: CheckoutRequest,
    priceId: string,
    applicationFeePercent: number
  ): Promise<CheckoutResponse> {
    try {
      const { connectedAccountId, customerEmail, successUrl, cancelUrl, metadata } = request;

      // Calculate application fee amount
      const price = await this.stripe.prices.retrieve(priceId, {
        stripeAccount: connectedAccountId,
      });

      const amount = price.unit_amount || 0;
      const feeAmount = Math.round((amount * applicationFeePercent) / 100);

      const session = await this.stripe.checkout.sessions.create(
        {
          mode: price.recurring ? 'subscription' : 'payment',
          customer_email: customerEmail,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: metadata,
          payment_intent_data: price.recurring
            ? undefined
            : {
              application_fee_amount: feeAmount,
            },
          subscription_data: price.recurring
            ? {
              application_fee_percent: applicationFeePercent,
            }
            : undefined,
        },
        {
          stripeAccount: connectedAccountId,
        }
      );

      return {
        sessionId: session.id,
        url: session.url!,
        expiresAt: session.expires_at,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Failed to create checkout session: ${(error as Error).message}`);
    }
  }

  /**
   * Create subscription checkout session
   */
  public async createSubscriptionCheckout(
    request: SubscriptionCheckoutRequest,
    priceId: string,
    applicationFeePercent: number
  ): Promise<CheckoutResponse> {
    try {
      const {
        connectedAccountId,
        customerEmail,
        successUrl,
        cancelUrl,
        metadata,
        trialDays,
      } = request;

      const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
        application_fee_percent: applicationFeePercent,
        metadata,
      };

      if (trialDays && trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      const session = await this.stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          customer_email: customerEmail,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          subscription_data: subscriptionData,
        },
        {
          stripeAccount: connectedAccountId,
        }
      );

      return {
        sessionId: session.id,
        url: session.url!,
        expiresAt: session.expires_at,
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw new Error(`Failed to create subscription checkout: ${(error as Error).message}`);
    }
  }

  /**
   * Create payment intent with application fee
   */
  public async createPaymentIntent(
    request: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      const { connectedAccountId, amount, currency, customerEmail, description, metadata } =
        request;

      const applicationFeePercent = this.config.applicationFeePercent || 5;
      const feeAmount = Math.round((amount * applicationFeePercent) / 100);

      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount,
          currency: currency.toLowerCase(),
          application_fee_amount: feeAmount,
          receipt_email: customerEmail,
          description,
          metadata,
        },
        {
          stripeAccount: connectedAccountId,
        }
      );

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        applicationFeeAmount: feeAmount,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${(error as Error).message}`);
    }
  }

  // ============================================
  // Payment Retrieval
  // ============================================

  /**
   * Get payment intent details
   */
  public async getPaymentIntent(
    paymentIntentId: string,
    accountId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        stripeAccount: accountId,
      });
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error(`Failed to retrieve payment intent: ${(error as Error).message}`);
    }
  }

  /**
   * Get subscription details
   */
  public async getSubscription(
    subscriptionId: string,
    accountId: string
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId, {
        stripeAccount: accountId,
      });
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error(`Failed to retrieve subscription: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel subscription
   */
  public async cancelSubscription(
    subscriptionId: string,
    accountId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(
          subscriptionId,
          {
            cancel_at_period_end: true,
          },
          {
            stripeAccount: accountId,
          }
        );
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId, {
          stripeAccount: accountId,
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
    }
  }

  /**
 * Get invoice details
 */
  public async getInvoice(
    invoiceId: string,
    accountId: string
  ): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId, {
        stripeAccount: accountId,
      });
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      throw new Error(`Failed to retrieve invoice: ${(error as Error).message}`);
    }
  }

  // ============================================
  // Webhooks
  // ============================================

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret?: string
  ): Stripe.Event {
    try {
      const secret = webhookSecret || this.config.webhookSecret;
      if (!secret) {
        throw new Error('Webhook secret is not configured');
      }

      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      throw new Error(`Webhook signature verification failed: ${(error as Error).message}`);
    }
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Calculate application fee
   */
  public calculateFee(amount: number, feePercent?: number): FeeCalculation {
    const percent = feePercent || this.config.applicationFeePercent || 5;
    const feeAmount = Math.round((amount * percent) / 100);
    const netAmount = amount - feeAmount;

    // Estimate Stripe processing fee (2.9% + $0.30 for US cards)
    const stripeFeeEstimate = Math.round(amount * 0.029 + 30);

    return {
      amount,
      applicationFeePercent: percent,
      applicationFeeAmount: feeAmount,
      netAmount,
      stripeFeeEstimate,
      totalFees: feeAmount + stripeFeeEstimate,
    };
  }

  /**
   * Get Stripe instance (for advanced usage)
   */
  public getStripeInstance(): Stripe {
    return this.stripe;
  }
}

// Export singleton instance getter
export const stripeConnectService = (): StripeConnectService => {
  if (typeof window === 'undefined') {
    // Server-side: Get from environment variables
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const applicationFeePercent = process.env.STRIPE_APPLICATION_FEE_PERCENT
      ? parseFloat(process.env.STRIPE_APPLICATION_FEE_PERCENT)
      : 5;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    return StripeConnectService.getInstance({
      secretKey,
      webhookSecret,
      applicationFeePercent,
    });
  } else {
    // Client-side: Should not be called directly
    throw new Error(
      'StripeConnectService should only be called server-side. Use API routes and hooks instead.'
    );
  }
};

// Export for server-side initialization
export const initializeStripeConnectService = (
  config: StripeConnectConfig
): StripeConnectService => {
  return StripeConnectService.initialize(config);
};
