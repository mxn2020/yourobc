/**
 * Dino Game Queries
 *
 * Backend queries specific to the Dino Jump game
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc, Id } from "../../../../_generated/dataModel";

/**
 * Get user's Dino games
 */
export const getUserGames = query({
  args: {
    gameMode: v.optional(
      v.union(
        v.literal("classic"),
        v.literal("timed"),
        v.literal("obstacles"),
        v.literal("speed_run")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameMode?: "classic" | "timed" | "obstacles" | "speed_run";
      limit?: number;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 20;

    let gamesQuery = ctx.db
      .query("dinoGames")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.gameMode) {
      gamesQuery = ctx.db
        .query("dinoGames")
        .withIndex("by_user_and_mode", (q) =>
          q.eq("userId", userId).eq("gameMode", args.gameMode!)
        );
    }

    const games = await gamesQuery.order("desc").take(limit);

    return games;
  },
});

/**
 * Get Dino leaderboard
 */
export const getLeaderboard = query({
  args: {
    gameMode: v.optional(
      v.union(
        v.literal("classic"),
        v.literal("timed"),
        v.literal("obstacles"),
        v.literal("speed_run")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameMode?: "classic" | "timed" | "obstacles" | "speed_run";
      limit?: number;
    }
  ) => {
    const limit = args.limit || 10;

    let scoresQuery = ctx.db.query("dinoHighScores");

    if (args.gameMode) {
      scoresQuery = ctx.db
        .query("dinoHighScores")
        .withIndex("by_mode_score", (q) => q.eq("gameMode", args.gameMode!));
    } else {
      scoresQuery = ctx.db.query("dinoHighScores").withIndex("by_score_global");
    }

    const scores = await scoresQuery.order("desc").take(limit);

    return scores;
  },
});

/**
 * Get user's high scores
 */
export const getUserHighScores = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const highScores = await ctx.db
      .query("dinoHighScores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return highScores;
  },
});

/**
 * Get user's player statistics
 */
export const getUserStats = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const stats = await ctx.db
      .query("dinoPlayerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stats;
  },
});

/**
 * Get specific game by ID
 */
export const getGame = query({
  args: {
    gameId: v.id("dinoGames"),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: Id<"dinoGames">;
    }
  ) => {
    const game = await ctx.db.get(args.gameId);
    return game;
  },
});

/**
 * Get user's best game by mode
 */
export const getBestGame = query({
  args: {
    gameMode: v.union(
      v.literal("classic"),
      v.literal("timed"),
      v.literal("obstacles"),
      v.literal("speed_run")
    ),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameMode: "classic" | "timed" | "obstacles" | "speed_run";
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const games = await ctx.db
      .query("dinoGames")
      .withIndex("by_user_and_mode", (q) =>
        q.eq("userId", userId).eq("gameMode", args.gameMode)
      )
      .collect();

    if (games.length === 0) {
      return null;
    }

    // Find game with highest score
    const bestGame = games.reduce((best: Doc<"dinoGames">, current: Doc<"dinoGames">) =>
      current.score > best.score ? current : best
    );

    return bestGame;
  },
});

/**
 * Get recent high scores (all users)
 */
export const getRecentHighScores = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      limit?: number;
    }
  ) => {
    const limit = args.limit || 10;

    const scores = await ctx.db
      .query("dinoHighScores")
      .order("desc")
      .take(limit);

    return scores;
  },
});

/**
 * Get user's rank in a specific mode
 */
export const getUserRank = query({
  args: {
    gameMode: v.union(
      v.literal("classic"),
      v.literal("timed"),
      v.literal("obstacles"),
      v.literal("speed_run")
    ),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameMode: "classic" | "timed" | "obstacles" | "speed_run";
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const userHighScore = await ctx.db
      .query("dinoHighScores")
      .withIndex("by_user_and_mode", (q) =>
        q.eq("userId", userId).eq("gameMode", args.gameMode)
      )
      .first();

    if (!userHighScore) {
      return null;
    }

    // Count how many scores are higher
    const allScores = await ctx.db
      .query("dinoHighScores")
      .withIndex("by_mode_score", (q) => q.eq("gameMode", args.gameMode))
      .collect();

    const higherScores = allScores.filter((s: Doc<"dinoHighScores">) => s.score > userHighScore.score);
    const rank = higherScores.length + 1;

    return {
      rank,
      score: userHighScore.score,
      totalPlayers: allScores.length,
    };
  },
});

