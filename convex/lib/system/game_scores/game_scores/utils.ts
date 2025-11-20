// convex/lib/boilerplate/game_scores/game_scores/utils.ts
// Validation functions and utility helpers for game_scores module

import { GAME_SCORES_CONSTANTS, DIFFICULTY_MULTIPLIERS } from './constants';
import type { GameScore, CreateGameScoreData, UpdateGameScoreData, ScoreRank, TimePeriod } from './types';

/**
 * Validate game score data for creation/update
 */
export function validateGameScoreData(
  data: Partial<CreateGameScoreData | UpdateGameScoreData>
): string[] {
  const errors: string[] = [];

  // Validate game name
  if ('gameName' in data && data.gameName !== undefined) {
    const trimmed = data.gameName.trim();

    if (!trimmed) {
      errors.push('Game name is required');
    } else if (trimmed.length > GAME_SCORES_CONSTANTS.LIMITS.MAX_GAME_NAME_LENGTH) {
      errors.push(`Game name cannot exceed ${GAME_SCORES_CONSTANTS.LIMITS.MAX_GAME_NAME_LENGTH} characters`);
    }
  }

  // Validate score
  if (data.score !== undefined) {
    if (data.score < GAME_SCORES_CONSTANTS.LIMITS.MIN_SCORE) {
      errors.push(`Score must be at least ${GAME_SCORES_CONSTANTS.LIMITS.MIN_SCORE}`);
    }
  }

  // Validate level
  if (data.level !== undefined && data.level !== null) {
    if (data.level < 0) {
      errors.push('Level cannot be negative');
    } else if (data.level > GAME_SCORES_CONSTANTS.LIMITS.MAX_LEVEL) {
      errors.push(`Level cannot exceed ${GAME_SCORES_CONSTANTS.LIMITS.MAX_LEVEL}`);
    }
  }

  // Validate time played
  if ('timePlayedMs' in data && data.timePlayedMs !== undefined) {
    if (data.timePlayedMs < GAME_SCORES_CONSTANTS.LIMITS.MIN_TIME_PLAYED) {
      errors.push('Time played cannot be negative');
    }
  }

  // Validate obstacles jumped
  if ('obstaclesJumped' in data && data.obstaclesJumped !== undefined) {
    if (data.obstaclesJumped < 0) {
      errors.push('Obstacles jumped cannot be negative');
    } else if (data.obstaclesJumped > GAME_SCORES_CONSTANTS.LIMITS.MAX_OBSTACLES_JUMPED) {
      errors.push(`Obstacles jumped cannot exceed ${GAME_SCORES_CONSTANTS.LIMITS.MAX_OBSTACLES_JUMPED}`);
    }
  }

  // Validate metadata
  if (data.metadata) {
    const { speed, maxCombo } = data.metadata;

    if (speed < GAME_SCORES_CONSTANTS.LIMITS.MIN_SPEED) {
      errors.push(`Speed must be at least ${GAME_SCORES_CONSTANTS.LIMITS.MIN_SPEED}`);
    } else if (speed > GAME_SCORES_CONSTANTS.LIMITS.MAX_SPEED) {
      errors.push(`Speed cannot exceed ${GAME_SCORES_CONSTANTS.LIMITS.MAX_SPEED}`);
    }

    if (maxCombo !== undefined && maxCombo !== null) {
      if (maxCombo < 0) {
        errors.push('Max combo cannot be negative');
      } else if (maxCombo > GAME_SCORES_CONSTANTS.LIMITS.MAX_COMBO) {
        errors.push(`Max combo cannot exceed ${GAME_SCORES_CONSTANTS.LIMITS.MAX_COMBO}`);
      }
    }
  }

  return errors;
}

/**
 * Calculate adjusted score based on difficulty multiplier
 */
export function calculateAdjustedScore(score: number, difficulty: string): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || 1.0;
  return Math.round(score * multiplier);
}

/**
 * Determine score rank based on score value
 */
