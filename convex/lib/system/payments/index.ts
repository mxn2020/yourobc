// convex/lib/boilerplate/payments/index.ts
/**
 * Payments Library - Exports
 *
 * This module exports all payment-related functionality using namespaces
 * to avoid naming conflicts between different payment providers.
 *
 * Usage:
 * - payments: Core payment entity functions (subscriptions, usage, events)
 * - autumnConvex: Payment functions for Autumn with Convex Auth
 * - autumnBetterAuth: Payment functions for Autumn with Better Auth
 * - stripe: Standard Stripe payment functions
 * - stripeConnect: Stripe Connect payment functions for marketplace/platform features
 */

// Core payments module (GUIDE pattern)
export * as payments from './payments';

// Payment provider integrations
//export * as autumnBetterAuth from './autumn_better_auth'; --- IGNORE ---
export * as autumnConvex from './autumn_convex';
export * as stripe from './stripe';
export * as stripeConnect from './stripe_connect';
