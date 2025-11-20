// convex/lib/boilerplate/game_scores/game_scores/queries.ts
// Read operations for game_scores module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { GAME_SCORES_CONSTANTS } from './constants';
import { requireViewGameScoreAccess, filterGameScoresByAccess } from './permissions';
import { compareScores, getTimePeriodTimestamp, calculateGameStats } from './utils';
import type { GameScoreListResponse, LeaderboardResponse, LeaderboardEntry, GameScoreStats, TimePeriod } from './types';

/**
 * Get paginated list of game scores with filtering
 */
export const getGameScores = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    filters: v.optional(
      v.object({
        gameName: v.optional(v.string()),
        userId: v.optional(v.id('userProfiles')),
        isHighScore: v.optional(v.boolean()),
        minScore: v.optional(v.number()),
        maxScore: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args): Promise<GameScoreListResponse> => {
    const user = await requireCurrentUser(ctx);
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filters = {},
    } = args;

    let scores = await ctx.db
      .query('gameScores')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply filters
    if (filters.gameName) {
      scores = scores.filter((s) => s.gameName === filters.gameName);
    }

    if (filters.userId) {
      scores = scores.filter((s) => s.userId === filters.userId);
    }

    if (filters.isHighScore !== undefined) {
      scores = scores.filter((s) => s.isHighScore === filters.isHighScore);
    }

    if (filters.minScore !== undefined) {
      scores = scores.filter((s) => s.score >= filters.minScore!);
    }

    if (filters.maxScore !== undefined) {
      scores = scores.filter((s) => s.score <= filters.maxScore!);
    }

    // Apply access filtering
    const accessibleScores = await filterGameScoresByAccess(ctx, scores, user);

    // Sort
    if (sortBy === 'score') {
      accessibleScores.sort((a, b) => sortOrder === 'asc' ? a.score - b.score : b.score - a.score);
    } else if (sortBy === 'createdAt') {
      accessibleScores.sort((a, b) => sortOrder === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
    }

    // Pagination
    const total = accessibleScores.length;
    const paginatedScores = accessibleScores.slice(offset, offset + limit);

    return {
      scores: paginatedScores,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single game score by ID
 */
export const getGameScore = query({
  args: {
    scoreId: v.id('gameScores'),
  },
  handler: async (ctx, { scoreId }) => {
    const user = await requireCurrentUser(ctx);

    const score = await ctx.db.get(scoreId);
    if (!score || score.deletedAt) {
      throw new Error('Game score not found');
    }

    await requireViewGameScoreAccess(ctx, score, user);

    // Get user details
    const userProfile = await ctx.db.get(score.userId);

    return {
      ...score,
      userName: userProfile?.name,
      userAvatar: userProfile?.avatar,
    };
  },
});

/**
 * Get game score by public ID
 */
export const getGameScoreByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const score = await ctx.db
      .query('gameScores')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!score) {
      throw new Error('Game score not found');
    }

    await requireViewGameScoreAccess(ctx, score, user);

    // Get user details
    const userProfile = await ctx.db.get(score.userId);

    return {
      ...score,
      userName: userProfile?.name,
      userAvatar: userProfile?.avatar,
    };
  },
});

/**
 * Get user's game scores
 */
export const getUserGameScores = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    gameName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, gameName, limit = 100 }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    let query = ctx.db
      .query('gameScores')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc');

    const scores = await query.take(limit);

    // Filter by game name if specified
    let filteredScores = scores;
    if (gameName) {
      filteredScores = scores.filter((s) => s.gameName === gameName);
    }

    return filteredScores;
  },
});

/**
 * Get leaderboard for a game
 */
