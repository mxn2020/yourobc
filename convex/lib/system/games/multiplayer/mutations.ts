// convex/lib/boilerplate/games/multiplayer/mutations.ts

/**
 * Multiplayer System Mutations
 *
 * Backend mutations for the universal multiplayer system
 */

import { v } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { Doc } from "../../../../_generated/dataModel";

/**
 * Generate a random 6-character room code
 */
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a multiplayer room
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can create rooms
 */
export const createRoom = mutation({
  args: {
    gameId: v.string(),
    name: v.string(),
    maxPlayers: v.number(),
    isPrivate: v.boolean(),
    gameMode: v.optional(v.string()),
    settings: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      gameId: string;
      name: string;
      maxPlayers: number;
      isPrivate: boolean;
      gameMode?: string;
      settings?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    const roomId = await generateUniquePublicId(ctx, 'multiplayerRooms');
    const roomCode = generateRoomCode();

    // Create room
    const room = await ctx.db.insert("multiplayerRooms", {
      roomId,
      roomCode,
      gameId: args.gameId,
      name: args.name.trim(),
      maxPlayers: args.maxPlayers,
      isPrivate: args.isPrivate,
      gameMode: args.gameMode,
      hostUserId: userId,
      status: "waiting",
      settings: args.settings,
      createdAt: now,
      lastActivity: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Add host as first participant
    const playerId = await generateUniquePublicId(ctx, 'roomParticipants');
    await ctx.db.insert("roomParticipants", {
      roomId,
      userId,
      playerId,
      displayName: user.name || user.email || "Host",
      isHost: true,
      isReady: false,
      score: 0,
      isConnected: true,
      isSpectator: false,
      joinedAt: now,
      lastSeenAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.room_created',
      entityType: 'game_room',
      entityId: roomId,
      entityTitle: args.name,
      description: `Created multiplayer room '${args.name}' for game '${args.gameId}'`,
      metadata: {
        gameId: args.gameId,
        maxPlayers: args.maxPlayers,
        isPrivate: args.isPrivate,
        gameMode: args.gameMode,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { roomId, roomCode, playerId };
  },
});

/**
 * Join a room by room code or room ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can join rooms
 */
export const joinRoom = mutation({
  args: {
    roomCode: v.optional(v.string()),
    roomId: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomCode?: string;
      roomId?: string;
      displayName?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Find room
    let room;
    if (args.roomCode) {
      room = await ctx.db
        .query("multiplayerRooms")
        .withIndex("by_code", (q) => q.eq("roomCode", args.roomCode))
        .first();
    } else if (args.roomId) {
      room = await ctx.db
        .query("multiplayerRooms")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .first();
    }

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "waiting") {
      throw new Error("Room is not accepting players");
    }

    // Check if room is full
    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", room.roomId))
      .collect();

    if (participants.length >= room.maxPlayers) {
      throw new Error("Room is full");
    }

    // Check if user already in room
    const existing = participants.find((p: Doc<"roomParticipants">) => p.userId === userId);
    if (existing) {
      return { roomId: room.roomId, playerId: existing.playerId, alreadyJoined: true };
    }

    // Add participant
    const playerId = await generateUniquePublicId(ctx, 'roomParticipants');
    await ctx.db.insert("roomParticipants", {
      roomId: room.roomId,
      userId,
      playerId,
      displayName: (args.displayName || user.name || user.email || "Player").trim(),
      isHost: false,
      isReady: false,
      score: 0,
      isConnected: true,
      isSpectator: false,
      joinedAt: now,
      lastSeenAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Update room activity
    await ctx.db.patch(room._id, {
      lastActivity: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.room_joined',
      entityType: 'game_room',
      entityId: room.roomId,
      entityTitle: room.name,
      description: `Joined multiplayer room '${room.name}'`,
      metadata: {
        gameId: room.gameId,
        roomCode: room.roomCode,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { roomId: room.roomId, playerId, alreadyJoined: false };
  },
});

/**
 * Leave a room
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can leave rooms they are in
 */
export const leaveRoom = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomId: string;
      playerId: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;

    // Find participant
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    // 🔒 Authorization
    if (participant.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Soft delete participant
    await ctx.db.patch(participant._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Check if room is now empty (excluding soft-deleted participants)
    const remaining = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    if (remaining.length === 0) {
      // Soft delete room
      const room = await ctx.db
        .query("multiplayerRooms")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .first();

      if (room) {
        await ctx.db.patch(room._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    } else if (participant.isHost) {
      // Migrate host to another player
      const newHost = remaining[0];
      await ctx.db.patch(newHost._id, {
        isHost: true,
      });

      const room = await ctx.db
        .query("multiplayerRooms")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .first();

      if (room) {
        await ctx.db.patch(room._id, {
          hostUserId: newHost.userId,
          lastActivity: Date.now(),
          updatedAt: Date.now(),
          updatedBy: user._id,
        });
      }
    }

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.room_left',
      entityType: 'game_room',
      entityId: args.roomId,
      entityTitle: 'Multiplayer Room',
      description: `Left multiplayer room`,
      metadata: {
        roomId: args.roomId,
        playerId: args.playerId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Set player ready status
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can update their own ready status
 */
export const setPlayerReady = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
    isReady: v.boolean(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomId: string;
      playerId: string;
      isReady: boolean;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    // 🔒 Authorization
    if (participant.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(participant._id, {
      isReady: args.isReady,
      lastSeenAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Check if all players are ready
    const allParticipants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const allReady = allParticipants.every((p: Doc<"roomParticipants">) => p.isReady) && allParticipants.length >= 2;

    if (allReady) {
      const room = await ctx.db
        .query("multiplayerRooms")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .first();

      if (room && room.status === "waiting") {
        await ctx.db.patch(room._id, {
          status: "ready",
          lastActivity: now,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    }

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.player_ready',
      entityType: 'game_room',
      entityId: args.roomId,
      entityTitle: 'Player Ready Status',
      description: `Set ready status to ${args.isReady}`,
      metadata: {
        roomId: args.roomId,
        playerId: args.playerId,
        isReady: args.isReady,
        allReady,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true, allReady };
  },
});

/**
 * Start the game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Only room host can start the game
 */
export const startGame = mutation({
  args: {
    roomId: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomId: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const room = await ctx.db
      .query("multiplayerRooms")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    // 🔒 Authorization
    if (room.hostUserId !== user._id) {
      throw new Error("Only host can start game");
    }

    if (room.status !== "ready" && room.status !== "waiting") {
      throw new Error("Room not ready to start");
    }

    const now = Date.now();

    await ctx.db.patch(room._id, {
      status: "playing",
      startedAt: now,
      lastActivity: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.game_started',
      entityType: 'game_room',
      entityId: room.roomId,
      entityTitle: room.name,
      description: `Started multiplayer game in room '${room.name}'`,
      metadata: {
        gameId: room.gameId,
        roomCode: room.roomCode,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Update player state during game
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can update their own state
 */
export const updatePlayerState = mutation({
  args: {
    roomId: v.string(),
    playerId: v.string(),
    gameState: v.string(),
    score: v.optional(v.number()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomId: string;
      playerId: string;
      gameState: string;
      score?: number;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    // 🔒 Authorization
    if (participant.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(participant._id, {
      gameState: args.gameState,
      score: args.score ?? participant.score,
      lastSeenAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.player_state_updated',
      entityType: 'game_room',
      entityId: args.roomId,
      entityTitle: 'Player State Updated',
      description: `Updated player state in multiplayer game`,
      metadata: {
        roomId: args.roomId,
        playerId: args.playerId,
        score: args.score,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * End the game and record results
 * 🔒 Authentication: Required
 * 🔒 Authorization: Only room host can end the game
 */
export const endGame = mutation({
  args: {
    roomId: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      roomId: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const room = await ctx.db
      .query("multiplayerRooms")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    // 🔒 Authorization
    if (room.hostUserId !== user._id) {
      throw new Error("Only host can end game");
    }

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Sort by score to determine rankings
    const sorted = participants.sort((a: Doc<"roomParticipants">, b: Doc<"roomParticipants">) => b.score - a.score);
    const rankings = sorted.map((p: Doc<"roomParticipants">, index: number) => ({
      rank: index + 1,
      userId: p.userId,
      displayName: p.displayName,
      score: p.score,
      playerId: p.playerId,
    }));

    const winner = sorted[0];
    const now = Date.now();

    // Create match result
    await ctx.db.insert("matchResults", {
      roomId: args.roomId,
      gameId: room.gameId,
      gameMode: room.gameMode,
      duration: room.startedAt ? now - room.startedAt : 0,
      rankings,
      winnerId: winner.userId,
      winnerScore: winner.score,
      startedAt: room.startedAt || now,
      finishedAt: now,
    });

    // Update room status
    await ctx.db.patch(room._id, {
      status: "finished",
      finishedAt: now,
      lastActivity: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'multiplayer.game_ended',
      entityType: 'game_room',
      entityId: room.roomId,
      entityTitle: room.name,
      description: `Ended multiplayer game in room '${room.name}'`,
      metadata: {
        gameId: room.gameId,
        winnerId: winner.userId,
        winnerScore: winner.score,
        playerCount: rankings.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true, rankings };
  },
});
