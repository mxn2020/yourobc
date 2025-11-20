// src/features/boilerplate/payments/providers/autumn-betterauth/provider.ts
/**
 * Autumn Better Auth Provider Implementation
 * 
 * Implements the PaymentProvider interface
 */

import type { PaymentProvider, Subscription, FeatureAccess, UsageStats, CheckoutOptions, CheckoutResult } from '../../types';
import { PAYMENT_CONFIG } from '../../config/payment-config';

export const autumnBetterAuthProvider: PaymentProvider = {
  name: 'Autumn + Better Auth',
  type: 'autumn-betterauth',

  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    // This is handled client-side via useAutumnCheckout hook
    // Server-side usage would require auth.api calls
    throw new Error('Use useAutumnCheckout hook on client-side');
  },

  async openBillingPortal(returnUrl?: string): Promise<void> {
    // Handled via useAutumnCustomer hook
    throw new Error('Use useAutumnCustomer hook on client-side');
  },

  async cancelSubscription(immediate?: boolean): Promise<void> {
    // Handled via useAutumnCustomer hook
    throw new Error('Use useAutumnCustomer hook on client-side');
  },

  async checkAccess(featureKey: string): Promise<FeatureAccess> {
    // Use useAutumnFeatureAccess hook
    throw new Error('Use useAutumnFeatureAccess hook on client-side');
  },

  async trackUsage(featureKey: string, quantity: number): Promise<void> {
    // Use useAutumnUsage hook
    throw new Error('Use useAutumnUsage hook on client-side');
  },

  async getSubscription(): Promise<Subscription | null> {
    // Use useAutumnCustomer hook
    throw new Error('Use useAutumnCustomer hook on client-side');
  },

  async getUsageStats(featureKey?: string): Promise<UsageStats | Record<string, UsageStats>> {
    // Use useAutumnUsage hook
    throw new Error('Use useAutumnUsage hook on client-side');
  },

  isConfigured(): boolean {
    return PAYMENT_CONFIG.enabledProviders['autumn-betterauth'];
  },
};
