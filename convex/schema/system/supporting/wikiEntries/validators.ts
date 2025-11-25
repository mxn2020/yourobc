import { v } from 'convex/values';

export const wikiEntriesValidators = {
  entryType: v.union(
    v.literal('article'),
    v.literal('guide'),
    v.literal('faq'),
    v.literal('policy'),
    v.literal('procedure')
  ),
  entryStatus: v.union(
    v.literal('draft'),
    v.literal('review'),
    v.literal('published'),
    v.literal('archived')
  ),
} as const;

export const wikiEntriesFields = {} as const;
