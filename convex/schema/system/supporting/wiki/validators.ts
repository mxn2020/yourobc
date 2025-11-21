// convex/schema/system/supporting/wiki/validators.ts
// Grouped validators for wiki module

import { v } from 'convex/values';

export const wikiValidators = {
  type: v.union(
    v.literal('guide'),
    v.literal('tutorial'),
    v.literal('reference'),
    v.literal('faq'),
    v.literal('article'),
    v.literal('documentation')
  ),
  status: v.union(
    v.literal('draft'),
    v.literal('published'),
    v.literal('archived'),
    v.literal('review')
  ),
  visibility: v.union(
    v.literal('public'),
    v.literal('private'),
    v.literal('team'),
    v.literal('restricted')
  ),
} as const;
