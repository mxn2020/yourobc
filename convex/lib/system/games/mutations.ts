// convex/lib/boilerplate/games/mutations.ts

import { v } from "convex/values";
import { mutation, MutationCtx } from '@/generated/server';
import { Doc, Id } from "../../../_generated/dataModel";
import { requireCurrentUser } from '@/shared/auth.helper';
import {
  generateGameScoreId,
  validateScore,
  saveScoreArgs,
} from "./helpers";

/**
 * Save a game score
 * 🔒 Authentication: Required
 * 🔒 Authorization: Any authenticated user can save their own scores
 */
export const saveScore = mutation({
  args: saveScoreArgs,
  handler: async (ctx: MutationCtx, args: {
    gameName: string;
    score: number;
    timePlayedMs: number;
    obstaclesJumped: number;
    metadata?: {
      speed: number;
      difficulty: string;
      maxCombo?: number;
    };
  }) => {
    // Require authentication
    const currentUser = await requireCurrentUser(ctx);
    const userId = currentUser.authUserId;

    // Validate score
    if (!validateScore(args.score)) {
      throw new Error("Invalid score value");
    }

    // Get user's previous high score for this game
    const previousHighScore = await ctx.db
      .query("gameScores")
      .withIndex("by_game_and_user", (q) =>
        q.eq("gameName", args.gameName).eq("userId", userId)
      )
      .order("desc")
      .first();

    const isHighScore =
      !previousHighScore || args.score > previousHighScore.score;

    // If this is a new high score, mark previous high scores as false
    if (isHighScore && previousHighScore) {
      const allUserScores = await ctx.db
        .query("gameScores")
        .withIndex("by_game_and_user", (q) =>
          q.eq("gameName", args.gameName).eq("userId", userId)
        )
        .filter((q) => q.eq(q.field("isHighScore"), true))
        .collect();

      for (const score of allUserScores) {
        await ctx.db.patch(score._id, { isHighScore: false });
      }
    }

    // Create new score record
    const now = Date.now();
    const publicId = generateGameScoreId();
    const scoreId = await ctx.db.insert("gameScores", {
      publicId,
      userId,
      gameName: args.gameName.trim(),
      score: args.score,
      timePlayedMs: args.timePlayedMs,
      obstaclesJumped: args.obstaclesJumped,
      isHighScore,
      metadata: args.metadata,
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      userName: currentUser.name || currentUser.email || 'Unknown User',
      action: 'game_score.created',
      entityType: 'game_score',
      entityId: publicId,
      entityTitle: `${args.gameName} - Score: ${args.score}`,
      description: `Saved ${args.gameName} score of ${args.score}${isHighScore ? ' (New High Score!)' : ''}`,
      metadata: {
        gameName: args.gameName,
        score: args.score,
        isHighScore,
        timePlayedMs: args.timePlayedMs,
        obstaclesJumped: args.obstaclesJumped,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return {
      scoreId,
      isHighScore,
      previousHighScore: previousHighScore?.score ?? 0,
    };
  },
});

/**
 * Delete a game score
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can only delete their own scores
 */
export const deleteScore = mutation({
  args: { scoreId: v.id("gameScores") },
  handler: async (ctx: MutationCtx, args: { scoreId: Id<"gameScores"> }) => {
    // Require authentication
    const currentUser = await requireCurrentUser(ctx);
    const userId = currentUser.authUserId;

    // ✅ Direct O(1) lookup
    const score = await ctx.db.get(args.scoreId);
    if (!score) {
      throw new Error("Score not found");
    }

    // 🔒 Authorization: Only allow users to delete their own scores
    if (score.userId !== userId) {
      throw new Error("Unauthorized to delete this score");
    }

    const now = Date.now();

    // Soft delete: Mark as deleted instead of hard delete
    await ctx.db.patch(args.scoreId, {
      deletedAt: now,
      deletedBy: currentUser._id,
      updatedAt: now,
      updatedBy: currentUser._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      userName: currentUser.name || currentUser.email || 'Unknown User',
      action: 'game_score.deleted',
      entityType: 'game_score',
      entityId: score.publicId,
      entityTitle: `${score.gameName} - Score: ${score.score}`,
      description: `Deleted ${score.gameName} score of ${score.score}`,
      metadata: {
        gameName: score.gameName,
        score: score.score,
      },
      createdAt: now,
      createdBy: currentUser._id,
      updatedAt: now,
    });

    return { success: true };
  },
});
