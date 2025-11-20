// convex/schema/boilerplate/websites/websites/validators.ts
// Grouped validators for websites module

import { v } from 'convex/values';

export const websitesValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('published'),
    v.literal('archived'),
    v.literal('maintenance')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),
} as const;
