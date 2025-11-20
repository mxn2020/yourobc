// convex/lib/boilerplate/games/helpers.ts

import { v } from "convex/values";

const nanoid_length = 16;

function generateNanoId(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  return id;
}

/**
 * Game Helpers
 * Shared utilities for game functionality
 */

export const generateGameScoreId = () => `game_score_${generateNanoId(nanoid_length)}`;

export const validateScore = (score: number): boolean => {
  return score >= 0 && score <= 1000000 && Number.isFinite(score);
};

export const calculateRank = (score: number, allScores: number[]): number => {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  const rank = sortedScores.findIndex((s) => s <= score) + 1;
  return rank || sortedScores.length + 1;
};

export const formatGameDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

// Validation schemas
export const saveScoreArgs = {
  gameName: v.string(),
  score: v.number(),
  timePlayedMs: v.number(),
  obstaclesJumped: v.number(),
  metadata: v.optional(
    v.object({
      speed: v.number(),
      difficulty: v.string(),
      maxCombo: v.optional(v.number()),
    })
  ),
};

export const getScoresArgs = {
  gameName: v.string(),
  limit: v.optional(v.number()),
};
