// src/features/system/payments/providers/autumn-convex/provider.ts
/**
 * Autumn Convex Provider Implementation
 */

import type { PaymentProvider } from '../../types';
import { PAYMENT_CONFIG } from '../../config/payment-config';

export const autumnConvexProvider: PaymentProvider = {
  name: 'Autumn + Convex',
  type: 'autumn-convex',

  async createCheckout() {
    throw new Error('Use useAutumnConvexCheckout hook on client-side');
  },

  async openBillingPortal() {
    throw new Error('Use BillingPortalButton component on client-side');
  },

  async cancelSubscription() {
    throw new Error('Use Autumn Convex mutations on client-side');
  },

  async checkAccess() {
    throw new Error('Use useAutumnConvexFeatureAccess hook on client-side');
  },

  async trackUsage() {
    throw new Error('Use useAutumnConvexUsage hook on client-side');
  },

  async getSubscription() {
    throw new Error('Use useAutumnConvexCustomer hook on client-side');
  },

  async getUsageStats() {
    throw new Error('Use useAutumnConvexUsage hook on client-side');
  },

  isConfigured(): boolean {
    return PAYMENT_CONFIG.enabledProviders['autumn-convex'];
  },
};