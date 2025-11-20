// convex/lib/boilerplate/games/dino/mutations.ts

/**
 * Dino Game Mutations
 *
 * Backend mutations specific to the Dino Jump game
 */

import { v } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { Doc, Id } from "../../../../_generated/dataModel";

/**
 * Save a completed Dino game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can save their own games
 */
export const saveGame = mutation({
  args: {
    score: v.number(),
    timePlayedMs: v.number(),
    gameMode: v.union(
      v.literal("classic"),
      v.literal("timed"),
      v.literal("obstacles"),
      v.literal("speed_run")
    ),
    distance: v.number(),
    obstaclesJumped: v.number(),
    obstaclesDucked: v.number(),
    totalObstacles: v.number(),
    highestSpeed: v.number(),
    averageSpeed: v.number(),
    perfectJumps: v.number(),
    nearMisses: v.number(),
    powerUpsCollected: v.optional(v.number()),
    isCompleted: v.boolean(),
    deathReason: v.optional(
      v.union(v.literal("collision"), v.literal("time_up"), v.literal("quit"))
    ),
    averageFPS: v.number(),
    hasReplay: v.boolean(),
    replayId: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      score: number;
      timePlayedMs: number;
      gameMode: "classic" | "timed" | "obstacles" | "speed_run";
      distance: number;
      obstaclesJumped: number;
      obstaclesDucked: number;
      totalObstacles: number;
      highestSpeed: number;
      averageSpeed: number;
      perfectJumps: number;
      nearMisses: number;
      powerUpsCollected?: number;
      isCompleted: boolean;
      deathReason?: "collision" | "time_up" | "quit";
      averageFPS: number;
      hasReplay: boolean;
      replayId?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'dinoGames');

    // Save game
    const gameDbId = await ctx.db.insert("dinoGames", {
      publicId,
      gameId: "dino",
      userId,
      score: args.score,
      timePlayedMs: args.timePlayedMs,
      gameMode: args.gameMode,
      distance: args.distance,
      obstaclesJumped: args.obstaclesJumped,
      obstaclesDucked: args.obstaclesDucked,
      totalObstacles: args.totalObstacles,
      highestSpeed: args.highestSpeed,
      averageSpeed: args.averageSpeed,
      perfectJumps: args.perfectJumps,
      nearMisses: args.nearMisses,
      powerUpsCollected: args.powerUpsCollected || 0,
      isCompleted: args.isCompleted,
      deathReason: args.deathReason,
      averageFPS: args.averageFPS,
      hasReplay: args.hasReplay,
      replayId: args.replayId,
      startedAt: now - args.timePlayedMs,
      completedAt: args.isCompleted ? now : undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // Update or create high score for this mode
    const existingHighScore = await ctx.db
      .query("dinoHighScores")
      .withIndex("by_user_and_mode", (q) =>
        q.eq("userId", userId).eq("gameMode", args.gameMode)
      )
      .first();

    if (!existingHighScore || args.score > existingHighScore.score) {
      // Calculate global rank (simplified - just count higher scores)
      const allScores = await ctx.db
        .query("dinoHighScores")
        .withIndex("by_mode_score", (q) => q.eq("gameMode", args.gameMode))
        .collect();

      const higherScores = allScores.filter((s: Doc<"dinoHighScores">) => s.score > args.score);
      const globalRank = higherScores.length + 1;

      if (existingHighScore) {
        // Update existing high score
        await ctx.db.patch(existingHighScore._id, {
          gameId: gameDbId.toString(),
          score: args.score,
          distance: args.distance,
          duration: args.timePlayedMs,
          obstaclesJumped: args.obstaclesJumped,
          highestSpeed: args.highestSpeed,
          perfectJumps: args.perfectJumps,
          globalRank,
          modeRank: globalRank,
          achievedAt: now,
        });
      } else {
        // Create new high score
        const highScorePublicId = await generateUniquePublicId(ctx, 'dinoHighScores');
        await ctx.db.insert("dinoHighScores", {
          publicId: highScorePublicId,
          userId,
          gameId: gameDbId.toString(),
          score: args.score,
          distance: args.distance,
          gameMode: args.gameMode,
          duration: args.timePlayedMs,
          obstaclesJumped: args.obstaclesJumped,
          highestSpeed: args.highestSpeed,
          perfectJumps: args.perfectJumps,
          globalRank,
          modeRank: globalRank,
          achievedAt: now,
          createdAt: now,
          updatedAt: now,
          createdBy: user._id,
        });
      }
    }

    // Update player statistics
    const existingStats = await ctx.db
      .query("dinoPlayerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStats) {
      // Update existing stats
      const newHighScores = { ...existingStats.highScores };
      if (!newHighScores[args.gameMode] || args.score > newHighScores[args.gameMode]!) {
        newHighScores[args.gameMode] = args.score;
      }

      await ctx.db.patch(existingStats._id, {
        totalGamesPlayed: existingStats.totalGamesPlayed + 1,
        totalGamesCompleted: existingStats.totalGamesCompleted + (args.isCompleted ? 1 : 0),
        totalPlayTimeMs: existingStats.totalPlayTimeMs + args.timePlayedMs,
        highScores: newHighScores,
        totalScore: existingStats.totalScore + args.score,
        totalDistance: existingStats.totalDistance + args.distance,
        longestRun: Math.max(existingStats.longestRun, args.distance),
        longestGameMs: Math.max(existingStats.longestGameMs, args.timePlayedMs),
        totalObstaclesJumped: existingStats.totalObstaclesJumped + args.obstaclesJumped,
        totalObstaclesDucked: existingStats.totalObstaclesDucked + args.obstaclesDucked,
        totalPerfectJumps: existingStats.totalPerfectJumps + args.perfectJumps,
        totalNearMisses: existingStats.totalNearMisses + args.nearMisses,
        totalPowerUps: existingStats.totalPowerUps + (args.powerUpsCollected || 0),
        highestSpeedEver: Math.max(existingStats.highestSpeedEver, args.highestSpeed),
        deathsByCollision:
          existingStats.deathsByCollision + (args.deathReason === "collision" ? 1 : 0),
        deathsByTimeUp:
          existingStats.deathsByTimeUp + (args.deathReason === "time_up" ? 1 : 0),
        currentSurvivalStreak: args.isCompleted
          ? existingStats.currentSurvivalStreak + 1
          : 0,
        longestSurvivalStreak: Math.max(
          existingStats.longestSurvivalStreak,
          args.isCompleted ? existingStats.currentSurvivalStreak + 1 : 0
        ),
        lastPlayedAt: now,
        updatedAt: now,
      });
    } else {
      // Create new stats
      await ctx.db.insert("dinoPlayerStats", {
        userId,
        totalGamesPlayed: 1,
        totalGamesCompleted: args.isCompleted ? 1 : 0,
        totalPlayTimeMs: args.timePlayedMs,
        highScores: {
          [args.gameMode]: args.score,
        },
        totalScore: args.score,
        totalDistance: args.distance,
        longestRun: args.distance,
        longestGameMs: args.timePlayedMs,
        totalObstaclesJumped: args.obstaclesJumped,
        totalObstaclesDucked: args.obstaclesDucked,
        totalPerfectJumps: args.perfectJumps,
        totalNearMisses: args.nearMisses,
        totalPowerUps: args.powerUpsCollected || 0,
        highestSpeedEver: args.highestSpeed,
        deathsByCollision: args.deathReason === "collision" ? 1 : 0,
        deathsByTimeUp: args.deathReason === "time_up" ? 1 : 0,
        currentPlayStreak: 1,
        longestPlayStreak: 1,
        currentSurvivalStreak: args.isCompleted ? 1 : 0,
        longestSurvivalStreak: args.isCompleted ? 1 : 0,
        lastPlayedAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
      });
    }

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dino.game_saved',
      entityType: 'game_session',
      entityId: publicId,
      entityTitle: `Dino Game - ${args.gameMode}`,
      description: `Completed dino game with score ${args.score}`,
      metadata: {
        gameMode: args.gameMode,
        score: args.score,
        distance: args.distance,
        isCompleted: args.isCompleted,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return gameDbId;
  },
});

/**
 * Delete a Dino game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can delete their own games
 */
export const deleteGame = mutation({
  args: {
    gameId: v.id("dinoGames"),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: Id<"dinoGames">;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;

    // ✅ Direct O(1) lookup
    const game = await ctx.db.get(args.gameId);
    if (!game || game.deletedAt) {
      throw new Error("Game not found");
    }

    // 🔒 Authorization
    if (game.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(args.gameId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dino.game_deleted',
      entityType: 'game_session',
      entityId: game.publicId,
      entityTitle: `Dino Game - ${game.gameMode}`,
      description: `Deleted dino game with score ${game.score}`,
      metadata: {
        gameMode: game.gameMode,
        score: game.score,
        distance: game.distance,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Update player statistics manually (admin only)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updatePlayerStats = mutation({
  args: {
    userId: v.id('userProfiles'),
    updates: v.object({
      totalGamesPlayed: v.optional(v.number()),
      totalGamesCompleted: v.optional(v.number()),
      totalPlayTimeMs: v.optional(v.number()),
      totalScore: v.optional(v.number()),
      totalDistance: v.optional(v.number()),
    }),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      userId: string;
      updates: {
        totalGamesPlayed?: number;
        totalGamesCompleted?: number;
        totalPlayTimeMs?: number;
        totalScore?: number;
        totalDistance?: number;
      };
    }
  ) => {
    // 🔒 Authenticate & authorize (admin only)
    const user = await requirePermission(ctx, 'admin.manage_users', { allowAdmin: true });

    const stats = await ctx.db
      .query("dinoPlayerStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) {
      throw new Error("Player stats not found");
    }

    const now = Date.now();

    await ctx.db.patch(stats._id, {
      ...args.updates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'dino.stats_updated',
      entityType: 'game_stats',
      entityId: args.userId,
      entityTitle: 'Dino Player Stats',
      description: `Updated dino player statistics for user ${args.userId}`,
      metadata: {
        updates: args.updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});
