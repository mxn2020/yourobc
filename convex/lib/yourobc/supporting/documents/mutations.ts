// convex/lib/yourobc/supporting/documents/mutations.ts
// convex/yourobc/supporting/documents/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { documentTypeValidator } from '../../../../schema/yourobc/base';
import { validateDocumentData, generateSystemFilename } from './utils';

export const createDocument = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      entityType: entityTypes.documentable,
      entityId: v.string(),
      documentType: documentTypeValidator,
      originalFilename: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
      fileUrl: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      isConfidential: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateDocumentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const systemFilename = generateSystemFilename(data.originalFilename);

    const documentData = {
      entityType: data.entityType,
      entityId: data.entityId,
      documentType: data.documentType,
      filename: systemFilename,
      originalFilename: data.originalFilename,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      fileUrl: data.fileUrl,
      title: data.title?.trim(),
      description: data.description?.trim(),
      isPublic: data.isPublic || false,
      isConfidential: data.isConfidential || false,
      status: 'ready' as const,
      uploadedBy: authUserId,
      tags: [] as string[],
      createdBy: authUserId,
      createdAt: now,
    };

    return await ctx.db.insert('yourobcDocuments', documentData);
  },
});

export const updateDocument = mutation({
  args: {
    authUserId: v.string(),
    documentId: v.id('yourobcDocuments'),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      isConfidential: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, documentId, data }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const errors = validateDocumentData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updateData: any = { ...data };
    if (data.title) {
      updateData.title = data.title.trim();
    }
    if (data.description) {
      updateData.description = data.description.trim();
    }

    await ctx.db.patch(documentId, updateData);
    return documentId;
  },
});

export const deleteDocument = mutation({
  args: {
    authUserId: v.string(),
    documentId: v.id('yourobcDocuments'),
  },
  handler: async (ctx, { authUserId, documentId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only uploader or admin can delete
    const user = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .first();

    if (document.uploadedBy !== authUserId) {
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        throw new Error('Permission denied');
      }
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(documentId, {
      deletedAt: now,
      deletedBy: user?.email || authUserId,
    });
    return documentId;
  },
});

