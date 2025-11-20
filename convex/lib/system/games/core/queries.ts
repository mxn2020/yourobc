/**
 * Core Game Queries
 *
 * Universal queries used by all games
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc } from "../../../../_generated/dataModel";

/**
 * Get leaderboard for a game
 */
export const getLeaderboard = query({
  args: {
    gameId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      limit?: number;
    }
  ) => {
    const limit = args.limit || 10;

    const leaderboard = await ctx.db
      .query("gameLeaderboards")
      .withIndex("by_game_and_score", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(limit);

    return leaderboard;
  },
});

/**
 * Get user's rank in a game
 */
export const getUserRank = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    // Get user's leaderboard entry
    const userEntry = await ctx.db
      .query("gameLeaderboards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("gameId"), args.gameId))
      .first();

    if (!userEntry) {
      return null;
    }

    // Count how many users have a higher score
    const higherScores = await ctx.db
      .query("gameLeaderboards")
      .withIndex("by_game_and_score", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.gt(q.field("topScore"), userEntry.topScore))
      .collect();

    const rank = higherScores.length + 1;

    return {
      ...userEntry,
      rank,
    };
  },
});

/**
 * Get user's best score for a game
 */
export const getUserBestScore = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) => q.eq("gameId", args.gameId).eq("userId", userId))
      .order("desc")
      .take(1);

    return scores[0] || null;
  },
});

/**
 * Get user's recent scores
 */
export const getUserRecentScores = query({
  args: {
    gameId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      limit?: number;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 10;

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) => q.eq("gameId", args.gameId).eq("userId", userId))
      .order("desc")
      .take(limit);

    return scores;
  },
});

/**
 * Get user's game progress
 */
export const getUserProgress = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const progress = await ctx.db
      .query("gameProgress")
      .withIndex("by_user_and_game", (q) => q.eq("userId", userId).eq("gameId", args.gameId))
      .first();

    return progress;
  },
});

/**
 * Get all user's game progress (across all games)
 */
export const getAllUserProgress = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const progress = await ctx.db
      .query("gameProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return progress;
  },
});

/**
 * Get top scores for a game (high scores)
 */
export const getTopScores = query({
  args: {
    gameId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      limit?: number;
    }
  ) => {
    const limit = args.limit || 10;

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_score", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(limit);

    return scores;
  },
});

/**
 * Get game statistics (global)
 */
export const getGameStats = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    // Get all scores for this game
    const allScores = await ctx.db
      .query("gameScores")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    if (allScores.length === 0) {
      return {
        totalGames: 0,
        totalPlayers: 0,
        averageScore: 0,
        highestScore: 0,
        totalPlayTime: 0,
      };
    }

    const totalGames = allScores.length;
    const uniquePlayers = new Set(allScores.map((s: Doc<"gameScores">) => s.userId)).size;
    const totalScore = allScores.reduce((sum: number, s: Doc<"gameScores">) => sum + s.score, 0);
    const averageScore = totalScore / totalGames;
    const highestScore = Math.max(...allScores.map((s: Doc<"gameScores">) => s.score));
    const totalPlayTime = allScores.reduce((sum: number, s: Doc<"gameScores">) => sum + s.timePlayedMs, 0);

    return {
      totalGames,
      totalPlayers: uniquePlayers,
      averageScore: Math.round(averageScore),
      highestScore,
      totalPlayTime,
    };
  },
});
