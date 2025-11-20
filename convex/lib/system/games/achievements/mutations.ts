// convex/lib/boilerplate/games/achievements/mutations.ts

/**
 * Achievement System Mutations
 *
 * Backend mutations for the universal achievement system
 */

import { v, Infer } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create or update achievement definition
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const upsertAchievement = mutation({
  args: {
    achievementId: v.string(),
    gameId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.optional(v.string()),
    points: v.number(),
    rarity: v.optional(v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    )),
    hidden: v.boolean(),
    criteria: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      achievementId: string;
      gameId: string;
      name: string;
      description: string;
      icon: string;
      category?: string;
      points: number;
      rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
      hidden: boolean;
      criteria?: string;
    }
  ) => {
    // 🔒 Authenticate & authorize (admin only)
    const user = await requirePermission(ctx, 'admin.manage_content', { allowAdmin: true });

    const now = Date.now();

    // Check if achievement exists
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_game_and_id", (q) =>
        q.eq("gameId", args.gameId).eq("achievementId", args.achievementId)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        name: args.name.trim(),
        description: args.description.trim(),
        icon: args.icon,
        category: args.category,
        points: args.points,
        rarity: args.rarity,
        hidden: args.hidden,
        criteria: args.criteria,
        updatedAt: now,
        updatedBy: user._id,
      });
      return existing._id;
    } else {
      // Generate unique public ID
      const publicId = await generateUniquePublicId(ctx, 'achievements');

      // Create new
      const achievementId = await ctx.db.insert("achievements", {
        publicId,
        achievementId: args.achievementId,
        gameId: args.gameId,
        name: args.name.trim(),
        description: args.description.trim(),
        icon: args.icon,
        category: args.category,
        points: args.points,
        rarity: args.rarity,
        hidden: args.hidden,
        criteria: args.criteria,
        unlockedCount: 0,
        unlockedPercentage: 0,
        metadata: {},
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
        updatedBy: user._id,
      });

      // Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'achievement.created',
        entityType: 'game_achievement',
        entityId: args.achievementId,
        entityTitle: args.name,
        description: `Created achievement '${args.name}' for game '${args.gameId}'`,
        metadata: {
          gameId: args.gameId,
          points: args.points,
          rarity: args.rarity,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return achievementId;
    }
  },
});

/**
 * Unlock achievement for user
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can unlock their own achievements
 */
