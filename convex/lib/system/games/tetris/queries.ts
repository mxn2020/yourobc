/**
 * Tetris Game Queries
 *
 * Backend queries specific to the Tetris game
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc, Id } from "../../../../_generated/dataModel";

/**
 * Get user's Tetris games
 */
export const getUserGames = query({
  args: {
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard"),
        v.literal("expert")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    difficulty?: "easy" | "medium" | "hard" | "expert";
    limit?: number;
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 20;

    let gamesQuery = ctx.db
      .query("tetrisGames")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.difficulty) {
      gamesQuery = ctx.db
        .query("tetrisGames")
        .withIndex("by_user_and_difficulty", (q) =>
          q.eq("userId", userId).eq("difficulty", args.difficulty!)
        );
    }

    const games = await gamesQuery.order("desc").take(limit);

    return games;
  },
});

/**
 * Get specific game by ID
 */
export const getGame = query({
  args: {
    gameId: v.id("tetrisGames"),
  },
  handler: async (ctx: QueryCtx, args: { gameId: Id<"tetrisGames"> }) => {
    const game = await ctx.db.get(args.gameId);
    return game;
  },
});

/**
 * Get Tetris leaderboard
 */
export const getLeaderboard = query({
  args: {
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard"),
        v.literal("expert")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    difficulty?: "easy" | "medium" | "hard" | "expert";
    limit?: number;
  }) => {
    const limit = args.limit || 10;

    let scoresQuery = ctx.db.query("tetrisHighScores");

    if (args.difficulty) {
      scoresQuery = ctx.db
        .query("tetrisHighScores")
        .withIndex("by_difficulty_and_score", (q) =>
          q.eq("difficulty", args.difficulty!)
        );
    } else {
      scoresQuery = ctx.db.query("tetrisHighScores").withIndex("by_score");
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
      .query("tetrisHighScores")
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
      .query("tetrisPlayerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stats;
  },
});

/**
 * Get user's rank in a specific difficulty
 */
export const getUserRank = query({
  args: {
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
  },
  handler: async (ctx: QueryCtx, args: {
    difficulty: "easy" | "medium" | "hard" | "expert";
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const userHighScore = await ctx.db
      .query("tetrisHighScores")
      .withIndex("by_user_and_difficulty", (q) =>
        q.eq("userId", userId).eq("difficulty", args.difficulty)
      )
      .first();

    if (!userHighScore) {
      return null;
    }

    // Count how many scores are higher
    const allScores = await ctx.db
      .query("tetrisHighScores")
      .withIndex("by_difficulty_and_score", (q) =>
        q.eq("difficulty", args.difficulty)
      )
      .collect();

    const higherScores = allScores.filter((s: Doc<"tetrisHighScores">) => s.score > userHighScore.score);
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
    const allGames = await ctx.db.query("tetrisGames").collect();

    if (allGames.length === 0) {
      return {
        totalGames: 0,
        totalPlayers: 0,
        totalLines: 0,
        totalPieces: 0,
        averageScore: 0,
        highestScore: 0,
      };
    }

    const uniquePlayers = new Set(allGames.map((g: Doc<"tetrisGames">) => g.userId));
    const totalLines = allGames.reduce((sum: number, g: Doc<"tetrisGames">) => sum + g.lines, 0);
    const totalPieces = allGames.reduce((sum: number, g: Doc<"tetrisGames">) => sum + g.piecesPlaced, 0);
    const totalScore = allGames.reduce((sum: number, g: Doc<"tetrisGames">) => sum + g.score, 0);
    const highestScore = Math.max(...allGames.map((g: Doc<"tetrisGames">) => g.score));

    return {
      totalGames: allGames.length,
      totalPlayers: uniquePlayers.size,
      totalLines,
      totalPieces,
      averageScore: Math.floor(totalScore / allGames.length),
      highestScore,
    };
  },
});

/**
 * Get active multiplayer matches
 */
export const getActiveMatches = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    limit?: number;
  }) => {
    const limit = args.limit || 20;

    const matches = await ctx.db
      .query("tetrisMatches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .order("desc")
      .take(limit);

    // Enrich with participants
    const enriched = await Promise.all(
      matches.map(async (match: Doc<"tetrisMatches">) => {
        // NOTE: tetrisMatchParticipants table needs to be added to schema
        const participants = await ctx.db
          .query("tetrisMatchParticipants")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
          .collect();

        return {
          ...match,
          participants,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get specific match
 */
export const getMatch = query({
  args: {
    matchId: v.id("tetrisMatches"),
  },
  handler: async (ctx: QueryCtx, args: { matchId: Id<"tetrisMatches"> }) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      return null;
    }

    // NOTE: tetrisMatchParticipants table needs to be added to schema
    const participants = await ctx.db
      .query("tetrisMatchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();

    return {
      ...match,
      participants,
    };
  },
});

/**
 * Get match by room code
 */
export const getMatchByCode = query({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx: QueryCtx, args: { roomCode: string }) => {
    const match = await ctx.db
      .query("tetrisMatches")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.roomCode))
      .first();

    if (!match) {
      return null;
    }

    // NOTE: tetrisMatchParticipants table needs to be added to schema
    const participants = await ctx.db
      .query("tetrisMatchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", match._id))
      .collect();

    return {
      ...match,
      participants,
    };
  },
});

/**
 * Get user's match history
 */
export const getMatchHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    limit?: number;
  }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 10;

    // NOTE: tetrisMatchParticipants table needs to be added to schema
    const participants = await ctx.db
      .query("tetrisMatchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Get matches
    const matches = await Promise.all(
      participants.map(async (p: Doc<"tetrisMatchParticipants">) => {
        const match = await ctx.db.get(p.matchId);
        if (!match) return null;

        const allParticipants = await ctx.db
          .query("tetrisMatchParticipants")
          .withIndex("by_match", (q) => q.eq("matchId", p.matchId))
          .collect();

        return {
          ...match,
          participants: allParticipants,
          myParticipant: p,
        };
      })
    );

    return matches.filter((m: any) => m !== null);
  },
});

/**
 * Search games by criteria
 */
export const searchGames = query({
  args: {
    minScore: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard"),
        v.literal("expert")
      )
    ),
    hasReplay: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    minScore?: number;
    maxScore?: number;
    difficulty?: "easy" | "medium" | "hard" | "expert";
    hasReplay?: boolean;
    limit?: number;
  }) => {
    const limit = args.limit || 20;

    let gamesQuery = ctx.db.query("tetrisGames");

    if (args.difficulty) {
      gamesQuery = ctx.db
        .query("tetrisGames")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!));
    }

    let games = await gamesQuery.take(limit * 2); // Get more than needed for filtering

    // Apply filters
    if (args.minScore !== undefined) {
      games = games.filter((g: Doc<"tetrisGames">) => g.score >= args.minScore!);
    }
    if (args.maxScore !== undefined) {
      games = games.filter((g: Doc<"tetrisGames">) => g.score <= args.maxScore!);
    }
    if (args.hasReplay !== undefined) {
      games = games.filter((g: Doc<"tetrisGames">) => g.hasReplay === args.hasReplay);
    }

    // Take only requested amount
    return games.slice(0, limit);
  },
});

/**
 * Get top players by difficulty
 */
export const getTopPlayers = query({
  args: {
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: {
    difficulty: "easy" | "medium" | "hard" | "expert";
    limit?: number;
  }) => {
    const limit = args.limit || 10;

    const highScores = await ctx.db
      .query("tetrisHighScores")
      .withIndex("by_difficulty_and_score", (q) =>
        q.eq("difficulty", args.difficulty)
      )
      .order("desc")
      .take(limit);

    return highScores;
  },
});
