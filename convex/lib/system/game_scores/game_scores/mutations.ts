// convex/lib/boilerplate/game_scores/game_scores/mutations.ts
// Write operations for game_scores module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { gameScoresValidators } from '@/schema/boilerplate/game_scores/game_scores/validators';
import { GAME_SCORES_CONSTANTS } from './constants';
import { validateGameScoreData, isHighScore } from './utils';
import {
  requireEditGameScoreAccess,
  requireDeleteGameScoreAccess,
  requireCreateGameScoreAccess,
} from './permissions';
import type { GameScoreId } from './types';

/**
 * Create new game score
 */
export const createGameScore = mutation({
  args: {
    data: v.object({
      gameName: v.string(),
      score: v.number(),
      level: v.optional(v.number()),
      timePlayedMs: v.number(),
      obstaclesJumped: v.number(),
      metadata: v.optional(
        v.object({
          speed: v.number(),
          difficulty: v.string(),
          maxCombo: v.optional(v.number()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }): Promise<GameScoreId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requireCreateGameScoreAccess(ctx, user);

    // 3. VALIDATE: Check data validity
    const errors = validateGameScoreData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'gameScores');
    const now = Date.now();

    // Check if this is a high score for this user and game
    const existingScores = await ctx.db
      .query('gameScores')
      .withIndex('by_game_and_user', (q) =>
        q.eq('gameName', data.gameName).eq('userId', user._id)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const currentHighScore = existingScores.length > 0
      ? Math.max(...existingScores.map((s) => s.score))
      : null;

    const isNewHighScore = isHighScore(data.score, currentHighScore);

    // If this is a new high score, mark all previous scores as not high scores
    if (isNewHighScore) {
      for (const oldScore of existingScores) {
        if (oldScore.isHighScore) {
          await ctx.db.patch(oldScore._id, {
            isHighScore: false,
            updatedAt: now,
            updatedBy: user._id,
          });
        }
      }
    }

    // 5. CREATE: Insert into database
    const scoreId = await ctx.db.insert('gameScores', {
      publicId,
      userId: user._id,
      gameName: data.gameName.trim(),
      score: data.score,
      level: data.level,
      timePlayedMs: data.timePlayedMs,
      obstaclesJumped: data.obstaclesJumped,
      isHighScore: isNewHighScore,
      metadata: data.metadata,
      extendedMetadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.created',
      entityType: 'game_score',
      entityId: publicId,
      entityTitle: `${data.gameName} - Score: ${data.score}`,
      description: `Submitted score ${data.score} for ${data.gameName}${isNewHighScore ? ' (NEW HIGH SCORE!)' : ''}`,
      metadata: {
        gameName: data.gameName,
        score: data.score,
        isHighScore: isNewHighScore,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return scoreId;
  },
});

/**
 * Update game score
 */
export const updateGameScore = mutation({
  args: {
    scoreId: v.id('gameScores'),
    data: v.object({
      score: v.optional(v.number()),
      level: v.optional(v.number()),
      timePlayedMs: v.optional(v.number()),
      obstaclesJumped: v.optional(v.number()),
      metadata: v.optional(
        v.object({
          speed: v.number(),
          difficulty: v.string(),
          maxCombo: v.optional(v.number()),
        })
      ),
    }),
  },
  handler: async (ctx, { scoreId, data }): Promise<void> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. FETCH: Get existing score
    const existingScore = await ctx.db.get(scoreId);
    if (!existingScore || existingScore.deletedAt) {
      throw new Error('Game score not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditGameScoreAccess(ctx, existingScore, user);

    // 4. VALIDATE: Check data validity
    const errors = validateGameScoreData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    // Track old values for audit
    const oldValues: any = {};
    const newValues: any = {};

    if (data.score !== undefined && data.score !== existingScore.score) {
      oldValues.score = existingScore.score;
      newValues.score = data.score;
      updateData.score = data.score;

      // Check if this is a new high score
      const otherScores = await ctx.db
        .query('gameScores')
        .withIndex('by_game_and_user', (q) =>
          q.eq('gameName', existingScore.gameName).eq('userId', user._id)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('deletedAt'), undefined),
            q.neq(q.field('_id'), scoreId)
          )
        )
        .collect();

      const otherHighScore = otherScores.length > 0
        ? Math.max(...otherScores.map((s) => s.score))
        : 0;

      const isNewHighScore = data.score > otherHighScore;
      updateData.isHighScore = isNewHighScore;

      // Update other scores if needed
      if (isNewHighScore) {
        for (const otherScore of otherScores) {
          if (otherScore.isHighScore) {
            await ctx.db.patch(otherScore._id, {
              isHighScore: false,
              updatedAt: now,
              updatedBy: user._id,
            });
          }
        }
      }
    }

    if (data.level !== undefined && data.level !== existingScore.level) {
      oldValues.level = existingScore.level;
      newValues.level = data.level;
      updateData.level = data.level;
    }

    if (data.timePlayedMs !== undefined && data.timePlayedMs !== existingScore.timePlayedMs) {
      oldValues.timePlayedMs = existingScore.timePlayedMs;
      newValues.timePlayedMs = data.timePlayedMs;
      updateData.timePlayedMs = data.timePlayedMs;
    }

    if (data.obstaclesJumped !== undefined && data.obstaclesJumped !== existingScore.obstaclesJumped) {
      oldValues.obstaclesJumped = existingScore.obstaclesJumped;
      newValues.obstaclesJumped = data.obstaclesJumped;
      updateData.obstaclesJumped = data.obstaclesJumped;
    }

    if (data.metadata !== undefined) {
      oldValues.metadata = existingScore.metadata;
      newValues.metadata = data.metadata;
      updateData.metadata = data.metadata;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(scoreId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.updated',
      entityType: 'game_score',
      entityId: existingScore.publicId,
      entityTitle: `${existingScore.gameName} - Score: ${existingScore.score}`,
      description: `Updated score for ${existingScore.gameName}`,
      metadata: {
        oldValues,
        newValues,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });
  },
});

/**
 * Delete game score (soft delete)
 */
export const deleteGameScore = mutation({
  args: {
    scoreId: v.id('gameScores'),
  },
  handler: async (ctx, { scoreId }): Promise<void> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. FETCH: Get existing score
    const existingScore = await ctx.db.get(scoreId);
    if (!existingScore || existingScore.deletedAt) {
      throw new Error('Game score not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteGameScoreAccess(ctx, existingScore, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(scoreId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. PROCESS: If this was a high score, recalculate high score for the user
    if (existingScore.isHighScore) {
      const remainingScores = await ctx.db
        .query('gameScores')
        .withIndex('by_game_and_user', (q) =>
          q.eq('gameName', existingScore.gameName).eq('userId', user._id)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('deletedAt'), undefined),
            q.neq(q.field('_id'), scoreId)
          )
        )
        .collect();

      if (remainingScores.length > 0) {
        // Find the new high score
        const newHighScore = remainingScores.reduce((max, s) =>
          s.score > max.score ? s : max
        );

        await ctx.db.patch(newHighScore._id, {
          isHighScore: true,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    }

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.deleted',
      entityType: 'game_score',
      entityId: existingScore.publicId,
      entityTitle: `${existingScore.gameName} - Score: ${existingScore.score}`,
      description: `Deleted score ${existingScore.score} for ${existingScore.gameName}`,
      metadata: {
        gameName: existingScore.gameName,
        score: existingScore.score,
        wasHighScore: existingScore.isHighScore,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });
  },
});

/**
 * Bulk delete game scores (admin only)
 */
export const bulkDeleteGameScores = mutation({
  args: {
    scoreIds: v.array(v.id('gameScores')),
  },
  handler: async (ctx, { scoreIds }): Promise<number> => {
    // 1. AUTH: Get authenticated user and verify admin
    const user = await requirePermission(
      ctx,
      GAME_SCORES_CONSTANTS.PERMISSIONS.MANAGE,
      { allowAdmin: true }
    );

    const now = Date.now();
    let deletedCount = 0;

    // 2. DELETE: Process each score
    for (const scoreId of scoreIds) {
      const score = await ctx.db.get(scoreId);
      if (score && !score.deletedAt) {
        await ctx.db.patch(scoreId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });
        deletedCount++;
      }
    }

    // 3. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.bulk_deleted',
      entityType: 'game_score',
      entityId: 'bulk_operation',
      entityTitle: `Bulk Delete: ${deletedCount} scores`,
      description: `Bulk deleted ${deletedCount} game scores`,
      metadata: {
        count: deletedCount,
        scoreIds: scoreIds.slice(0, 10), // Limit to first 10 for audit
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return deletedCount;
  },
});

/**
 * Reset user's scores for a game (admin only)
 */
export const resetUserGameScores = mutation({
  args: {
    userId: v.id('userProfiles'),
    gameName: v.string(),
  },
  handler: async (ctx, { userId, gameName }): Promise<number> => {
    // 1. AUTH: Get authenticated user and verify admin
    const user = await requirePermission(
      ctx,
      GAME_SCORES_CONSTANTS.PERMISSIONS.MANAGE,
      { allowAdmin: true }
    );

    // 2. FETCH: Get all user's scores for the game
    const scores = await ctx.db
      .query('gameScores')
      .withIndex('by_game_and_user', (q) =>
        q.eq('gameName', gameName).eq('userId', userId)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const now = Date.now();

    // 3. DELETE: Mark all as deleted
    for (const score of scores) {
      await ctx.db.patch(score._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // 4. AUDIT: Create audit log
    const targetUser = await ctx.db.get(userId);
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'game_score.reset',
      entityType: 'game_score',
      entityId: userId,
      entityTitle: `Reset scores for ${gameName}`,
      description: `Reset all scores for user ${targetUser?.name || 'Unknown'} in game ${gameName}`,
      metadata: {
        gameName,
        targetUserId: userId,
        targetUserName: targetUser?.name,
        count: scores.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return scores.length;
  },
});
