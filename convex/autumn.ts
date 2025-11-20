// convex/autumn.ts
/**
 * Autumn Convex Integration
 *
 * Setup file for Autumn's Convex component
 *
 * Note: This file conditionally initializes Autumn based on AUTUMN_SECRET_KEY.
 * If the key is not set in convex.config.ts, components.autumn won't exist,
 * so we need to handle that gracefully.
 */

declare const process: { env: Record<string, string | undefined> }

import { components } from './_generated/api';
import { Autumn } from '@useautumn/convex';

const isAutumnEnabled = !!process.env.AUTUMN_SECRET_KEY;

// Create stub functions for when Autumn is disabled
const createStub = (name: string) => () => {
  throw new Error(`Autumn is not enabled. Cannot call ${name}(). Set AUTUMN_SECRET_KEY environment variable to enable Autumn.`);
};

let autumnApi: ReturnType<Autumn['api']>;

if (isAutumnEnabled && 'autumn' in components) {
  // Initialize Autumn client (following official docs pattern)
  const autumn = new Autumn(components.autumn as any, {
    secretKey: process.env.AUTUMN_SECRET_KEY!,
    identify: async (ctx: any) => {
      // Get user from Convex auth
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;

      // Extract user ID (adjust based on your auth setup)
      const userId = identity.subject;

      return {
        customerId: userId,
        customerData: {
          name: identity.name as string,
          email: identity.email as string,
        },
      };
    },
  });

  autumnApi = autumn.api();
} else {
  // Autumn is disabled - create stub API
  if (!isAutumnEnabled) {
    console.warn('Autumn is disabled. Set AUTUMN_SECRET_KEY to enable Autumn integration.');
  }

  autumnApi = {
    track: createStub('track'),
    cancel: createStub('cancel'),
    query: createStub('query'),
    attach: createStub('attach'),
    check: createStub('check'),
    checkout: createStub('checkout'),
    usage: createStub('usage'),
    setupPayment: createStub('setupPayment'),
    createCustomer: createStub('createCustomer'),
    listProducts: createStub('listProducts'),
    billingPortal: createStub('billingPortal'),
    createReferralCode: createStub('createReferralCode'),
    redeemReferralCode: createStub('redeemReferralCode'),
    createEntity: createStub('createEntity'),
    getEntity: createStub('getEntity'),
  } as any;
}

// Export Autumn API functions
export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumnApi;