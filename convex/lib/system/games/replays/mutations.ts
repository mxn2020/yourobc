// convex/lib/boilerplate/games/replays/mutations.ts

/**
 * Replay System Mutations
 *
 * Backend mutations for the universal replay system
 */

import { v } from "convex/values";
import { mutation, MutationCtx } from "../../../../_generated/server";
import { Id } from "../../../../_generated/dataModel";
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Save a replay
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can save their own replays
 */
export const saveReplay = mutation({
  args: {
    replayId: v.string(),
    gameId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    score: v.number(),
    duration: v.number(),
    version: v.string(),
    initialState: v.string(),
    inputs: v.array(v.object({
      f: v.number(),
      a: v.string(),
      v: v.optional(v.number()),
    })),
    isPublic: v.boolean(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
      gameId: string;
      name?: string;
      description?: string;
      score: number;
      duration: number;
      version: string;
      initialState: string;
      inputs: Array<{
        f: number;
        a: string;
        v?: number;
      }>;
      isPublic: boolean;
      tags?: string[];
      metadata?: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Calculate statistics
    const totalInputs = args.inputs.length;
    const durationSeconds = args.duration / 1000;
    const averageInputsPerSecond = durationSeconds > 0 ? totalInputs / durationSeconds : 0;

    // Save replay
    const replayDbId = await ctx.db.insert("replays", {
      replayId: args.replayId,
      gameId: args.gameId,
      userId,
      name: args.name?.trim(),
      description: args.description?.trim(),
      score: args.score,
      duration: args.duration,
      version: args.version,
      initialState: args.initialState,
      inputs: args.inputs,
      totalInputs,
      averageInputsPerSecond,
      isPublic: args.isPublic,
      isFeatured: false,
      views: 0,
      likes: 0,
      tags: args.tags,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'replay.created',
      entityType: 'game_replay',
      entityId: args.replayId,
      entityTitle: args.name || `Replay ${args.score}`,
      description: `Saved replay for game '${args.gameId}'`,
      metadata: {
        gameId: args.gameId,
        score: args.score,
        duration: args.duration,
        isPublic: args.isPublic,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return replayDbId;
  },
});

/**
 * Update replay metadata
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can update their own replays
 */
export const updateReplay = mutation({
  args: {
    replayId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const replay = await ctx.db
      .query("replays")
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (!replay) {
      throw new Error("Replay not found");
    }

    // 🔒 Authorization
    if (replay.userId !== user.authUserId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    const updates: {
      updatedAt: number;
      updatedBy: typeof user._id;
      name?: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
    } = { updatedAt: now, updatedBy: user._id };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(replay._id, updates);

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'replay.updated',
      entityType: 'game_replay',
      entityId: args.replayId,
      entityTitle: replay.name || 'Replay',
      description: `Updated replay for game '${replay.gameId}'`,
      metadata: {
        gameId: replay.gameId,
        updates: Object.keys(updates).filter(k => k !== 'updatedAt' && k !== 'updatedBy'),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Delete a replay
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can delete their own replays
 */
export const deleteReplay = mutation({
  args: {
    replayId: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    const replay = await ctx.db
      .query("replays")
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (!replay) {
      throw new Error("Replay not found");
    }

    // 🔒 Authorization
    if (replay.userId !== user.authUserId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Soft delete associated data
    const views = await ctx.db
      .query("replayViews")
      .withIndex("by_replay", (q) => q.eq("replayId", args.replayId))
      .collect();

    for (const view of views) {
      await ctx.db.patch(view._id, {
        deletedAt: now,
        deletedBy: user._id,
      });
    }

    const likes = await ctx.db
      .query("replayLikes")
      .withIndex("by_replay", (q) => q.eq("replayId", args.replayId))
      .collect();

    for (const like of likes) {
      await ctx.db.patch(like._id, {
        deletedAt: now,
        deletedBy: user._id,
      });
    }

    const comments = await ctx.db
      .query("replayComments")
      .withIndex("by_replay", (q) => q.eq("replayId", args.replayId))
      .collect();

    for (const comment of comments) {
      await ctx.db.patch(comment._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // Soft delete replay
    await ctx.db.patch(replay._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'replay.deleted',
      entityType: 'game_replay',
      entityId: args.replayId,
      entityTitle: replay.name || 'Replay',
      description: `Deleted replay for game '${replay.gameId}'`,
      metadata: {
        gameId: replay.gameId,
        score: replay.score,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Record a replay view
 * 🔒 Authentication: Optional (anonymous views allowed)
 * 🔒 Authorization: N/A
 */
export const recordView = mutation({
  args: {
    replayId: v.string(),
    duration: v.number(),
    completedPercentage: v.number(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
      duration: number;
      completedPercentage: number;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    const now = Date.now();

    // Get user profile for createdBy if authenticated
    let createdById = undefined;
    if (userId) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_auth_user_id", (q) => q.eq("authUserId", userId))
        .first();
      createdById = userProfile?._id;
    }

    // Record view
    await ctx.db.insert("replayViews", {
      replayId: args.replayId,
      userId,
      duration: args.duration,
      completedPercentage: args.completedPercentage,
      viewedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: createdById,
      updatedBy: createdById,
    });

    // Increment view count
    const replay = await ctx.db
      .query("replays")
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (replay) {
      await ctx.db.patch(replay._id, {
        views: replay.views + 1,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Like a replay
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can like replays
 */
export const likeReplay = mutation({
  args: {
    replayId: v.string(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const now = Date.now();

    // Check if already liked
    const existing = await ctx.db
      .query("replayLikes")
      .withIndex("by_replay_and_user", (q) =>
        q.eq("replayId", args.replayId).eq("userId", userId)
      )
      .first();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);

      // Decrement like count
      const replay = await ctx.db
        .query("replays")
        .filter((q) => q.eq(q.field("replayId"), args.replayId))
        .first();

      if (replay) {
        await ctx.db.patch(replay._id, {
          likes: Math.max(0, replay.likes - 1),
          updatedAt: now,
        });
      }

      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("replayLikes", {
        replayId: args.replayId,
        userId,
        likedAt: now,
      });

      // Increment like count
      const replay = await ctx.db
        .query("replays")
        .filter((q) => q.eq(q.field("replayId"), args.replayId))
        .first();

      if (replay) {
        await ctx.db.patch(replay._id, {
          likes: replay.likes + 1,
          updatedAt: now,
        });
      }

      return { liked: true };
    }
  },
});

/**
 * Add a comment to a replay
 * 🔒 Authentication: Required
 * 🔒 Authorization: Authenticated users can comment
 */
export const addComment = mutation({
  args: {
    replayId: v.string(),
    content: v.string(),
    timestamp: v.optional(v.number()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
      content: string;
      timestamp?: number;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);
    const userId = user.authUserId;
    const userName = user.name || user.email || "Anonymous";
    const now = Date.now();

    const commentId = await ctx.db.insert("replayComments", {
      replayId: args.replayId,
      userId,
      userName,
      content: args.content.trim(),
      timestamp: args.timestamp,
      likes: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'replay.comment_added',
      entityType: 'game_replay',
      entityId: args.replayId,
      entityTitle: 'Replay Comment',
      description: `Added comment to replay`,
      metadata: {
        replayId: args.replayId,
        commentLength: args.content.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return commentId;
  },
});

/**
 * Delete a comment
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can delete their own comments
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("replayComments"),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      commentId: Id<"replayComments">;
    }
  ) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // 🔒 Authorization
    if (comment.userId !== user.authUserId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(args.commentId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'replay.comment_deleted',
      entityType: 'game_replay',
      entityId: comment.replayId,
      entityTitle: 'Replay Comment',
      description: `Deleted comment from replay`,
      metadata: {
        replayId: comment.replayId,
        commentId: String(args.commentId),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Feature a replay (admin only)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const featureReplay = mutation({
  args: {
    replayId: v.string(),
    isFeatured: v.boolean(),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      replayId: string;
      isFeatured: boolean;
    }
  ) => {
    // 🔒 Authenticate & authorize (admin only)
    const user = await requirePermission(ctx, 'admin.manage_content', { allowAdmin: true });

    const replay = await ctx.db
      .query("replays")
      .filter((q) => q.eq(q.field("replayId"), args.replayId))
      .first();

    if (!replay) {
      throw new Error("Replay not found");
    }

    const now = Date.now();

    await ctx.db.patch(replay._id, {
      isFeatured: args.isFeatured,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: args.isFeatured ? 'replay.featured' : 'replay.unfeatured',
      entityType: 'game_replay',
      entityId: args.replayId,
      entityTitle: replay.name || 'Replay',
      description: `${args.isFeatured ? 'Featured' : 'Unfeatured'} replay for game '${replay.gameId}'`,
      metadata: {
        gameId: replay.gameId,
        score: replay.score,
        isFeatured: args.isFeatured,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { success: true };
  },
});