/**
 * Get global statistics
 */
export const getGlobalStats = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const allGames = await ctx.db.query("dinoGames").collect();

    if (allGames.length === 0) {
      return {
        totalGames: 0,
        totalPlayers: 0,
        totalDistance: 0,
        totalObstacles: 0,
        averageScore: 0,
        highestScore: 0,
      };
    }

    const uniquePlayers = new Set(allGames.map((g: Doc<"dinoGames">) => g.userId));
    const totalDistance = allGames.reduce((sum: number, g: Doc<"dinoGames">) => sum + g.distance, 0);
    const totalObstacles = allGames.reduce(
      (sum: number, g: Doc<"dinoGames">) => sum + g.obstaclesJumped,
      0
    );
    const totalScore = allGames.reduce((sum: number, g: Doc<"dinoGames">) => sum + g.score, 0);
    const highestScore = Math.max(...allGames.map((g: Doc<"dinoGames">) => g.score));

    return {
      totalGames: allGames.length,
      totalPlayers: uniquePlayers.size,
      totalDistance: Math.floor(totalDistance),
      totalObstacles,
      averageScore: Math.floor(totalScore / allGames.length),
      highestScore,
    };
  },
});

/**
 * Get top performers by various metrics
 */
export const getTopPerformers = query({
  args: {
    metric: v.union(
      v.literal("distance"),
      v.literal("obstacles"),
      v.literal("perfect_jumps"),
      v.literal("speed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      metric: "distance" | "obstacles" | "perfect_jumps" | "speed";
      limit?: number;
    }
  ) => {
    const limit = args.limit || 10;

    let games: Doc<"dinoGames">[] = [];

    switch (args.metric) {
      case "distance":
        games = await ctx.db
          .query("dinoGames")
          .withIndex("by_distance")
          .order("desc")
          .take(limit);
        break;

      case "obstacles":
      case "perfect_jumps":
      case "speed":
        // For these, we need to get all and sort
        const allGames = await ctx.db.query("dinoGames").collect();

        if (args.metric === "obstacles") {
          games = allGames
            .sort((a: Doc<"dinoGames">, b: Doc<"dinoGames">) => b.obstaclesJumped - a.obstaclesJumped)
            .slice(0, limit);
        } else if (args.metric === "perfect_jumps") {
          games = allGames
            .sort((a: Doc<"dinoGames">, b: Doc<"dinoGames">) => b.perfectJumps - a.perfectJumps)
            .slice(0, limit);
        } else if (args.metric === "speed") {
          games = allGames
            .sort((a: Doc<"dinoGames">, b: Doc<"dinoGames">) => b.highestSpeed - a.highestSpeed)
            .slice(0, limit);
        }
        break;
    }

    return games;
  },
});

/**
 * Search games by criteria
 */
export const searchGames = query({
  args: {
    minScore: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    gameMode: v.optional(
      v.union(
        v.literal("classic"),
        v.literal("timed"),
        v.literal("obstacles"),
        v.literal("speed_run")
      )
    ),
    hasReplay: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      minScore?: number;
      maxScore?: number;
      gameMode?: "classic" | "timed" | "obstacles" | "speed_run";
      hasReplay?: boolean;
      limit?: number;
    }
  ) => {
    const limit = args.limit || 20;

    let gamesQuery = ctx.db.query("dinoGames");

    if (args.gameMode) {
      gamesQuery = ctx.db
        .query("dinoGames")
        .withIndex("by_game_mode", (q) => q.eq("gameMode", args.gameMode!));
    }

    let games = await gamesQuery.take(limit * 2); // Get more than needed for filtering

    // Apply filters
    if (args.minScore !== undefined) {
      games = games.filter((g: Doc<"dinoGames">) => g.score >= args.minScore!);
    }
    if (args.maxScore !== undefined) {
      games = games.filter((g: Doc<"dinoGames">) => g.score <= args.maxScore!);
    }
    if (args.hasReplay !== undefined) {
      games = games.filter((g: Doc<"dinoGames">) => g.hasReplay === args.hasReplay);
    }

    // Take only requested amount
    return games.slice(0, limit);
  },
});
