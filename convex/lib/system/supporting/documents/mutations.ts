// convex/lib/system/supporting/documents/mutations.ts
// Write operations for system documents

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { documentsValidators } from '@/schema/system/supporting/documents/validators';
import { SYSTEM_DOCUMENTS_CONSTANTS } from './constants';
import {
  trimSystemDocumentData,
  validateSystemDocumentData,
} from './utils';
import {
  requireDeleteSystemDocumentAccess,
  requireEditSystemDocumentAccess,
} from './permissions';

export const createSystemDocument = mutation({
  args: {
    data: v.object({
      name: v.string(),
      entityType: v.string(),
      entityId: v.string(),
      type: documentsValidators.documentType,
      status: v.optional(documentsValidators.documentStatus),
      fileUrl: v.string(),
      fileName: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      version: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemDocumentData(data);
    const errors = validateSystemDocumentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'systemSupportingDocuments');

    const id = await ctx.db.insert('systemSupportingDocuments', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      status: trimmed.status ?? SYSTEM_DOCUMENTS_CONSTANTS.DEFAULTS.STATUS,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.documents.created',
      entityType: 'systemSupportingDocuments',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Uploaded document for ${trimmed.entityType}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemDocument = mutation({
  args: {
    id: v.id('systemSupportingDocuments'),
    updates: v.object({
      name: v.optional(v.string()),
      status: v.optional(documentsValidators.documentStatus),
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      version: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Document not found');
    }

    await requireEditSystemDocumentAccess(ctx, existing, user);

    const trimmed = trimSystemDocumentData(updates);
    const errors = validateSystemDocumentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.documents.updated',
      entityType: 'systemSupportingDocuments',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: 'Updated document metadata',
      metadata: { 
        data: { 
          updates: trimmed 
        },
        },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteSystemDocument = mutation({
  args: { id: v.id('systemSupportingDocuments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Document not found');
    }

    await requireDeleteSystemDocumentAccess(existing, user);

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.documents.deleted',
      entityType: 'systemSupportingDocuments',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Deleted document',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});
