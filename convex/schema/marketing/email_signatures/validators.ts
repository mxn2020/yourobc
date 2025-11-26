// convex/schema/marketing/email_signatures/validators.ts
// Grouped validators for email_signatures module

import { v } from 'convex/values';

export const emailSignaturesValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('draft'),
    v.literal('archived')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  templateCategory: v.union(
    v.literal('professional'),
    v.literal('creative'),
    v.literal('minimal'),
    v.literal('corporate')
  ),
} as const;
