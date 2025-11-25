// convex/lib/system/supporting/comments.ts
// Supporting module: comments (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { requireCurrentUser } from '@/shared/auth.helper';
import { supportingValidators, supportingFields } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.comments:view',
  CREATE: 'supporting.comments:create',
  EDIT: 'supporting.comments:edit',
  DELETE: 'supporting.comments:delete',
} as const;

// Queries
export const listComments = query({
  args: {
    entityType: v.optional(supportingValidators.commentType),
    entityId: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);
    const limit = Math.min(args.limit ?? 50, 100);

    let q = ctx.db.query('comments').filter(notDeleted);
    if (args.entityType) {
      q = q.withIndex('by_entity', (idx) => idx.eq('entityType', args.entityType).eq('entityId', args.entityId ?? ''));
    }

    const page = await q.order('desc').paginate({ numItems: limit, cursor: args.cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const getComment = query({
  args: { id: v.id('comments') },
  handler: async (ctx, { id }) => {
    await requireCurrentUser(ctx);
    const comment = await ctx.db.get(id);
    if (!comment || comment.deletedAt) return null;
    return comment;
  },
});

// Mutations
export const createComment = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    type: v.optional(supportingValidators.commentType),
    isInternal: v.boolean(),
    mentions: v.optional(v.array(supportingFields.mention)),
    attachments: v.optional(v.array(supportingFields.attachment)),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'comments');

    const id = await ctx.db.insert('comments', {
      publicId,
      ownerId: user._id,
      name: args.name.trim(),
      entityType: args.entityType.trim(),
      entityId: args.entityId.trim(),
      content: args.content.trim(),
      type: args.type,
      isInternal: args.isInternal,
      mentions: args.mentions,
      attachments: args.attachments,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.comments.created',
      entityType: 'comments',
      entityId: publicId,
      entityTitle: args.name,
      description: `Created comment for ${args.entityType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

export const updateComment = mutation({
  args: {
    id: v.id('comments'),
    updates: v.object({
      name: v.optional(v.string()),
      content: v.optional(v.string()),
      isInternal: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.comments.updated',
      entityType: 'comments',
      entityId: existing.publicId,
      entityTitle: updates.name || existing.name,
      description: 'Updated comment',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

export const deleteComment = mutation({
  args: { id: v.id('comments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.comments.deleted',
      entityType: 'comments',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Deleted comment',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return true;
  },
});
