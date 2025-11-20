// src/features/boilerplate/payments/providers/stripe-connect/index.ts
/**
 * Stripe Connect Provider
 *
 * Marketplace/platform payment provider for Stripe Connect
 *
 * @module StripeConnect
 */

// Provider implementation
export { stripeConnectProvider, isStripeConnectEnabled } from './provider';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Types (from existing types folder)
export * from './types/stripe-connect.types';

// Services (from existing services folder)
export { StripeConnectService } from './services/StripeConnectService';
