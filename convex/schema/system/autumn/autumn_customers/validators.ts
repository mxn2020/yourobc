// convex/schema/boilerplate/autumn/autumn_customers/validators.ts
// Grouped validators for autumn customers module

import { v } from 'convex/values';

export const autumnCustomersValidators = {
  subscriptionStatus: v.union(
    v.literal('active'),
    v.literal('trialing'),
    v.literal('cancelled'),
    v.literal('past_due'),
    v.literal('inactive')
  ),
} as const;
