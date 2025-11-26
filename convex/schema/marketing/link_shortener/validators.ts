// convex/schema/marketing/link_shortener/validators.ts
// Grouped validators for link_shortener module

import { v } from 'convex/values';

export const linkShortenerValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('paused'),
    v.literal('expired'),
    v.literal('archived')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  device: v.union(
    v.literal('desktop'),
    v.literal('mobile'),
    v.literal('tablet')
  ),
} as const;
