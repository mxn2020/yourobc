// File: src/routes/api/payments/_utils/provider-detector.ts
import { PAYMENT_CONFIG } from '@/features/boilerplate/payments';
import type { PaymentProvider, PaymentProviderType } from '@/features/boilerplate/payments/types';

// Import all provider implementations
import { autumnBetterAuthProvider } from '@/features/boilerplate/payments/providers/autumn-betterauth';
import { autumnConvexProvider } from '@/features/boilerplate/payments/providers/autumn-convex';
import { stripeProvider } from '@/features/boilerplate/payments/providers/stripe';
import { stripeConnectProvider } from '@/features/boilerplate/payments/providers/stripe-connect';

/**
 * Provider registry mapping provider types to their implementations
 */
const PROVIDER_REGISTRY: Record<PaymentProviderType, PaymentProvider> = {
  'autumn-betterauth': autumnBetterAuthProvider,
  'autumn-convex': autumnConvexProvider,
  'stripe-standard': stripeProvider,
  'stripe-connect': stripeConnectProvider,
};

/**
 * Detects and returns the currently active payment provider
 * Based on environment configuration
 */
export function detectActiveProvider(): {
  provider: PaymentProvider;
  type: PaymentProviderType;
} {
  const primaryProvider = PAYMENT_CONFIG.primaryProvider;

  if (!primaryProvider) {
    throw new Error('No payment provider configured. Please set up payment environment variables.');
  }

  const provider = PROVIDER_REGISTRY[primaryProvider];

  if (!provider) {
    throw new Error(`Provider ${primaryProvider} not found in registry`);
  }

  if (!provider.isConfigured()) {
    throw new Error(`Provider ${primaryProvider} is not properly configured. Check environment variables.`);
  }

  return {
    provider,
    type: primaryProvider,
  };
}

/**
 * Gets a specific provider by type
 * Useful for provider-specific operations
 */
export function getProvider(type: PaymentProviderType): PaymentProvider {
  const provider = PROVIDER_REGISTRY[type];

  if (!provider) {
    throw new Error(`Provider ${type} not found`);
  }

  if (!provider.isConfigured()) {
    throw new Error(`Provider ${type} is not configured`);
  }

  return provider;
}

/**
 * Checks if a specific provider is available and configured
 */
export function isProviderAvailable(type: PaymentProviderType): boolean {
  const provider = PROVIDER_REGISTRY[type];
  return provider ? provider.isConfigured() : false;
}

/**
 * Gets all configured providers
 */
export function getConfiguredProviders(): Array<{
  type: PaymentProviderType;
  provider: PaymentProvider;
}> {
  return Object.entries(PROVIDER_REGISTRY)
    .filter(([_, provider]) => provider.isConfigured())
    .map(([type, provider]) => ({
      type: type as PaymentProviderType,
      provider,
    }));
}

/**
 * Validates that at least one provider is configured
 */
export function validateProviderSetup(): void {
  const configured = getConfiguredProviders();

  if (configured.length === 0) {
    throw new Error(
      'No payment providers configured. Please set up at least one of: AUTUMN_SECRET_KEY, STRIPE_SECRET_KEY, or STRIPE_CONNECT_CLIENT_ID'
    );
  }
}
