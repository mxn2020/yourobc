// convex/lib/boilerplate/game_scores/game_scores/types.ts
// Business logic types for game_scores module

import { Doc, Id } from '@/generated/dataModel';

export type GameScore = Doc<'gameScores'>;
export type GameScoreId = Id<'gameScores'>;

export type CreateGameScoreData = {
  gameName: string;
  score: number;
  level?: number;
  timePlayedMs: number;
  obstaclesJumped: number;
  metadata?: {
    speed: number;
    difficulty: string;
    maxCombo?: number;
  };
};

export type UpdateGameScoreData = {
  score?: number;
  level?: number;
  timePlayedMs?: number;
  obstaclesJumped?: number;
  isHighScore?: boolean;
  metadata?: {
    speed: number;
    difficulty: string;
    maxCombo?: number;
  };
};

export type GameScoreListResponse = {
  scores: GameScore[];
  total: number;
  hasMore: boolean;
};

export type LeaderboardEntry = GameScore & {
  rank: number;
  userName?: string;
  userAvatar?: string;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  total: number;
  userRank?: number;
  userScore?: GameScore;
};

export type GameScoreStats = {
  totalScores: number;
  highestScore: number;
  averageScore: number;
  totalTimePlayed: number;
  totalObstaclesJumped: number;
  scoresByGame: Record<string, number>;
  scoresByDifficulty: Record<string, number>;
  recentHighScores: number;
};

export type TimePeriod = 'all_time' | 'today' | 'this_week' | 'this_month' | 'this_year';

export type ScoreRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
