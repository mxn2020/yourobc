// convex/lib/boilerplate/games/queries.ts

import { v } from "convex/values";
import { query, QueryCtx } from '@/generated/server';
import { Doc } from "../../../_generated/dataModel";
import { requireCurrentUser } from '@/shared/auth.helper';
import { getScoresArgs } from "./helpers";

/**
 * Game Queries
 * Backend functions for fetching game data
 */

/**
 * Get top scores for a game (leaderboard)
 */
export const getTopScores = query({
  args: { ...getScoresArgs },
  handler: async (ctx: QueryCtx, args: { gameName: string; limit?: number }) => {
    const limit = args.limit ?? 10;

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_score", (q) => q.eq("gameName", args.gameName))
      .order("desc")
      .take(limit);

    // Get user info for each score
    const scoresWithUsers = await Promise.all(
      scores.map(async (score: Doc<"gameScores">) => {
        const user = await ctx.db
          .query("userProfiles")
          .withIndex("by_auth_user_id", (q) => q.eq("authUserId", score.userId))
          .first();

        return {
          ...score,
          userName: user?.name ?? "Anonymous",
          userAvatar: user?.avatar,
        };
      })
    );

    return scoresWithUsers;
  },
});

/**
 * Get user's scores for a specific game
 */
export const getUserScores = query({
  args: { ...getScoresArgs },
  handler: async (ctx: QueryCtx, args: { gameName: string; limit?: number }) => {
    const currentUser = await requireCurrentUser(ctx);
    const userId = currentUser.authUserId;
    const limit = args.limit ?? 20;

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) =>
        q.eq("gameName", args.gameName).eq("userId", userId)
      )
      .order("desc")
      .take(limit);

    return scores;
  },
});

/**
 * Get user's best score for a game
 */
export const getUserBestScore = query({
  args: { gameName: v.string() },
  handler: async (ctx: QueryCtx, args: { gameName: string }) => {
    const currentUser = await requireCurrentUser(ctx);
    const userId = currentUser.authUserId;

    const bestScore = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) =>
        q.eq("gameName", args.gameName).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("isHighScore"), true))
      .first();

    return bestScore ?? null;
  },
});

/**
 * Get user's rank for a game
 */
export const getUserRank = query({
  args: { gameName: v.string() },
  handler: async (ctx: QueryCtx, args: { gameName: string }) => {
    const currentUser = await requireCurrentUser(ctx);
    const userId = currentUser.authUserId;

    // Get user's best score
    const userBestScore = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) =>
        q.eq("gameName", args.gameName).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("isHighScore"), true))
      .first();

    if (!userBestScore) {
      return { rank: null, totalPlayers: 0 };
    }

    // Get all high scores better than user's
    const betterScores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_score", (q) => q.eq("gameName", args.gameName))
      .filter((q) =>
        q.and(
          q.eq(q.field("isHighScore"), true),
          q.gt(q.field("score"), userBestScore.score)
        )
      )
      .collect();

    // Get total unique players
    const allHighScores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_name", (q) => q.eq("gameName", args.gameName))
      .filter((q) => q.eq(q.field("isHighScore"), true))
      .collect();

    const rank = betterScores.length + 1;
    const totalPlayers = allHighScores.length;

    return {
      rank,
      totalPlayers,
      score: userBestScore.score,
    };
  },
});

/**
 * Get game statistics
 */
export const getGameStats = query({
  args: { gameName: v.string() },
  handler: async (ctx: QueryCtx, args: { gameName: string }) => {
    const allScores = await ctx.db
      .query("gameScores")
      .withIndex("by_game_name", (q) => q.eq("gameName", args.gameName))
      .collect();

    if (allScores.length === 0) {
      return {
        totalGames: 0,
        totalPlayers: 0,
        highestScore: 0,
        averageScore: 0,
      };
    }

    const scores = allScores.map((s: Doc<"gameScores">) => s.score);
    const uniquePlayers = new Set(allScores.map((s: Doc<"gameScores">) => s.userId));

    return {
      totalGames: allScores.length,
      totalPlayers: uniquePlayers.size,
      highestScore: Math.max(...scores),
      averageScore: Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      ),
    };
  },
});