export function getScoreRank(score: number): ScoreRank {
  if (score >= GAME_SCORES_CONSTANTS.SCORE_THRESHOLDS.DIAMOND) {
    return 'diamond';
  } else if (score >= GAME_SCORES_CONSTANTS.SCORE_THRESHOLDS.PLATINUM) {
    return 'platinum';
  } else if (score >= GAME_SCORES_CONSTANTS.SCORE_THRESHOLDS.GOLD) {
    return 'gold';
  } else if (score >= GAME_SCORES_CONSTANTS.SCORE_THRESHOLDS.SILVER) {
    return 'silver';
  } else if (score >= GAME_SCORES_CONSTANTS.SCORE_THRESHOLDS.BRONZE) {
    return 'bronze';
  }
  return 'bronze';
}

/**
 * Get score rank color
 */
export function getScoreRankColor(rank: ScoreRank): string {
  const colors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    diamond: '#b9f2ff',
  };
  return colors[rank] || colors.bronze;
}

/**
 * Calculate score per minute played
 */
export function calculateScorePerMinute(score: number, timePlayedMs: number): number {
  if (timePlayedMs === 0) return 0;
  const minutes = timePlayedMs / (1000 * 60);
  return Math.round(score / minutes);
}

/**
 * Calculate average obstacles jumped per minute
 */
export function calculateObstaclesPerMinute(obstaclesJumped: number, timePlayedMs: number): number {
  if (timePlayedMs === 0) return 0;
  const minutes = timePlayedMs / (1000 * 60);
  return Math.round(obstaclesJumped / minutes);
}

/**
 * Format time played for display
 */
export function formatTimePlayed(timePlayedMs: number): string {
  const totalSeconds = Math.floor(timePlayedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get time period timestamp
 */
export function getTimePeriodTimestamp(period: TimePeriod): number {
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  switch (period) {
    case 'today':
      return today.getTime();

    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return startOfWeek.getTime();
    }

    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return startOfMonth.getTime();
    }

    case 'this_year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return startOfYear.getTime();
    }

    case 'all_time':
    default:
      return 0;
  }
}

/**
 * Check if score is a high score for the user and game
 */
export function isHighScore(score: number, userHighScore: number | null): boolean {
  if (userHighScore === null) return true;
  return score > userHighScore;
}

/**
 * Calculate game statistics from scores
 */
export function calculateGameStats(scores: GameScore[]) {
  if (scores.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      highestScore: 0,
      totalTimePlayed: 0,
      totalObstaclesJumped: 0,
    };
  }

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const totalTimePlayed = scores.reduce((sum, s) => sum + s.timePlayedMs, 0);
  const totalObstaclesJumped = scores.reduce((sum, s) => sum + s.obstaclesJumped, 0);
  const highestScore = Math.max(...scores.map((s) => s.score));

  return {
    totalGames: scores.length,
    averageScore: Math.round(totalScore / scores.length),
    highestScore,
    totalTimePlayed,
    totalObstaclesJumped,
  };
}

/**
 * Compare scores for sorting (descending)
 */
export function compareScores(a: GameScore, b: GameScore): number {
  return b.score - a.score;
}

/**
 * Compare scores by time played (descending)
 */
export function compareByTimePlayed(a: GameScore, b: GameScore): number {
  return b.timePlayedMs - a.timePlayedMs;
}

/**
 * Compare scores by obstacles jumped (descending)
 */
export function compareByObstacles(a: GameScore, b: GameScore): number {
  return b.obstaclesJumped - a.obstaclesJumped;
}

/**
 * Get difficulty display name
 */
export function getDifficultyDisplayName(difficulty: string): string {
  const names: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
  };
  return names[difficulty] || difficulty;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444',
    expert: '#dc2626',
  };
  return colors[difficulty] || colors.easy;
}

/**
 * Format score for display with comma separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Check if score is recent (within last 24 hours)
 */
export function isRecentScore(score: GameScore): boolean {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return score.createdAt > oneDayAgo;
}

/**
 * Get score age in human-readable format
 */
export function getScoreAge(score: GameScore): string {
  const now = Date.now();
  const ageMs = now - score.createdAt;

  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years === 1 ? '' : 's'} ago`;
  } else if (months > 0) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
}