export const unlockAchievement = mutation({
  args: {
    gameId: v.string(),
    achievementId: v.string(),
    score: v.optional(v.number()),
    context: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: string;
      achievementId: string;
      score?: number;
      context?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId; // Use authUserId for userId field
    const now = Date.now();

    // Check if already unlocked
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_game_achievement", (q) =>
        q.eq("userId", userId)
          .eq("gameId", args.gameId)
          .eq("achievementId", args.achievementId)
      )
      .first();

    if (existing && existing.isUnlocked) {
      return { alreadyUnlocked: true, achievementId: existing._id };
    }

    // Get achievement definition
    const achievement = await ctx.db
      .query("achievements")
      .withIndex("by_game_and_id", (q) =>
        q.eq("gameId", args.gameId).eq("achievementId", args.achievementId)
      )
      .first();

    if (!achievement) {
      throw new Error("Achievement not found");
    }

    if (existing) {
      // Update existing to unlocked
      await ctx.db.patch(existing._id, {
        isUnlocked: true,
        progress: existing.maxProgress,
        unlockedAt: now,
        unlockedScore: args.score,
        unlockContext: args.context,
        updatedAt: now,
      });

      // Update achievement unlock count
      await ctx.db.patch(achievement._id, {
        unlockedCount: achievement.unlockedCount + 1,
        updatedAt: now,
      });

      // Update game progress
      await updateGameProgressAchievements(ctx, args.gameId, userId, achievement.points);

      // Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'achievement.unlocked',
        entityType: 'game_achievement',
        entityId: args.achievementId,
        entityTitle: achievement.name,
        description: `Unlocked achievement '${achievement.name}'`,
        metadata: {
          gameId: args.gameId,
          score: args.score,
          points: achievement.points,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return { alreadyUnlocked: false, achievementId: existing._id };
    } else {
      // Create new unlock
      const userAchievementId = await ctx.db.insert("userAchievements", {
        userId,
        gameId: args.gameId,
        achievementId: args.achievementId,
        progress: 100,
        maxProgress: 100,
        isUnlocked: true,
        unlockedAt: now,
        unlockedScore: args.score,
        unlockContext: args.context,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Update achievement unlock count
      await ctx.db.patch(achievement._id, {
        unlockedCount: achievement.unlockedCount + 1,
        updatedAt: now,
      });

      // Update game progress
      await updateGameProgressAchievements(ctx, args.gameId, userId, achievement.points);

      // Create audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'achievement.unlocked',
        entityType: 'game_achievement',
        entityId: args.achievementId,
        entityTitle: achievement.name,
        description: `Unlocked achievement '${achievement.name}'`,
        metadata: {
          gameId: args.gameId,
          score: args.score,
          points: achievement.points,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return { alreadyUnlocked: false, achievementId: userAchievementId };
    }
  },
});

/**
 * Update achievement progress
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can update their own progress
 */
export const updateAchievementProgress = mutation({
  args: {
    gameId: v.string(),
    achievementId: v.string(),
    progress: v.number(),
    maxProgress: v.number(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: string;
      achievementId: string;
      progress: number;
      maxProgress: number;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Check if user achievement exists
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_game_achievement", (q) =>
        q.eq("userId", userId)
          .eq("gameId", args.gameId)
          .eq("achievementId", args.achievementId)
      )
      .first();

    if (existing) {
      // Update progress
      await ctx.db.patch(existing._id, {
        progress: args.progress,
        maxProgress: args.maxProgress,
        updatedAt: now,
        updatedBy: user._id,
      });

      // Auto-unlock if complete
      if (args.progress >= args.maxProgress && !existing.isUnlocked) {
        await ctx.db.patch(existing._id, {
          isUnlocked: true,
          unlockedAt: now,
        });

        // Update achievement unlock count
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_game_and_id", (q) =>
            q.eq("gameId", args.gameId).eq("achievementId", args.achievementId)
          )
          .first();

        if (achievement) {
          await ctx.db.patch(achievement._id, {
            unlockedCount: achievement.unlockedCount + 1,
            updatedAt: now,
          });

          // Update game progress
          await updateGameProgressAchievements(ctx, args.gameId, userId, achievement.points);
        }
      }

      return existing._id;
    } else {
      // Create new
      const userAchievementId = await ctx.db.insert("userAchievements", {
        userId,
        gameId: args.gameId,
        achievementId: args.achievementId,
        progress: args.progress,
        maxProgress: args.maxProgress,
        isUnlocked: args.progress >= args.maxProgress,
        unlockedAt: args.progress >= args.maxProgress ? now : undefined,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
        updatedBy: user._id,
      });

      // If auto-unlocked, update counts
      if (args.progress >= args.maxProgress) {
        const achievement = await ctx.db
          .query("achievements")
          .withIndex("by_game_and_id", (q) =>
            q.eq("gameId", args.gameId).eq("achievementId", args.achievementId)
          )
          .first();

        if (achievement) {
          await ctx.db.patch(achievement._id, {
            unlockedCount: achievement.unlockedCount + 1,
            updatedAt: now,
          });

          await updateGameProgressAchievements(ctx, args.gameId, userId, achievement.points);
        }
      }

      // Create audit log for progress update
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'achievement.progress_updated',
        entityType: 'game_achievement',
        entityId: args.achievementId,
        entityTitle: `Progress: ${args.progress}/${args.maxProgress}`,
        description: `Updated achievement progress for '${args.achievementId}' to ${args.progress}/${args.maxProgress}`,
        metadata: {
          gameId: args.gameId,
          progress: args.progress,
          maxProgress: args.maxProgress,
          isUnlocked: args.progress >= args.maxProgress,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return userAchievementId;
    }
  },
});

/**
 * Batch unlock multiple achievements (for checking after game)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can unlock their own achievements
 */
export const checkAndUnlockAchievements = mutation({
  args: {
    gameId: v.string(),
    achievementIds: v.array(v.string()),
    score: v.optional(v.number()),
    context: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: string;
      achievementIds: string[];
      score?: number;
      context?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const unlockedAchievements: Array<{
      achievementId: string;
      name: string;
      description: string;
      icon: string;
      points: number;
    }> = [];

    for (const achievementId of args.achievementIds) {
      // Check if already unlocked
      const existing = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_game_achievement", (q) =>
          q.eq("userId", userId)
            .eq("gameId", args.gameId)
            .eq("achievementId", achievementId)
        )
        .first();

      if (!existing || !existing.isUnlocked) {
        // Unlock it
        const result = await unlockAchievement(ctx, {
          gameId: args.gameId,
          achievementId,
          score: args.score,
          context: args.context,
        });

        if (!result.alreadyUnlocked) {
          // Get achievement details
          const achievement = await ctx.db
            .query("achievements")
            .withIndex("by_game_and_id", (q) =>
              q.eq("gameId", args.gameId).eq("achievementId", achievementId)
            )
            .first();

          if (achievement) {
            unlockedAchievements.push({
              achievementId: achievement.achievementId,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points,
            });
          }
        }
      }
    }

    // Create audit log for batch unlock
    if (unlockedAchievements.length > 0) {
      const now = Date.now();
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'achievement.batch_unlocked',
        entityType: 'game_achievement',
        entityId: args.gameId,
        entityTitle: `Batch unlock: ${unlockedAchievements.length} achievements`,
        description: `Unlocked ${unlockedAchievements.length} achievements for game '${args.gameId}'`,
        metadata: {
          gameId: args.gameId,
          unlockedCount: unlockedAchievements.length,
          achievements: unlockedAchievements.map(a => a.achievementId),
          score: args.score,
        },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });
    }

    return { unlockedAchievements };
  },
});

/**
 * Helper: Update game progress with achievement data
 */
async function updateGameProgressAchievements(
  ctx: MutationCtx,
  gameId: string,
  userId: string,
  points: number
) {
  const progress = await ctx.db
    .query("gameProgress")
    .withIndex("by_user_and_game", (q) => q.eq("userId", userId).eq("gameId", gameId))
    .first();

  if (progress) {
    await ctx.db.patch(progress._id, {
      achievementsUnlocked: progress.achievementsUnlocked + 1,
      totalAchievementPoints: progress.totalAchievementPoints + points,
      updatedAt: Date.now(),
    });
  }
}