export const getLeaderboard = query({
  args: {
    gameName: v.string(),
    timePeriod: v.optional(v.union(
      v.literal('all_time'),
      v.literal('today'),
      v.literal('this_week'),
      v.literal('this_month'),
      v.literal('this_year')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { gameName, timePeriod = 'all_time', limit = 10 }): Promise<LeaderboardResponse> => {
    const user = await getCurrentUser(ctx);

    // Validate limit
    const validLimit = Math.min(
      limit,
      GAME_SCORES_CONSTANTS.LEADERBOARD.MAX_LIMIT
    );

    // Get time period timestamp
    const periodStart = getTimePeriodTimestamp(timePeriod as TimePeriod);

    // Get all scores for the game
    let scores = await ctx.db
      .query('gameScores')
      .withIndex('by_game_name', (q) => q.eq('gameName', gameName))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by time period
    if (periodStart > 0) {
      scores = scores.filter((s) => s.createdAt >= periodStart);
    }

    // Get only high scores per user
    const userHighScores = new Map<string, typeof scores[0]>();
    for (const score of scores) {
      const userId = score.userId;
      const currentHigh = userHighScores.get(userId);

      if (!currentHigh || score.score > currentHigh.score) {
        userHighScores.set(userId, score);
      }
    }

    // Convert to array and sort by score
    let leaderboardScores = Array.from(userHighScores.values());
    leaderboardScores.sort(compareScores);

    // Take top N
    const topScores = leaderboardScores.slice(0, validLimit);

    // Enrich with user details and rank
    const entries: LeaderboardEntry[] = await Promise.all(
      topScores.map(async (score, index) => {
        const userProfile = await ctx.db.get(score.userId);
        return {
          ...score,
          rank: index + 1,
          userName: userProfile?.name,
          userAvatar: userProfile?.avatar,
        };
      })
    );

    // Find user's rank and score if authenticated
    let userRank: number | undefined;
    let userScore: typeof scores[0] | undefined;

    if (user) {
      const userIndex = leaderboardScores.findIndex((s) => s.userId === user._id);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
        userScore = leaderboardScores[userIndex];
      }
    }

    return {
      entries,
      total: leaderboardScores.length,
      userRank,
      userScore,
    };
  },
});

/**
 * Get global leaderboard across all games
 */
export const getGlobalLeaderboard = query({
  args: {
    timePeriod: v.optional(v.union(
      v.literal('all_time'),
      v.literal('today'),
      v.literal('this_week'),
      v.literal('this_month'),
      v.literal('this_year')
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { timePeriod = 'all_time', limit = 10 }): Promise<LeaderboardResponse> => {
    const user = await getCurrentUser(ctx);

    // Validate limit
    const validLimit = Math.min(
      limit,
      GAME_SCORES_CONSTANTS.LEADERBOARD.MAX_LIMIT
    );

    // Get time period timestamp
    const periodStart = getTimePeriodTimestamp(timePeriod as TimePeriod);

    // Get all scores
    let scores = await ctx.db
      .query('gameScores')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by time period
    if (periodStart > 0) {
      scores = scores.filter((s) => s.createdAt >= periodStart);
    }

    // Calculate total score per user
    const userTotalScores = new Map<string, { totalScore: number; userId: string; bestScore: typeof scores[0] }>();

    for (const score of scores) {
      const userId = score.userId;
      const current = userTotalScores.get(userId);

      if (!current) {
        userTotalScores.set(userId, {
          totalScore: score.score,
          userId,
          bestScore: score,
        });
      } else {
        current.totalScore += score.score;
        if (score.score > current.bestScore.score) {
          current.bestScore = score;
        }
      }
    }

    // Convert to array and sort by total score
    let leaderboardData = Array.from(userTotalScores.values());
    leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

    // Take top N
    const topData = leaderboardData.slice(0, validLimit);

    // Enrich with user details and rank
    const entries: LeaderboardEntry[] = await Promise.all(
      topData.map(async (data, index) => {
        const userProfile = await ctx.db.get(data.userId as any);
        return {
          ...data.bestScore,
          rank: index + 1,
          userName: userProfile?.name,
          userAvatar: userProfile?.avatar,
        };
      })
    );

    // Find user's rank if authenticated
    let userRank: number | undefined;
    let userScore: typeof scores[0] | undefined;

    if (user) {
      const userIndex = leaderboardData.findIndex((d) => d.userId === user._id);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
        userScore = leaderboardData[userIndex].bestScore;
      }
    }

    return {
      entries,
      total: leaderboardData.length,
      userRank,
      userScore,
    };
  },
});

/**
 * Get game score statistics
 */
export const getGameScoreStats = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    gameName: v.optional(v.string()),
  },
  handler: async (ctx, { targetUserId, gameName }): Promise<GameScoreStats> => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own stats unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own stats');
    }

    // Get user's scores
    let scores = await ctx.db
      .query('gameScores')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by game if specified
    if (gameName) {
      scores = scores.filter((s) => s.gameName === gameName);
    }

    // Calculate statistics
    const gameStats = calculateGameStats(scores);

    const scoresByGame: Record<string, number> = {};
    const scoresByDifficulty: Record<string, number> = {};

    for (const score of scores) {
      // Count by game
      scoresByGame[score.gameName] = (scoresByGame[score.gameName] || 0) + 1;

      // Count by difficulty
      if (score.metadata?.difficulty) {
        scoresByDifficulty[score.metadata.difficulty] =
          (scoresByDifficulty[score.metadata.difficulty] || 0) + 1;
      }
    }

    // Count recent high scores (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentHighScores = scores.filter(
      (s) => s.isHighScore && s.createdAt >= sevenDaysAgo
    ).length;

    return {
      totalScores: gameStats.totalGames,
      highestScore: gameStats.highestScore,
      averageScore: gameStats.averageScore,
      totalTimePlayed: gameStats.totalTimePlayed,
      totalObstaclesJumped: gameStats.totalObstaclesJumped,
      scoresByGame,
      scoresByDifficulty,
      recentHighScores,
    };
  },
});

/**
 * Get user's high scores per game
 */
export const getUserHighScores = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Get all user's scores
    const scores = await ctx.db
      .query('gameScores')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Group by game and get highest score
    const highScoresByGame = new Map<string, typeof scores[0]>();

    for (const score of scores) {
      const currentHigh = highScoresByGame.get(score.gameName);
      if (!currentHigh || score.score > currentHigh.score) {
        highScoresByGame.set(score.gameName, score);
      }
    }

    return Array.from(highScoresByGame.values()).sort(compareScores);
  },
});

/**
 * Get recent scores across all games
 */
export const getRecentScores = query({
  args: {
    limit: v.optional(v.number()),
    gameName: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 20, gameName }) => {
    const user = await getCurrentUser(ctx);

    let query = ctx.db
      .query('gameScores')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc');

    let scores = await query.take(limit);

    // Filter by game if specified
    if (gameName) {
      scores = scores.filter((s) => s.gameName === gameName);
    }

    // Enrich with user details
    const enrichedScores = await Promise.all(
      scores.map(async (score) => {
        const userProfile = await ctx.db.get(score.userId);
        return {
          ...score,
          userName: userProfile?.name,
          userAvatar: userProfile?.avatar,
        };
      })
    );

    return enrichedScores;
  },
});
