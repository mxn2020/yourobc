// convex/lib/yourobc/supporting/documents/queries.ts
// Read operations for documents module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filterDocumentsByAccess, requireViewDocumentAccess } from './permissions';
import { documentsValidators } from '@/schema/yourobc/supporting/documents/validators';
import type { DocumentListResponse, DocumentFilters } from './types';

/**
 * Get paginated list of documents for an entity (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees public docs, creator sees own, admins see all
 */
export const getDocuments = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      documentType: v.optional(documentsValidators.documentType),
      status: v.optional(documentsValidators.documentStatus),
      isPublic: v.optional(v.boolean()),
      uploadedBy: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<DocumentListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { entityType, entityId, limit = 50, cursor, filters = {} } = args;

    // Build indexed query
    let q;
    if (entityType && entityId) {
      q = ctx.db
        .query('yourobcDocuments')
        .withIndex('by_entity', iq => iq.eq('entityType', entityType).eq('entityId', entityId))
        .filter(notDeleted);
    } else {
      q = ctx.db
        .query('yourobcDocuments')
        .withIndex('by_created_at', iq => iq.gte('createdAt', 0))
        .filter(notDeleted);
    }

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filterDocumentsByAccess(ctx, page.page, user);

    // Apply additional filters in-memory
    if (filters.documentType) {
      items = items.filter(i => i.documentType === filters.documentType);
    }

    if (filters.status) {
      items = items.filter(i => i.status === filters.status);
    }

    if (filters.isPublic !== undefined) {
      items = items.filter(i => i.isPublic === filters.isPublic);
    }

    if (filters.uploadedBy) {
      items = items.filter(i => i.uploadedBy === filters.uploadedBy);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single document by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin, or if public
 */
export const getDocument = query({
  args: { id: v.id('yourobcDocuments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('Document not found');
    }

    await requireViewDocumentAccess(ctx, doc, user);
    return doc;
  },
});

/**
 * Get documents by uploader
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own uploads, admins see all
 */
export const getDocumentsByUploader = query({
  args: {
    uploadedBy: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const { uploadedBy, limit = 50, cursor } = args;

    // Only admins or the user themselves can see their uploads
    if (!isAdmin && user._id !== uploadedBy) {
      throw new Error('No permission to view documents uploaded by this user');
    }

    const page = await ctx.db
      .query('yourobcDocuments')
      .withIndex('by_uploadedBy', iq => iq.eq('uploadedBy', uploadedBy))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filterDocumentsByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get public documents only
 * 🔒 Authentication: Required
 * 🔒 Authorization: All authenticated users
 */
export const getPublicDocuments = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor } = args;

    const page = await ctx.db
      .query('yourobcDocuments')
      .withIndex('by_public', iq => iq.eq('isPublic', true))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = page.page.filter(doc => !doc.isConfidential);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
