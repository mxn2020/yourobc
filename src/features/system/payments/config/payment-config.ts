// src/features/system/payments/config/payment-config.ts
/**
 * Payment Configuration
 *
 * Detects which payment providers are available based on environment variables
 */

import type { PaymentProviderType, PricingPlan } from '../types';
import { DEFAULT_PLANS } from './plans-config';
import { getEnv, getEnvWithDefault, envIsTrue, getEnvAsFloat } from '../../_shared/env-utils';

export interface PaymentConfig {
  enabledProviders: Record<PaymentProviderType, boolean>;
  primaryProvider: PaymentProviderType | null;
  plans: PricingPlan[];
  providers: {
    autumnBetterAuth?: {
      secretKey: string;
    };
    autumnConvex?: {
      secretKey: string;
      convexUrl: string;
    };
    stripeStandard?: {
      secretKey: string;
      publishableKey: string;
      webhookSecret?: string;
    };
    stripeConnect?: {
      secretKey: string;
      publishableKey: string;
      connectClientId: string;
      webhookSecret?: string;
      applicationFeePercent: number;
    };
  };
}

/**
 * Detect which payment providers are configured
 */
export function getPaymentConfig(): PaymentConfig {
  const hasAutumn = Boolean(getEnv('AUTUMN_SECRET_KEY'));
  const hasStripe = Boolean(getEnv('STRIPE_SECRET_KEY'));
  const hasStripeConnect = Boolean(getEnv('STRIPE_CONNECT_CLIENT_ID'));
  const hasConvexUrl = Boolean(getEnv('VITE_CONVEX_URL'));

  // Check if Better Auth is using Autumn plugin
  // This is a heuristic - in real app, check if auth config includes autumn plugin
  const usesBetterAuthAutumn = hasAutumn && !getEnv('USE_CONVEX_AUTUMN');
  const usesConvexAutumn = hasAutumn && (envIsTrue('USE_CONVEX_AUTUMN') || hasConvexUrl);

  const enabledProviders: Record<PaymentProviderType, boolean> = {
    'autumn-betterauth': usesBetterAuthAutumn,
    'autumn-convex': usesConvexAutumn,
    'stripe-standard': hasStripe && !hasAutumn && !hasStripeConnect,
    'stripe-connect': hasStripeConnect,
  };

  // Determine primary provider
  let primaryProvider: PaymentProviderType | null = null;
  if (getEnv('PRIMARY_PAYMENT_PROVIDER')) {
    primaryProvider = getEnv('PRIMARY_PAYMENT_PROVIDER') as PaymentProviderType;
  } else {
    // Auto-detect priority: autumn-betterauth > autumn-convex > stripe-standard
    if (enabledProviders['autumn-betterauth']) {
      primaryProvider = 'autumn-betterauth';
    } else if (enabledProviders['autumn-convex']) {
      primaryProvider = 'autumn-convex';
    } else if (enabledProviders['stripe-standard']) {
      primaryProvider = 'stripe-standard';
    }
  }

  // Build provider configs
  const providers: PaymentConfig['providers'] = {};

  if (usesBetterAuthAutumn && getEnv('AUTUMN_SECRET_KEY')) {
    providers.autumnBetterAuth = {
      secretKey: getEnv('AUTUMN_SECRET_KEY')!,
    };
  }

  if (usesConvexAutumn && getEnv('AUTUMN_SECRET_KEY') && getEnv('VITE_CONVEX_URL')) {
    providers.autumnConvex = {
      secretKey: getEnv('AUTUMN_SECRET_KEY')!,
      convexUrl: getEnv('VITE_CONVEX_URL')!,
    };
  }

  if (hasStripe && !hasAutumn && !hasStripeConnect) {
    providers.stripeStandard = {
      secretKey: getEnv('STRIPE_SECRET_KEY')!,
      publishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY')!,
      webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
    };
  }

  if (hasStripeConnect) {
    providers.stripeConnect = {
      secretKey: getEnv('STRIPE_SECRET_KEY')!,
      publishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY')!,
      connectClientId: getEnv('STRIPE_CONNECT_CLIENT_ID')!,
      webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
      applicationFeePercent: getEnvAsFloat('STRIPE_APPLICATION_FEE_PERCENT', 5),
    };
  }

  return {
    enabledProviders,
    primaryProvider,
    plans: DEFAULT_PLANS,
    providers,
  };
}

export const PAYMENT_CONFIG = getPaymentConfig();