// convex/schema/boilerplate/game_scores/game_scores/game_scores.ts
// Table definitions for game_scores module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { gameScoresValidators } from './validators';

export const gameScoresTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  userId: v.id('userProfiles'),  // renamed from userId to follow convention (ownerId pattern)

  // Required: Main display field
  gameName: v.string(), // e.g., "dino-jump"

  // Score information
  score: v.number(),
  level: v.optional(v.number()),
  timePlayedMs: v.number(),
  obstaclesJumped: v.number(),
  isHighScore: v.boolean(),

  // Game metadata
  metadata: gameScoresValidators.metadata,

  // Standard metadata and audit fields
  extendedMetadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_user_id', ['userId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_score', ['score'])
  .index('by_game_name', ['gameName'])
  .index('by_game_and_user', ['gameName', 'userId'])
  .index('by_game_and_score', ['gameName', 'score'])
  .index('by_is_high_score', ['isHighScore'])
  .index('by_created_at', ['createdAt']);
