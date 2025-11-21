// convex/schema/software/yourobc/quotes/validators.ts
// Grouped validators for quotes module

import { v } from 'convex/values';

export const quotesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('sent'),
    v.literal('pending'),
    v.literal('accepted'),
    v.literal('rejected'),
    v.literal('expired')
  ),

  serviceType: v.union(
    v.literal('OBC'),
    v.literal('NFO')
  ),

  priority: v.union(
    v.literal('standard'),
    v.literal('urgent'),
    v.literal('critical')
  ),
} as const;
