// convex/schema/system/supporting/counters/validators.ts
// Validators for counters module

import { v } from 'convex/values';

export const countersValidators = {
  counterType: v.union(
    v.literal('invoice'),
    v.literal('quote'),
    v.literal('order'),
    v.literal('customer'),
    v.literal('product'),
    v.literal('general')
  ),
} as const;

export const countersFields = {} as const;
