// convex/lib/boilerplate/game_scores/game_scores/index.ts
// Barrel exports for game_scores module

// Constants
export { GAME_SCORES_CONSTANTS, DIFFICULTY_MULTIPLIERS } from './constants';

// Types
export type {
  GameScore,
  GameScoreId,
  CreateGameScoreData,
  UpdateGameScoreData,
  GameScoreListResponse,
  LeaderboardEntry,
  LeaderboardResponse,
  GameScoreStats,
  TimePeriod,
  ScoreRank,
} from './types';

// Utils
export {
  validateGameScoreData,
  calculateAdjustedScore,
  getScoreRank,
  getScoreRankColor,
  calculateScorePerMinute,
  calculateObstaclesPerMinute,
  formatTimePlayed,
  getTimePeriodTimestamp,
  isHighScore,
  calculateGameStats,
  compareScores,
  compareByTimePlayed,
  compareByObstacles,
  getDifficultyDisplayName,
  getDifficultyColor,
  formatScore,
  isRecentScore,
  getScoreAge,
} from './utils';

// Permissions
export {
  canViewGameScore,
  requireViewGameScoreAccess,
  canEditGameScore,
  requireEditGameScoreAccess,
  canDeleteGameScore,
  requireDeleteGameScoreAccess,
  canCreateGameScore,
  requireCreateGameScoreAccess,
  canViewAllGameScores,
  filterGameScoresByAccess,
  isGameScoreOwner,
  isAdminUser,
  canManageGameScores,
  requireManageGameScoresAccess,
} from './permissions';

// Queries
export {
  getGameScores,
  getGameScore,
  getGameScoreByPublicId,
  getUserGameScores,
  getLeaderboard,
  getGlobalLeaderboard,
  getGameScoreStats,
  getUserHighScores,
  getRecentScores,
} from './queries';

// Mutations
export {
  createGameScore,
  updateGameScore,
  deleteGameScore,
  bulkDeleteGameScores,
  resetUserGameScores,
} from './mutations';
