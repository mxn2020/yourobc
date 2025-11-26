// convex/schema/marketing/newsletters/validators.ts
// Grouped validators for newsletters module

import { v } from 'convex/values';

export const newslettersValidators = {
  newsletterStatus: v.union(
    v.literal('active'),
    v.literal('draft'),
    v.literal('archived')
  ),

  campaignStatus: v.union(
    v.literal('draft'),
    v.literal('scheduled'),
    v.literal('sending'),
    v.literal('sent'),
    v.literal('failed'),
    v.literal('archived')
  ),

  subscriberStatus: v.union(
    v.literal('active'),
    v.literal('unsubscribed'),
    v.literal('bounced'),
    v.literal('complained')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  subscriptionSource: v.union(
    v.literal('manual'),
    v.literal('import'),
    v.literal('form'),
    v.literal('api')
  ),

  templateCategory: v.union(
    v.literal('welcome'),
    v.literal('promotional'),
    v.literal('newsletter'),
    v.literal('announcement'),
    v.literal('transactional')
  ),
} as const;
