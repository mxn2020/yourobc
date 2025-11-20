// src/features/yourobc/supporting/documents/services/DocumentsService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateDocumentData,
  DocumentFormData,
  Document,
  DocumentEntityType,
  DOCUMENT_CONSTANTS,
} from '../types'

export class DocumentsService {
  // Query hooks for document data fetching
  useDocumentsByEntity(
    authUserId: string,
    entityType: DocumentEntityType,
    entityId: string,
    options?: {
      includeConfidential?: boolean
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.documents.queries.getDocumentsByEntity, {
        authUserId,
        entityType,
        entityId,
        includeConfidential: options?.includeConfidential,
      }),
      staleTime: 30000, // 30 seconds
      enabled: !!authUserId && !!entityType && !!entityId,
    })
  }

  useDocument(authUserId: string, documentId?: Id<'yourobcDocuments'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.documents.queries.getDocument, {
        authUserId,
        documentId: documentId!,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!documentId,
    })
  }

  // Mutation hooks for document modifications
  useCreateDocument() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.documents.mutations.createDocument),
    })
  }

  useUpdateDocument() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.documents.mutations.updateDocument),
    })
  }

  useDeleteDocument() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.documents.mutations.deleteDocument),
    })
  }

  // Business operations using mutations
  async createDocument(
    mutation: ReturnType<typeof this.useCreateDocument>,
    authUserId: string,
    data: CreateDocumentData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create document: ${error.message}`)
    }
  }

  async updateDocument(
    mutation: ReturnType<typeof this.useUpdateDocument>,
    authUserId: string,
    documentId: Id<'yourobcDocuments'>,
    data: {
      title?: string
      description?: string
      isPublic?: boolean
      isConfidential?: boolean
    }
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, documentId, data })
    } catch (error: any) {
      throw new Error(`Failed to update document: ${error.message}`)
    }
  }

  async deleteDocument(
    mutation: ReturnType<typeof this.useDeleteDocument>,
    authUserId: string,
    documentId: Id<'yourobcDocuments'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, documentId })
    } catch (error: any) {
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  }

  // Utility functions for data processing
  validateDocumentData(data: Partial<DocumentFormData>): string[] {
    const errors: string[] = []

    if (data.title && data.title.length > 100) {
      errors.push('Title must be less than 100 characters')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters')
    }

    return errors
  }

  validateFile(file: File): string[] {
    const errors: string[] = []
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${this.formatFileSize(MAX_FILE_SIZE)}`)
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed. Please upload PDF, Word, Excel, or image files.')
    }

    return errors
  }

  getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`

    const years = Math.floor(days / 365)
    return `${years}y ago`
  }

  formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf'
  }

  isDocumentFile(mimeType: string): boolean {
    return (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  }
}

export const documentsService = new DocumentsService()
