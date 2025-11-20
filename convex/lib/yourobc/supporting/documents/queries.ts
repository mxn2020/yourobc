// convex/lib/yourobc/supporting/documents/queries.ts
// convex/yourobc/supporting/documents/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { entityTypes } from '../../../system/audit_logs/entityTypes';
import { documentTypeValidator } from '../../../../schema/yourobc/base';

export const getDocumentsByEntity = query({
  args: {
    authUserId: v.string(),
    entityType: entityTypes.documentable,
    entityId: v.string(),
    includeConfidential: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, entityType, entityId, includeConfidential = false }) => {
    await requireCurrentUser(ctx, authUserId);

    let documents = await ctx.db
      .query('yourobcDocuments')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .order('desc')
      .collect();

    // Filter confidential documents if needed
    if (!includeConfidential) {
      documents = documents.filter(doc => !doc.isConfidential);
    }

    return documents;
  },
});

export const getDocument = query({
  args: {
    documentId: v.id('yourobcDocuments'),
    authUserId: v.string()
  },
  handler: async (ctx, { documentId, authUserId }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  },
});

export const getDocumentsByType = query({
  args: {
    authUserId: v.string(),
    documentType: documentTypeValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, documentType, limit = 50 }) => {
    await requireCurrentUser(ctx, authUserId);

    return await ctx.db
      .query('yourobcDocuments')
      .withIndex('by_documentType', (q) => q.eq('documentType', documentType))
      .order('desc')
      .take(limit);
  },
});

export const getUserDocuments = query({
  args: {
    authUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, limit = 50 }) => {
    await requireCurrentUser(ctx, authUserId);

    return await ctx.db
      .query('yourobcDocuments')
      .withIndex('by_uploadedBy', (q) => q.eq('uploadedBy', authUserId))
      .order('desc')
      .take(limit);
  },
});

