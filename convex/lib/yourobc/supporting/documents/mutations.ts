// convex/lib/yourobc/supporting/documents/mutations.ts
// Write operations for documents module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { documentsValidators } from '@/schema/yourobc/supporting/documents/validators';
import { DOCUMENTS_CONSTANTS } from './constants';
import { trimDocumentData, validateDocumentData } from './utils';
import { requireEditDocumentAccess, requireDeleteDocumentAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create a new document
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have CREATE permission
 */
export const createDocument = mutation({
  args: {
    data: v.object({
      entityType: v.string(),
      entityId: v.string(),
      documentType: documentsValidators.documentType,
      filename: v.string(),
      originalFilename: v.string(),
      fileSize: v.number(),
      mimeType: v.string(),
      fileUrl: v.string(),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      isConfidential: v.optional(v.boolean()),
      status: v.optional(documentsValidators.documentStatus),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, DOCUMENTS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Trim and validate
    const trimmed = trimDocumentData(data);
    const errors = validateDocumentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Insert record
    const id = await ctx.db.insert('yourobcDocuments', {
      ...trimmed,
      isPublic: trimmed.isPublic ?? DOCUMENTS_CONSTANTS.DEFAULTS.IS_PUBLIC,
      isConfidential: trimmed.isConfidential ?? DOCUMENTS_CONSTANTS.DEFAULTS.IS_CONFIDENTIAL,
      status: trimmed.status ?? 'draft',
      uploadedBy: user.authUserId || String(user._id),
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'documents.created',
      entityType: 'yourobcDocuments',
      entityId: trimmed.entityId,
      entityTitle: trimmed.title || trimmed.filename,
      description: `Uploaded document: ${trimmed.originalFilename}`,
      metadata: {
        filename: trimmed.filename,
        fileSize: trimmed.fileSize,
        documentType: trimmed.documentType,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update document metadata
 * 🔒 Authentication: Required
 * 🔒 Authorization: Uploader or admin
 */
export const updateDocument = mutation({
  args: {
    id: v.id('yourobcDocuments'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      isConfidential: v.optional(v.boolean()),
      status: v.optional(documentsValidators.documentStatus),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Document not found');
    }

    // Check permissions
    await requireEditDocumentAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimDocumentData(updates);
    const errors = validateDocumentData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

  // Audit log
  await ctx.db.insert('auditLogs', {
    publicId: await generateUniquePublicId(ctx, 'auditLogs'),
    userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'documents.updated',
      entityType: 'yourobcDocuments',
      entityId: existing.entityId,
      entityTitle: trimmed.title || existing.title || existing.filename,
      description: `Updated document: ${existing.filename}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete a document
 * 🔒 Authentication: Required
 * 🔒 Authorization: Uploader or admin
 */
export const deleteDocument = mutation({
  args: { id: v.id('yourobcDocuments') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Document not found');
    }

    // Check permissions
    await requireDeleteDocumentAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

  // Audit log
  await ctx.db.insert('auditLogs', {
    publicId: await generateUniquePublicId(ctx, 'auditLogs'),
    userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'documents.deleted',
      entityType: 'yourobcDocuments',
      entityId: existing.entityId,
      entityTitle: existing.title || existing.filename,
      description: `Deleted document: ${existing.filename}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
