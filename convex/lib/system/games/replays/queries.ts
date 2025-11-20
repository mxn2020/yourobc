/**
 * Replay System Queries
 *
 * Backend queries for the universal replay system
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc } from "../../../../_generated/dataModel";

/**
 * Get replay by ID
 */
export const getReplay = query({
  args: {
    replayId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      replayId: string;
    }
  ) => {
    const replay = await ctx.db
      .query("replays")
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (!replay) {
      return null;
    }

    // Check if user has liked
    const identity = await ctx.auth.getUserIdentity();
    let hasLiked = false;

    if (identity) {
      const like = await ctx.db
        .query("replayLikes")
        .withIndex("by_replay_and_user", (q) =>
          q.eq("replayId", args.replayId).eq("userId", identity.subject)
        )
        .first();

      hasLiked = !!like;
    }

    return {
      ...replay,
      hasLiked,
    };
  },
});

/**
 * Get user's replays
 */
export const getUserReplays = query({
  args: {
    gameId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId?: string;
      limit?: number;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 20;

    let replaysQuery = ctx.db
      .query("replays")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.gameId) {
      replaysQuery = ctx.db
        .query("replays")
        .withIndex("by_game_and_user", (q) =>
          q.eq("gameId", args.gameId).eq("userId", userId)
        );
    }

    const replays = await replaysQuery.order("desc").take(limit);

    return replays;
  },
});

/**
 * Get public replays for a game
 */
export const getPublicReplays = query({
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
    const limit = args.limit || 20;

    const replays = await ctx.db
      .query("replays")
      .withIndex("by_public", (q) =>
        q.eq("gameId", args.gameId).eq("isPublic", true)
      )
      .order("desc")
      .take(limit);

    return replays;
  },
});

/**
 * Get featured replays
 */
export const getFeaturedReplays = query({
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

    const replays = await ctx.db
      .query("replays")
      .withIndex("by_featured", (q) =>
        q.eq("gameId", args.gameId).eq("isFeatured", true)
      )
      .order("desc")
      .take(limit);

    return replays;
  },
});

/**
 * Get top replays by score
 */
export const getTopReplays = query({
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
    const limit = args.limit || 20;

    const replays = await ctx.db
      .query("replays")
      .withIndex("by_score", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(limit);

    return replays.filter((r: Doc<"replays">) => r.isPublic);
  },
});

/**
 * Get most viewed replays
 */
export const getMostViewedReplays = query({
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
    const limit = args.limit || 20;

    const allReplays = await ctx.db
      .query("replays")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const publicReplays = allReplays.filter((r: Doc<"replays">) => r.isPublic);
    const sorted = publicReplays.sort((a: Doc<"replays">, b: Doc<"replays">) => b.views - a.views);

    return sorted.slice(0, limit);
  },
});

/**
 * Get most liked replays
 */
export const getMostLikedReplays = query({
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
    const limit = args.limit || 20;

    const allReplays = await ctx.db
      .query("replays")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const publicReplays = allReplays.filter((r: Doc<"replays">) => r.isPublic);
    const sorted = publicReplays.sort((a: Doc<"replays">, b: Doc<"replays">) => b.likes - a.likes);

    return sorted.slice(0, limit);
  },
});

/**
 * Get replay comments
 */
export const getReplayComments = query({
  args: {
    replayId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      replayId: string;
    }
  ) => {
    const comments = await ctx.db
      .query("replayComments")
      .withIndex("by_replay", (q) => q.eq("replayId", args.replayId))
      .order("desc")
      .collect();

    return comments;
  },
});

/**
 * Search replays by tags
 */
export const searchReplaysByTags = query({
  args: {
    gameId: v.string(),
    tags: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      tags: string[];
      limit?: number;
    }
  ) => {
    const limit = args.limit || 20;

    const allReplays = await ctx.db
      .query("replays")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Filter by tags
    const matching = allReplays.filter((r: Doc<"replays">) => {
      if (!r.isPublic) return false;
      if (!r.tags || r.tags.length === 0) return false;

      return args.tags.some((tag: string) => r.tags?.includes(tag));
    });

    // Sort by creation date (newest first)
    const sorted = matching.sort((a: Doc<"replays">, b: Doc<"replays">) => b.createdAt - a.createdAt);

    return sorted.slice(0, limit);
  },
});

/**
 * Get replay statistics
 */
export const getReplayStats = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const replays = await ctx.db
      .query("replays")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const publicReplays = replays.filter((r: Doc<"replays">) => r.isPublic);
    const totalViews = replays.reduce((sum: number, r: Doc<"replays">) => sum + r.views, 0);
    const totalLikes = replays.reduce((sum: number, r: Doc<"replays">) => sum + r.likes, 0);

    return {
      totalReplays: replays.length,
      publicReplays: publicReplays.length,
      totalViews,
      totalLikes,
      averageViews: replays.length > 0 ? totalViews / replays.length : 0,
      averageLikes: replays.length > 0 ? totalLikes / replays.length : 0,
    };
  },
});

/**
 * Check if user has liked a replay
 */
export const hasLikedReplay = query({
  args: {
    replayId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      replayId: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const like = await ctx.db
      .query("replayLikes")
      .withIndex("by_replay_and_user", (q) =>
        q.eq("replayId", args.replayId).eq("userId", identity.subject)
      )
      .first();

    return !!like;
  },
});
