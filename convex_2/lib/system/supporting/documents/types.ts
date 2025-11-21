// convex/lib/system/supporting/documents/types.ts

/**
 * Documents Module Types
 * Type definitions for document operations and data structures
 */
import type { Doc, Id } from '@/generated/dataModel'

export type Document = Doc<'documents'>
export type DocumentId = Id<'documents'>

/**
 * Data required to create a document
 */
export interface CreateDocumentData {
  entityType: Document['entityType']
  entityId: string
  documentType: Document['documentType']
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  fileUrl: string
  title?: string
  description?: string
  isPublic?: boolean
  isConfidential?: boolean
}

/**
 * Data required to update a document
 */
export interface UpdateDocumentData {
  title?: string
  description?: string
  documentType?: Document['documentType']
  isPublic?: boolean
  isConfidential?: boolean
  status?: Document['status']
}

/**
 * Document filter options for queries
 */
export interface DocumentFilters {
  entityType?: string
  entityId?: string
  documentType?: string
  isPublic?: boolean
  isConfidential?: boolean
  uploadedBy?: string
  status?: string
}
