// convex/lib/system/supporting/documents.ts
// Supporting module: documents (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.documents:view',
  CREATE: 'supporting.documents:create',
  EDIT: 'supporting.documents:edit',
  DELETE: 'supporting.documents:delete',
} as const;

export const listDocuments = query({
  args: {
    entityType: v.optional(supportingValidators.documentType),
    entityId: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);
    const limit = Math.min(args.limit ?? 50, 100);

    let q = ctx.db.query('documents').filter(notDeleted);
    if (args.entityType && args.entityId) {
      q = q.withIndex('by_entity', (idx) => idx.eq('entityType', args.entityType).eq('entityId', args.entityId));
    }

    const page = await q.order('desc').paginate({ numItems: limit, cursor: args.cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const getDocument = query({
  args: { id: v.id('documents') },
  handler: async (ctx, { id }) => {
    await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) return null;
    return doc;
  },
});

export const createDocument = mutation({
  args: {
    title: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    documentType: supportingValidators.documentType,
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    isPublic: v.boolean(),
    isConfidential: v.boolean(),
    status: supportingValidators.documentStatus,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'documents');

    const id = await ctx.db.insert('documents', {
      publicId,
      ownerId: user._id,
      title: args.title.trim(),
      displayName: args.title.trim(),
      entityType: args.entityType,
      entityId: args.entityId.trim(),
      documentType: args.documentType,
      filename: args.filename.trim(),
      originalFilename: args.filename.trim(),
      fileSize: args.fileSize,
      mimeType: args.mimeType.trim(),
      fileUrl: args.fileUrl.trim(),
      isPublic: args.isPublic,
      isConfidential: args.isConfidential,
      status: args.status,
      uploadedBy: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || 'User',
      action: 'supporting.documents.created',
      entityType: 'documents',
      entityId: publicId,
      entityTitle: args.title,
      description: `Uploaded document ${args.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});

export const deleteDocument = mutation({
  args: { id: v.id('documents') },
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
      action: 'supporting.documents.deleted',
      entityType: 'documents',
      entityId: existing.publicId,
      entityTitle: existing.title,
      description: `Deleted document ${existing.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return true;
  },
});
