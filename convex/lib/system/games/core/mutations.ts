// convex/lib/boilerplate/games/core/mutations.ts

import { v } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { Doc, Id } from "../../../../_generated/dataModel";
import { metadataSchema } from "../../../../schema/base";

/**
 * Save a game score
 * 🔒 Authentication: Required
 * 🔒 Authorization: Any authenticated user can save their own scores
 */
export const saveScore = mutation({
  args: {
    gameId: v.string(),
    gameName: v.string(),
    score: v.number(),
    timePlayedMs: v.number(),
    isHighScore: v.boolean(),
    isCompleted: v.boolean(),
    metadata: v.optional(metadataSchema),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: string;
      gameName: string;
      score: number;
      timePlayedMs: number;
      isHighScore: boolean;
      isCompleted: boolean;
      metadata?: typeof metadataSchema.type;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;

    const now = Date.now();

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'gameScores');

    // Save score
    const scoreId = await ctx.db.insert("gameScores", {
      publicId,
      gameId: args.gameId,
      gameName: args.gameName.trim(),
      userId,
      userName: user.name || user.email || "Anonymous",
      score: args.score,
      timePlayedMs: args.timePlayedMs,
      isHighScore: args.isHighScore,
      isCompleted: args.isCompleted,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Update leaderboard
    await updateLeaderboard(ctx, args.gameId, userId, args.score, user);

    // Update progress
    await updateProgress(ctx, args.gameId, userId, args.score, args.timePlayedMs, user);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.created',
      entityType: 'game_score',
      entityId: publicId,
      entityTitle: `${args.gameName} - Score: ${args.score}`,
      description: `Saved ${args.gameName} score of ${args.score}${args.isHighScore ? ' (New High Score!)' : ''}`,
      metadata: {
        gameId: args.gameId,
        gameName: args.gameName,
        score: args.score,
        isHighScore: args.isHighScore,
        isCompleted: args.isCompleted,
        timePlayedMs: args.timePlayedMs,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return scoreId;
  },
});

/**
 * Delete a game score
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can only delete their own scores (or admin)
 */
export const deleteScore = mutation({
  args: {
    scoreId: v.id("gameScores"),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      scoreId: Id<"gameScores">;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;

    // ✅ Direct O(1) lookup
    const score = await ctx.db.get(args.scoreId);
    if (!score || score.deletedAt) {
      throw new Error("Score not found");
    }

    // 🔒 Authorization: Only allow users to delete their own scores
    if (score.userId !== userId) {
      throw new Error("Unauthorized to delete this score");
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(args.scoreId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.deleted',
      entityType: 'game_score',
      entityId: score.publicId || String(args.scoreId),
      entityTitle: `${score.gameName} - Score: ${score.score}`,
      description: `Deleted ${score.gameName} score of ${score.score}`,
      metadata: {
        gameId: score.gameId,
        gameName: score.gameName,
        score: score.score,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Update game progress
 */
async function updateProgress(
  ctx: MutationCtx,
  gameId: string,
  userId: string,
  score: number,
  timePlayedMs: number,
  user: Doc<"userProfiles">
) {
  const existing = await ctx.db
    .query("gameProgress")
    .withIndex("by_user_and_game", (q) => q.eq("userId", userId).eq("gameId", gameId))
    .first();

  const now = Date.now();

  if (existing) {
    // Update existing progress
    await ctx.db.patch(existing._id, {
      gamesPlayed: existing.gamesPlayed + 1,
      totalScore: existing.totalScore + score,
      highScore: Math.max(existing.highScore, score),
      totalPlayTimeMs: existing.totalPlayTimeMs + timePlayedMs,
      averagePlayTimeMs:
        (existing.totalPlayTimeMs + timePlayedMs) / (existing.gamesPlayed + 1),
      lastPlayedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });
  } else {
    // Create new progress entry
    await ctx.db.insert("gameProgress", {
      userId,
      gameId,
      level: 1,
      experience: 0,
      gamesPlayed: 1,
      totalScore: score,
      highScore: score,
      totalPlayTimeMs: timePlayedMs,
      averagePlayTimeMs: timePlayedMs,
      achievementsUnlocked: 0,
      totalAchievementPoints: 0,
      firstPlayedAt: now,
      lastPlayedAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  }
}

/**
 * Update leaderboard
 */
async function updateLeaderboard(ctx: MutationCtx, gameId: string, userId: string, score: number, user: Doc<"userProfiles">) {
  const existing = await ctx.db
    .query("gameLeaderboards")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("gameId"), gameId))
    .first();

  const now = Date.now();

  if (existing) {
    // Only update if this is a new high score
    if (score > existing.topScore) {
      const newAverage =
        (existing.averageScore * existing.totalGames + score) / (existing.totalGames + 1);

      await ctx.db.patch(existing._id, {
        topScore: score,
        totalGames: existing.totalGames + 1,
        averageScore: newAverage,
        lastPlayedAt: now,
        updatedAt: now,
        updatedBy: user._id,
      });
    } else {
      // Just update stats
      const newAverage =
        (existing.averageScore * existing.totalGames + score) / (existing.totalGames + 1);

      await ctx.db.patch(existing._id, {
        totalGames: existing.totalGames + 1,
        averageScore: newAverage,
        lastPlayedAt: now,
        updatedAt: now,
        updatedBy: user._id,
      });
    }
  } else {
    // Create new leaderboard entry
    await ctx.db.insert("gameLeaderboards", {
      gameId,
      userId,
      userName: user.name || user.email || "Anonymous",
      topScore: score,
      totalGames: 1,
      totalWins: 0,
      averageScore: score,
      lastPlayedAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  }
}
