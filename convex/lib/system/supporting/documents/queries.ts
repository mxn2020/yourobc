// convex/lib/system/supporting/documents/queries.ts
// Read operations for system documents

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { documentsValidators } from '@/schema/system/supporting/documents/validators';
import { filterSystemDocumentsByAccess, requireViewSystemDocumentAccess } from './permissions';
import type { SystemDocumentFilters, SystemDocumentListResponse } from './types';

export const getSystemDocuments = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(
      v.object({
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        type: v.optional(documentsValidators.documentType),
        status: v.optional(documentsValidators.documentStatus),
      })
    ),
  },
  handler: async (ctx, args): Promise<SystemDocumentListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} as SystemDocumentFilters } = args;

    const page = await ctx.db
      .query('systemSupportingDocuments')
      .withIndex('by_created_at', (q) => q.gte('createdAt', 0))
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    let items = await filterSystemDocumentsByAccess(ctx, page.page, user);

    if (filters.entityType) {
      items = items.filter((item) => item.entityType === filters.entityType);
    }
    if (filters.entityId) {
      items = items.filter((item) => item.entityId === filters.entityId);
    }
    if (filters.type) {
      items = items.filter((item) => item.type === filters.type);
    }
    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor ?? undefined,
    };
  },
});

export const getSystemDocument = query({
  args: { id: v.id('systemSupportingDocuments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) {
      throw new Error('Document not found');
    }

    await requireViewSystemDocumentAccess(ctx, doc, user);
    return doc;
  },
});
