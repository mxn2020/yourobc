// convex/lib/boilerplate/games/tetris/mutations.ts

/**
 * Tetris Game Mutations
 *
 * Backend mutations specific to the Tetris game
 */

import { v } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { Doc, Id } from "../../../../_generated/dataModel";
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from "../../../../shared/utils/publicId";

/**
 * Save a completed Tetris game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can save their own games
 */
export const saveGame = mutation({
  args: {
    score: v.number(),
    level: v.number(),
    lines: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    duration: v.number(),
    piecesPlaced: v.number(),
    singleLines: v.number(),
    doubleLines: v.number(),
    tripleLines: v.number(),
    tetrisLines: v.number(),
    maxCombo: v.number(),
    hasReplay: v.boolean(),
    replayId: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: {
    score: number;
    level: number;
    lines: number;
    difficulty: "easy" | "medium" | "hard" | "expert";
    duration: number;
    piecesPlaced: number;
    singleLines: number;
    doubleLines: number;
    tripleLines: number;
    tetrisLines: number;
    maxCombo: number;
    hasReplay: boolean;
    replayId?: string;
  }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'tetrisGames');

    // Save game
    const gameDbId = await ctx.db.insert("tetrisGames", {
      publicId,
      gameId: "tetris",
      userId,
      score: args.score,
      timePlayedMs: args.duration,
      difficulty: args.difficulty,
      status: "completed",
      level: args.level,
      lines: args.lines,
      piecesPlaced: args.piecesPlaced,
      singleLines: args.singleLines,
      doubleLines: args.doubleLines,
      tripleLines: args.tripleLines,
      tetrisLines: args.tetrisLines,
      maxCombo: args.maxCombo,
      pieceStats: {
        I: 0,
        O: 0,
        T: 0,
        S: 0,
        Z: 0,
        J: 0,
        L: 0,
      },
      averageFPS: 60,
      startedAt: now - args.duration,
      completedAt: now,
      lastActivityAt: now,
      hasReplay: args.hasReplay,
      replayId: args.replayId,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // Update or create high score for this difficulty
    const existingHighScore = await ctx.db
      .query("tetrisHighScores")
      .withIndex("by_user_and_difficulty", (q) =>
        q.eq("userId", userId).eq("difficulty", args.difficulty)
      )
      .first();

    if (!existingHighScore || args.score > existingHighScore.score) {
      if (existingHighScore) {
        // Update existing high score
        await ctx.db.patch(existingHighScore._id, {
          gameId: gameDbId,
          score: args.score,
          level: args.level,
          lines: args.lines,
          duration: args.duration,
          piecesPlaced: args.piecesPlaced,
          tetrisLines: args.tetrisLines,
          maxCombo: args.maxCombo,
          achievedAt: now,
        });
      } else {
        // Create new high score
        const highScorePublicId = await generateUniquePublicId(ctx, 'tetrisHighScores');
        await ctx.db.insert("tetrisHighScores", {
          publicId: highScorePublicId,
          userId,
          gameId: String(gameDbId),
          score: args.score,
          level: args.level,
          lines: args.lines,
          difficulty: args.difficulty,
          duration: args.duration,
          piecesPlaced: args.piecesPlaced,
          tetrisLines: args.tetrisLines,
          maxCombo: args.maxCombo,
          achievedAt: now,
          createdAt: now,
          updatedAt: now,
          createdBy: user._id,
        });
      }
    }

    // Update player statistics
    const existingStats = await ctx.db
      .query("tetrisPlayerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStats) {
      // Update existing stats
      const newHighScores = { ...existingStats.highScores };
      if (!newHighScores[args.difficulty] || args.score > newHighScores[args.difficulty]) {
        newHighScores[args.difficulty] = args.score;
      }

      await ctx.db.patch(existingStats._id, {
        soloGamesPlayed: existingStats.soloGamesPlayed + 1,
        soloGamesCompleted: existingStats.soloGamesCompleted + 1,
        totalPlayTimeMs: existingStats.totalPlayTimeMs + args.duration,
        highScores: newHighScores,
        totalScore: existingStats.totalScore + args.score,
        totalLines: existingStats.totalLines + args.lines,
        highestLevel: Math.max(existingStats.highestLevel, args.level),
        longestGameMs: Math.max(existingStats.longestGameMs, args.duration),
        totalPiecesPlaced: existingStats.totalPiecesPlaced + args.piecesPlaced,
        totalSingleLines: existingStats.totalSingleLines + args.singleLines,
        totalDoubleLines: existingStats.totalDoubleLines + args.doubleLines,
        totalTripleLines: existingStats.totalTripleLines + args.tripleLines,
        totalTetrisLines: existingStats.totalTetrisLines + args.tetrisLines,
        highestCombo: Math.max(existingStats.highestCombo, args.maxCombo),
        lastPlayedAt: now,
        updatedAt: now,
      });
    } else {
      // Create new stats
      await ctx.db.insert("tetrisPlayerStats", {
        userId,
        soloGamesPlayed: 1,
        soloGamesCompleted: 1,
        soloGamesAbandoned: 0,
        totalPlayTimeMs: args.duration,
        highScores: {
          [args.difficulty]: args.score,
        },
        totalScore: args.score,
        totalLines: args.lines,
        highestLevel: args.level,
        longestGameMs: args.duration,
        totalPiecesPlaced: args.piecesPlaced,
        totalSingleLines: args.singleLines,
        totalDoubleLines: args.doubleLines,
        totalTripleLines: args.tripleLines,
        totalTetrisLines: args.tetrisLines,
        highestCombo: args.maxCombo,
        pieceStats: {
          I: 0,
          O: 0,
          T: 0,
          S: 0,
          Z: 0,
          J: 0,
          L: 0,
        },
        multiplayerGamesPlayed: 0,
        multiplayerWins: 0,
        multiplayerLosses: 0,
        totalGarbageSent: 0,
        totalGarbageReceived: 0,
        currentWinStreak: 0,
        longestWinStreak: 0,
        currentPlayStreak: 1,
        longestPlayStreak: 1,
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
      action: 'tetris.game_saved',
      entityType: 'game_session',
      entityId: publicId,
      entityTitle: `Tetris Game - ${args.difficulty}`,
      description: `Completed tetris game with score ${args.score}`,
      metadata: {
        difficulty: args.difficulty,
        score: args.score,
        level: args.level,
        lines: args.lines,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return gameDbId;
  },
});

/**
 * Delete a Tetris game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can delete their own games
 */
export const deleteGame = mutation({
  args: {
    gameId: v.id("tetrisGames"),
  },
  handler: async (ctx: MutationCtx, args: { gameId: Id<"tetrisGames"> }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const game = await ctx.db.get(args.gameId);
    if (!game || game.deletedAt) {
      throw new Error("Game not found");
    }

    // 🔒 Authorization
    if (game.userId !== user.authUserId) {
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
      action: 'tetris.game_deleted',
      entityType: 'game_session',
      entityId: game.publicId,
      entityTitle: `Tetris Game - ${game.difficulty}`,
      description: `Deleted tetris game with score ${game.score}`,
      metadata: {
        difficulty: game.difficulty,
        score: game.score,
        level: game.level,
        lines: game.lines,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Start a multiplayer match
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can start matches
 */
export const startMultiplayerMatch = mutation({
  args: {
    roomCode: v.string(),
    maxPlayers: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    settings: v.object({
      enableGarbage: v.boolean(),
      startLevel: v.number(),
      targetScore: v.optional(v.number()),
      timeLimit: v.optional(v.number()),
      ranked: v.boolean(),
    }),
  },
  handler: async (ctx: MutationCtx, args: {
    roomCode: string;
    maxPlayers: number;
    difficulty: "easy" | "medium" | "hard" | "expert";
    settings: {
      enableGarbage: boolean;
      startLevel: number;
      targetScore?: number;
      timeLimit?: number;
      ranked: boolean;
    };
  }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Generate unique match public ID
    const matchPublicId = await generateUniquePublicId(ctx, 'tetrisMatches');

    // Create match
    const matchId = await ctx.db.insert("tetrisMatches", {
      publicId: matchPublicId,
      roomCode: args.roomCode.trim(),
      hostUserId: userId,
      maxPlayers: args.maxPlayers,
      difficulty: args.difficulty,
      settings: args.settings,
      status: "waiting",
      currentPlayers: 1,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // Add host as participant
    // NOTE: tetrisMatchParticipants table needs to be added to schema
    await ctx.db.insert("tetrisMatchParticipants", {
      matchId,
      userId,
      status: "ready",
      position: 1,
      joinedAt: now,
      lastUpdateAt: now,
      userName: user.name || user.email || 'Host',
      userEmail: user.email,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tetris.match_created',
      entityType: 'game_match',
      entityId: matchPublicId,
      entityTitle: `Tetris Match - ${args.difficulty}`,
      description: `Created tetris multiplayer match`,
      metadata: {
        roomCode: args.roomCode,
        maxPlayers: args.maxPlayers,
        difficulty: args.difficulty,
        ranked: args.settings.ranked,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return matchId;
  },
});

/**
 * Update player state in multiplayer match
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can update their own state
 */
export const updatePlayerState = mutation({
  args: {
    matchId: v.id("tetrisMatches"),
    gameState: v.string(),
    score: v.number(),
    level: v.number(),
    lines: v.number(),
  },
  handler: async (ctx: MutationCtx, args: {
    matchId: Id<"tetrisMatches">;
    gameState: string;
    score: number;
    level: number;
    lines: number;
  }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const participant = await ctx.db
      .query("tetrisMatchParticipants")
      .withIndex("by_match_and_user", (q) =>
        q.eq("matchId", args.matchId).eq("userId", user._id)
      )
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    const now = Date.now();

    await ctx.db.patch(participant._id, {
      currentGameState: args.gameState,
      finalScore: args.score,
      finalLevel: args.level,
      finalLines: args.lines,
      lastUpdateAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tetris.player_state_updated',
      entityType: 'game_match',
      entityId: String(args.matchId),
      entityTitle: 'Tetris Match Player State',
      description: `Updated player state in tetris match`,
      metadata: {
        matchId: String(args.matchId),
        score: args.score,
        level: args.level,
        lines: args.lines,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * End multiplayer match
 * 🔒 Authentication: Required
 * 🔒 Authorization: Only match host can end the match
 */
export const endMultiplayerMatch = mutation({
  args: {
    matchId: v.id("tetrisMatches"),
    winnerId: v.string(),
  },
  handler: async (ctx: MutationCtx, args: {
    matchId: Id<"tetrisMatches">;
    winnerId: string;
  }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // 🔒 Authorization
    if (match.hostUserId !== user.authUserId) {
      throw new Error("Only host can end match");
    }

    const now = Date.now();

    await ctx.db.patch(args.matchId, {
      status: "completed",
      winnerId: args.winnerId,
      completedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tetris.match_ended',
      entityType: 'game_match',
      entityId: match.publicId,
      entityTitle: `Tetris Match - ${match.difficulty}`,
      description: `Ended tetris multiplayer match`,
      metadata: {
        winnerId: args.winnerId,
        duration: now - match.startedAt,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});
