// convex/lib/system/supporting/documents/mutations.ts

/**
 * Documents Module Mutations
 * Write operations for creating, updating, and deleting documents
 */
import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper'
import { entityTypes } from '../../audit_logs/entityTypes'
import { documentTypeValidator, documentStatusValidator } from '@/schema/base'
import { validateCreateDocumentData, validateUpdateDocumentData, generateSystemFilename } from './utils'
import { generateUniquePublicId } from '@/shared/utils/publicId'

/**
 * Create a new document record
 */
export const createDocument = mutation({
  args: {
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
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx)

    const errors = validateCreateDocumentData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const now = Date.now()
    const systemFilename = generateSystemFilename(data.originalFilename)
    const publicId = await generateUniquePublicId(ctx, 'documents')

    const documentData = {
      publicId,
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
      uploadedBy: user._id,
      createdBy: user._id,
      createdAt: now,
    }

    return await ctx.db.insert('documents', documentData)
  },
})

/**
 * Update document metadata
 */
export const updateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      documentType: v.optional(documentTypeValidator),
      isPublic: v.optional(v.boolean()),
      isConfidential: v.optional(v.boolean()),
      status: v.optional(documentStatusValidator),
    })
  },
  handler: async (ctx, { documentId, data }) => {
    const user = await requireCurrentUser(ctx)

    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    const errors = validateUpdateDocumentData(data)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const now = Date.now()
    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user._id
    }

    if (data.title !== undefined) {
      updateData.title = data.title.trim()
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim()
    }

    if (data.documentType !== undefined) {
      updateData.documentType = data.documentType
    }

    if (data.isPublic !== undefined) {
      updateData.isPublic = data.isPublic
    }

    if (data.isConfidential !== undefined) {
      updateData.isConfidential = data.isConfidential
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }

    await ctx.db.patch(documentId, updateData)
    return documentId
  },
})

/**
 * Delete a document (soft delete)
 */
export const deleteDocument = mutation({
  args: {
    documentId: v.id('documents'),
  },
  handler: async (ctx, { documentId }) => {
    const user = await requireCurrentUser(ctx)

    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    // Check if user uploaded the document OR is admin/superadmin
    await requireOwnershipOrAdmin(ctx, document.uploadedBy)

    const now = Date.now()

    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(documentId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    return documentId
  },
})

/**
 * Update document status (e.g., after file processing)
 */
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id('documents'),
    status: documentStatusValidator,
  },
  handler: async (ctx, { documentId, status }) => {
    const user = await requireCurrentUser(ctx)

    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    const now = Date.now()

    await ctx.db.patch(documentId, {
      status,
      updatedAt: now,
      updatedBy: user._id
    })

    return documentId
  },
})

/**
 * Archive a document
 */
export const archiveDocument = mutation({
  args: {
    documentId: v.id('documents'),
  },
  handler: async (ctx, { documentId }) => {
    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    // Check if user uploaded the document OR is admin/superadmin
    const user = await requireOwnershipOrAdmin(ctx, document.uploadedBy)

    const now = Date.now()

    await ctx.db.patch(documentId, {
      status: 'archived',
      updatedAt: now,
      updatedBy: user._id
    })

    return documentId
  },
})

/**
 * Restore an archived document
 */
export const restoreDocument = mutation({
  args: {
    documentId: v.id('documents'),
  },
  handler: async (ctx, { documentId }) => {
    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    if (document.status !== 'archived') {
      throw new Error('Document is not archived')
    }

    // Check if user uploaded the document OR is admin/superadmin
    const user = await requireOwnershipOrAdmin(ctx, document.uploadedBy)

    const now = Date.now()

    await ctx.db.patch(documentId, {
      status: 'ready',
      updatedAt: now,
      updatedBy: user._id
    })

    return documentId
  },
})
