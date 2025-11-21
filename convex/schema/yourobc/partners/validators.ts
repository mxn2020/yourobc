// convex/schema/yourobc/partners/validators.ts
// Grouped validators for partners module

import { v } from 'convex/values';

export const partnersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('archived')
  ),
} as const;
