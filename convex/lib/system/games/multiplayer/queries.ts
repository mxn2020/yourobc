/**
 * Multiplayer System Queries
 *
 * Backend queries for the universal multiplayer system
 */

import { v } from "convex/values";
import { query, QueryCtx } from "../../../../_generated/server";
import { Doc } from "../../../../_generated/dataModel";

/**
 * Get public rooms for a game
 */
export const getPublicRooms = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const rooms = await ctx.db
      .query("multiplayerRooms")
      .withIndex("by_public_waiting", (q) =>
        q.eq("gameId", args.gameId)
          .eq("isPrivate", false)
          .eq("status", "waiting")
      )
      .collect();

    // Enrich with participant count
    const enriched = await Promise.all(
      rooms.map(async (room: Doc<"multiplayerRooms">) => {
        const participants = await ctx.db
          .query("roomParticipants")
          .withIndex("by_room", (q) => q.eq("roomId", room.roomId))
          .collect();

        return {
          ...room,
          currentPlayers: participants.length,
          participants: participants.map((p: Doc<"roomParticipants">) => ({
            playerId: p.playerId,
            displayName: p.displayName,
            isHost: p.isHost,
            isReady: p.isReady,
          })),
        };
      })
    );

    return enriched;
  },
});

/**
 * Get room by ID
 */
export const getRoom = query({
  args: {
    roomId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      roomId: string;
    }
  ) => {
    const room = await ctx.db
      .query("multiplayerRooms")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .first();

    if (!room) {
      return null;
    }

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return {
      ...room,
      currentPlayers: participants.length,
      participants: participants.map((p: Doc<"roomParticipants">) => ({
        playerId: p.playerId,
        userId: p.userId,
        displayName: p.displayName,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
        isConnected: p.isConnected,
      })),
    };
  },
});

/**
 * Get room by code
 */
export const getRoomByCode = query({
  args: {
    roomCode: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      roomCode: string;
    }
  ) => {
    const room = await ctx.db
      .query("multiplayerRooms")
      .withIndex("by_code", (q) => q.eq("roomCode", args.roomCode))
      .first();

    if (!room) {
      return null;
    }

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", room.roomId))
      .collect();

    return {
      ...room,
      currentPlayers: participants.length,
      participants: participants.map((p: Doc<"roomParticipants">) => ({
        playerId: p.playerId,
        displayName: p.displayName,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
      })),
    };
  },
});

/**
 * Get player state in a room
 */
export const getPlayerState = query({
  args: {
    roomId: v.string(),
    playerId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      roomId: string;
      playerId: string;
    }
  ) => {
    const participant = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    return participant || null;
  },
});

/**
 * Get all players in a room
 */
export const getRoomPlayers = query({
  args: {
    roomId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      roomId: string;
    }
  ) => {
    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return participants.map((p: Doc<"roomParticipants">) => ({
      playerId: p.playerId,
      userId: p.userId,
      displayName: p.displayName,
      isHost: p.isHost,
      isReady: p.isReady,
      score: p.score,
      gameState: p.gameState,
      isConnected: p.isConnected,
      lastSeenAt: p.lastSeenAt,
    }));
  },
});

/**
 * Get user's active rooms
 */
export const getUserActiveRooms = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get rooms
    const rooms = await Promise.all(
      participants.map(async (p: Doc<"roomParticipants">) => {
        const room = await ctx.db
          .query("multiplayerRooms")
          .filter((q) => q.eq(q.field("roomId"), p.roomId))
          .first();

        if (!room) return null;

        const allParticipants = await ctx.db
          .query("roomParticipants")
          .withIndex("by_room", (q) => q.eq("roomId", p.roomId))
          .collect();

        return {
          ...room,
          currentPlayers: allParticipants.length,
          myPlayerId: p.playerId,
        };
      })
    );

    return rooms.filter((r: any) => r !== null && r.status !== "finished");
  },
});

/**
 * Get match results
 */
export const getMatchResults = query({
  args: {
    roomId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      roomId: string;
    }
  ) => {
    const result = await ctx.db
      .query("matchResults")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    return result || null;
  },
});

/**
 * Get recent matches for a game
 */
export const getRecentMatches = query({
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

    const matches = await ctx.db
      .query("matchResults")
      .withIndex("by_finished", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(limit);

    return matches;
  },
});

/**
 * Get user's match history
 */
export const getUserMatchHistory = query({
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;
    const limit = args.limit || 10;

    const allMatches = await ctx.db
      .query("matchResults")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Filter matches where user participated
    const userMatches = allMatches
      .filter((m: Doc<"matchResults">) => m.rankings.some((r: any) => r.userId === userId))
      .sort((a: Doc<"matchResults">, b: Doc<"matchResults">) => b.finishedAt - a.finishedAt)
      .slice(0, limit);

    return userMatches;
  },
});

/**
 * Get multiplayer statistics
 */
export const getMultiplayerStats = query({
  args: {
    gameId: v.string(),
  },
  handler: async (
    ctx: QueryCtx,
    args: {
      gameId: string;
    }
  ) => {
    const rooms = await ctx.db
      .query("multiplayerRooms")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const activeRooms = rooms.filter((r: Doc<"multiplayerRooms">) => r.status === "playing" || r.status === "ready");
    const waitingRooms = rooms.filter((r: Doc<"multiplayerRooms">) => r.status === "waiting");

    const matches = await ctx.db
      .query("matchResults")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    return {
      totalRooms: rooms.length,
      activeRooms: activeRooms.length,
      waitingRooms: waitingRooms.length,
      totalMatches: matches.length,
    };
  },
});
