// convex/schema/boilerplate/game_scores/game_scores/validators.ts
// Grouped validators for game_scores module

import { v } from 'convex/values';

export const gameScoresValidators = {
  difficulty: v.union(
    v.literal('easy'),
    v.literal('medium'),
    v.literal('hard'),
    v.literal('expert')
  ),

  metadata: v.optional(
    v.object({
      speed: v.number(),
      difficulty: v.string(),
      maxCombo: v.optional(v.number()),
    })
  ),
} as const;
