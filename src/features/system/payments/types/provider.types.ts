// src/features/boilerplate/payments/types/provider.types.ts
/**
 * Payment Provider Interface
 * 
 * All payment providers must implement this interface
 */

import type {
  Subscription,
  FeatureAccess,
  UsageStats,
  CheckoutOptions,
  CheckoutResult,
} from './payment.types';

export interface PaymentProvider {
  // Provider info
  readonly name: string;
  readonly type: PaymentProviderType;
  
  // Subscription management
  createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
  openBillingPortal(returnUrl?: string): Promise<void>;
  cancelSubscription(immediate?: boolean): Promise<void>;
  
  // Feature access
  checkAccess(featureKey: string): Promise<FeatureAccess>;
  trackUsage(featureKey: string, quantity: number, options?: TrackUsageOptions): Promise<void>;
  
  // Data access
  getSubscription(): Promise<Subscription | null>;
  getUsageStats(featureKey?: string): Promise<UsageStats | Record<string, UsageStats>>;
  
  // Utility
  isConfigured(): boolean;
}

export type PaymentProviderType = 
  | 'autumn-betterauth'
  | 'autumn-convex'
  | 'stripe-standard'
  | 'stripe-connect';

export interface TrackUsageOptions {
  unit?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  type: PaymentProviderType;
  enabled: boolean;
  apiKey?: string;
  webhookSecret?: string;
  [key: string]: any;
}

