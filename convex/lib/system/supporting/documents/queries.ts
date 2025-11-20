// convex/lib/system/supporting/documents/queries.ts

/**
 * Documents Module Queries
 * Read-only operations for fetching document data
 */
import { query } from '@/generated/server'
import { v } from 'convex/values'
import { requireCurrentUser } from '@/shared/auth.helper'
import { entityTypes } from '../../audit_logs/entityTypes'
import { documentTypeValidator } from '@/schema/base'

/**
 * Get all documents for a specific entity
 */
export const getDocumentsByEntity = query({
  args: {
    
    entityType: entityTypes.documentable,
    entityId: v.string(),
    includeConfidential: v.optional(v.boolean()),
  },
  handler: async (ctx, { entityType, entityId, includeConfidential = false }) => {
    await requireCurrentUser(ctx)

    let documents = await ctx.db
      .query('documents')
      .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
      .order('desc')
      .collect()

    // Filter out deleted documents
    documents = documents.filter(doc => !doc.deletedAt)

    // Filter confidential documents if needed
    if (!includeConfidential) {
      documents = documents.filter(doc => !doc.isConfidential)
    }

    // Resolve user profiles for uploaded by
    const documentsWithUsers = await Promise.all(
      documents.map(async (doc) => {
        const uploadedByUser = await ctx.db.get(doc.uploadedBy)
        return {
          ...doc,
          uploadedByName: uploadedByUser?.name,
          uploadedByEmail: uploadedByUser?.email,
        }
      })
    )

    return documentsWithUsers
  },
})

/**
 * Get a single document by ID
 */
export const getDocument = query({
  args: {
    documentId: v.id('documents'),
  },
  handler: async (ctx, { documentId}) => {
    await requireCurrentUser(ctx)

    const document = await ctx.db.get(documentId)
    if (!document || document.deletedAt) {
      throw new Error('Document not found')
    }

    return document
  },
})

/**
 * Get documents by type
 */
export const getDocumentsByType = query({
  args: {
    
    documentType: documentTypeValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { documentType, limit = 50 }) => {
    await requireCurrentUser(ctx)

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_documentType', (q) => q.eq('documentType', documentType))
      .order('desc')
      .take(limit)

    // Filter out deleted documents
    return documents.filter(doc => !doc.deletedAt)
  },
})

/**
 * Get all documents uploaded by current user
 */
export const getUserDocuments = query({
  args: {
    
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const user = await requireCurrentUser(ctx)

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_uploadedBy', (q) => q.eq('uploadedBy', user._id))
      .order('desc')
      .take(limit)

    // Filter out deleted documents
    return documents.filter(doc => !doc.deletedAt)
  },
})

/**
 * Get documents with flexible filtering
 */
export const getDocuments = query({
  args: {
    
    entityType: v.optional(entityTypes.documentable),
    entityId: v.optional(v.string()),
    documentType: v.optional(documentTypeValidator),
    limit: v.optional(v.number()),
    includeConfidential: v.optional(v.boolean()),
  },
  handler: async (ctx, { entityType, entityId, documentType, limit, includeConfidential = false }) => {
    await requireCurrentUser(ctx)

    let documents = await ctx.db.query('documents').collect()

    // Filter by entity if specified
    if (entityType && entityId) {
      documents = documents.filter(d => d.entityType === entityType && d.entityId === entityId)
    } else if (entityType) {
      documents = documents.filter(d => d.entityType === entityType)
    }

    // Filter by document type if specified
    if (documentType) {
      documents = documents.filter(d => d.documentType === documentType)
    }

    // Filter out deleted documents
    documents = documents.filter(doc => !doc.deletedAt)

    // Filter confidential documents if needed
    if (!includeConfidential) {
      documents = documents.filter(doc => !doc.isConfidential)
    }

    // Sort by creation date (newest first)
    documents.sort((a, b) => b.createdAt - a.createdAt)

    // Apply limit if specified
    return limit ? documents.slice(0, limit) : documents
  },
})

/**
 * Get recent documents across all entities
 */
export const getRecentDocuments = query({
  args: {
    
    limit: v.optional(v.number()),
    includeConfidential: v.optional(v.boolean()),
  },
  handler: async (ctx, { limit = 20, includeConfidential = false }) => {
    await requireCurrentUser(ctx)

    let documents = await ctx.db
      .query('documents')
      .order('desc')
      .take(limit * 2) // Get more to account for filtering

    // Filter out deleted documents
    documents = documents.filter(doc => !doc.deletedAt)

    // Filter confidential documents if needed
    if (!includeConfidential) {
      documents = documents.filter(doc => !doc.isConfidential)
    }

    // Apply limit after filtering
    return documents.slice(0, limit)
  },
})
