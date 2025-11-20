/**
 * Achievement System Queries
 *
 * Backend queries for the universal achievement system
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc } from "../../../../_generated/dataModel";

/**
 * Get all achievements for a game
 */
export const getGameAchievements = query({
  args: {
    gameId: v.string(),
    includeHidden: v.optional(v.boolean()),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      includeHidden?: boolean;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    const includeHidden = args.includeHidden ?? false;

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // If not including hidden, filter them out unless user has unlocked them
    if (!includeHidden && identity) {
      const userId = identity.subject;
      const userAchievements = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_and_game", (q) =>
          q.eq("userId", userId).eq("gameId", args.gameId)
        )
        .collect();

      const unlockedIds = new Set(
        userAchievements.filter((ua: Doc<"userAchievements">) => ua.isUnlocked).map((ua: Doc<"userAchievements">) => ua.achievementId)
      );

      return achievements.filter((a: Doc<"achievements">) => !a.hidden || unlockedIds.has(a.achievementId));
    }

    return includeHidden ? achievements : achievements.filter((a: Doc<"achievements">) => !a.hidden);
  },
});

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = query({
  args: {
    gameId: v.string(),
    category: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      category: string;
    }
  ) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_category", (q) =>
        q.eq("gameId", args.gameId).eq("category", args.category)
      )
      .collect();

    return achievements;
  },
});

/**
 * Get user's achievements for a game
 */
export const getUserAchievements = query({
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
      return [];
    }

    const userId = identity.subject;

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", args.gameId)
      )
      .collect();

    // Enrich with achievement details
    const enriched = await Promise.all(
      userAchievements.map(async (ua: Doc<"userAchievements">) => {
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_game_and_id", (q) =>
            q.eq("gameId", args.gameId).eq("achievementId", ua.achievementId)
          )
          .first();

        return {
          ...ua,
          achievement: achievement || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get user's unlocked achievements
 */
export const getUserUnlockedAchievements = query({
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
      return [];
    }

    const userId = identity.subject;

    const unlocked = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", args.gameId)
      )
      .filter((q) => q.eq(q.field("isUnlocked"), true))
      .collect();

    // Enrich with achievement details
    const enriched = await Promise.all(
      unlocked.map(async (ua: Doc<"userAchievements">) => {
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_game_and_id", (q) =>
            q.eq("gameId", args.gameId).eq("achievementId", ua.achievementId)
          )
          .first();

        return {
          ...ua,
          achievement: achievement || null,
        };
      })
    );

    return enriched.filter((e: any) => e.achievement !== null);
  },
});

/**
 * Get achievement progress for user
 */
export const getAchievementProgress = query({
  args: {
    gameId: v.string(),
    achievementId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
      achievementId: string;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const userAchievement = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_game_achievement", (q) =>
        q.eq("userId", userId)
          .eq("gameId", args.gameId)
          .eq("achievementId", args.achievementId)
      )
      .first();

    if (!userAchievement) {
      return {
        progress: 0,
        maxProgress: 100,
        isUnlocked: false,
        percentage: 0,
      };
    }

    return {
      ...userAchievement,
      percentage: (userAchievement.progress / userAchievement.maxProgress) * 100,
    };
  },
});

/**
 * Get user's achievement statistics
 */
export const getUserAchievementStats = query({
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

    // Get all achievements for game
    const allAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Get user's achievements
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", userId).eq("gameId", args.gameId)
      )
      .collect();

    const unlocked = userAchievements.filter((ua: Doc<"userAchievements">) => ua.isUnlocked);
    const totalPoints = unlocked.reduce((sum: number, ua: Doc<"userAchievements">) => {
      const achievement = allAchievements.find((a: Doc<"achievements">) => a.achievementId === ua.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);

    const maxPoints = allAchievements.reduce((sum: number, a: Doc<"achievements">) => sum + a.points, 0);

    return {
      total: allAchievements.length,
      unlocked: unlocked.length,
      locked: allAchievements.length - unlocked.length,
      completionPercentage: (unlocked.length / allAchievements.length) * 100,
      totalPoints,
      maxPoints,
      recentlyUnlocked: unlocked
        .sort((a: Doc<"userAchievements">, b: Doc<"userAchievements">) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 5),
    };
  },
});

/**
 * Get recently unlocked achievements (across all users)
 */
export const getRecentlyUnlockedAchievements = query({
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

    const recent = await ctx.db
      .query("userAchievements")
      .withIndex("by_unlocked", (q) =>
        q.eq("gameId", args.gameId).eq("isUnlocked", true)
      )
      .order("desc")
      .take(limit);

    // Enrich with achievement details
    const enriched = await Promise.all(
      recent.map(async (ua: Doc<"userAchievements">) => {
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_game_and_id", (q) =>
            q.eq("gameId", args.gameId).eq("achievementId", ua.achievementId)
          )
          .first();

        return {
          ...ua,
          achievement: achievement || null,
        };
      })
    );

    return enriched.filter((e: any) => e.achievement !== null);
  },
});

/**
 * Get rarest achievements (lowest unlock percentage)
 */
export const getRarestAchievements = query({
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

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Sort by unlock count (ascending)
    const sorted = achievements.sort((a: Doc<"achievements">, b: Doc<"achievements">) => a.unlockedCount - b.unlockedCount);

    return sorted.slice(0, limit);
  },
});

/**
 * Get achievement categories for a game
 */
export const getAchievementCategories = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Group by category
    const categories = new Map<string, number>();
    achievements.forEach((a: Doc<"achievements">) => {
      const category = a.category || "Other";
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  },
});
