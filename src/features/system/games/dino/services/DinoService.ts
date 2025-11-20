/**
 * Dino Game Service
 *
 * Service layer for Dino game backend interactions
 */

import type { FunctionReference } from 'convex/server';

export interface DinoGameData {
  gameId: 'dino';
  userId: string;
  score: number;
  timePlayedMs: number;
  gameMode: 'classic' | 'timed' | 'obstacles' | 'speed_run';
  distance: number;
  obstaclesJumped: number;
  obstaclesDucked: number;
  totalObstacles: number;
  highestSpeed: number;
  averageSpeed: number;
  perfectJumps: number;
  nearMisses: number;
  powerUpsCollected: number;
  isCompleted: boolean;
  deathReason?: 'collision' | 'time_up' | 'quit';
  averageFPS: number;
  hasReplay: boolean;
  replayId?: string;
}

export interface DinoHighScore {
  userId: string;
  gameId: string;
  score: number;
  distance: number;
  gameMode: 'classic' | 'timed' | 'obstacles' | 'speed_run';
  duration: number;
  obstaclesJumped: number;
  highestSpeed: number;
  perfectJumps: number;
  globalRank?: number;
  modeRank?: number;
  achievedAt: number;
}

export interface DinoPlayerStats {
  userId: string;
  totalGamesPlayed: number;
  totalGamesCompleted: number;
  totalPlayTimeMs: number;
  highScores: {
    classic?: number;
    timed?: number;
    obstacles?: number;
    speed_run?: number;
  };
  totalScore: number;
  totalDistance: number;
  longestRun: number;
  longestGameMs: number;
  totalObstaclesJumped: number;
  totalObstaclesDucked: number;
  totalPerfectJumps: number;
  totalNearMisses: number;
  totalPowerUps: number;
  highestSpeedEver: number;
  deathsByCollision: number;
  deathsByTimeUp: number;
  currentGlobalRank?: number;
  bestGlobalRank?: number;
  currentPlayStreak: number;
  longestPlayStreak: number;
  currentSurvivalStreak: number;
  longestSurvivalStreak: number;
  lastPlayedAt: number;
  updatedAt: number;
}

/**
 * Dino Service - Handles all Dino game backend operations
 */
export class DinoService {
  /**
   * Save a completed Dino game
   */
  static async saveGame(
    mutation: FunctionReference<'mutation'>,
    gameData: Partial<DinoGameData>
  ): Promise<any> {
    return mutation({
      ...gameData,
      gameId: 'dino',
    });
  }

  /**
   * Get user's Dino statistics
   */
  static async getUserStats(
    query: FunctionReference<'query'>,
    userId: string
  ): Promise<DinoPlayerStats | null> {
    return query({ userId });
  }

  /**
   * Get Dino leaderboard
   */
  static async getLeaderboard(
    query: FunctionReference<'query'>,
    gameMode?: 'classic' | 'timed' | 'obstacles' | 'speed_run',
    limit: number = 10
  ): Promise<DinoHighScore[]> {
    return query({ gameMode, limit });
  }

  /**
   * Get user's high scores by mode
   */
  static async getUserHighScores(
    query: FunctionReference<'query'>,
    userId: string
  ): Promise<DinoHighScore[]> {
    return query({ userId });
  }

  /**
   * Calculate score from distance
   */
  static calculateScore(distance: number): number {
    return Math.floor(distance / 10);
  }

  /**
   * Calculate average speed
   */
  static calculateAverageSpeed(totalDistance: number, timeMs: number): number {
    if (timeMs === 0) return 0;
    const timeSeconds = timeMs / 1000;
    return totalDistance / timeSeconds;
  }

  /**
   * Determine if jump was perfect (close call)
   */
  static isPerfectJump(
    dinoX: number,
    dinoY: number,
    obstacleX: number,
    obstacleY: number,
    obstacleWidth: number,
    obstacleHeight: number,
    threshold: number = 20
  ): boolean {
    // Check if dino just barely cleared the obstacle
    const horizontalDistance = Math.abs(dinoX - (obstacleX + obstacleWidth));
    const verticalClearance = dinoY - (obstacleY + obstacleHeight);

    return horizontalDistance < threshold && verticalClearance < threshold && verticalClearance > 0;
  }

  /**
   * Determine if it was a near miss
   */
  static isNearMiss(
    dinoX: number,
    dinoY: number,
    obstacleX: number,
    obstacleY: number,
    obstacleWidth: number,
    obstacleHeight: number,
    threshold: number = 10
  ): boolean {
    // Check if dino was very close to collision
    const horizontalDistance = Math.abs(dinoX - obstacleX);
    const verticalDistance = Math.abs(dinoY - obstacleY);

    return (
      horizontalDistance < threshold ||
      (verticalDistance < threshold && horizontalDistance < obstacleWidth)
    );
  }

  /**
   * Get game mode from config
   */
  static getGameMode(): 'classic' | 'timed' | 'obstacles' | 'speed_run' {
    // For now, always return classic
    // This can be extended to support different modes
    return 'classic';
  }

  /**
   * Format time for display
   */
  static formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${seconds}s`;
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)}km`;
    }
    return `${Math.floor(distance)}m`;
  }

  /**
   * Format speed for display
   */
  static formatSpeed(speed: number): string {
    return `${speed.toFixed(1)} px/frame`;
  }

  /**
   * Get achievement progress
   */
  static getAchievementProgress(
    achievementId: string,
    gameState: any
  ): { current: number; max: number } | null {
    switch (achievementId) {
      case 'first_jump':
        return { current: Math.min(gameState.obstaclesJumped, 1), max: 1 };
      case 'score_100':
        return { current: Math.min(gameState.score, 100), max: 100 };
      case 'score_500':
        return { current: Math.min(gameState.score, 500), max: 500 };
      case 'score_1000':
        return { current: Math.min(gameState.score, 1000), max: 1000 };
      case 'perfect_10':
        return { current: Math.min(gameState.perfectJumps, 10), max: 10 };
      case 'speed_demon':
        return {
          current: Math.min(gameState.speed, gameState.config?.maxSpeed || 20),
          max: gameState.config?.maxSpeed || 20,
        };
      case 'marathon_runner':
        return {
          current: Math.min(gameState.timePlayedMs, 5 * 60 * 1000),
          max: 5 * 60 * 1000,
        };
      case 'obstacle_master':
        return { current: Math.min(gameState.obstaclesJumped, 100), max: 100 };
      case 'close_call':
        return { current: Math.min(gameState.nearMisses, 20), max: 20 };
      default:
        return null;
    }
  }
}
