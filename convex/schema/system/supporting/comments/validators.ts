// convex/schema/system/supporting/comments/validators.ts
// Grouped validators for comments module

import { v } from 'convex/values';

export const commentValidators = {
  type: v.union(
    v.literal('comment'),
    v.literal('note'),
    v.literal('feedback'),
    v.literal('question'),
    v.literal('answer')
  ),
} as const;
