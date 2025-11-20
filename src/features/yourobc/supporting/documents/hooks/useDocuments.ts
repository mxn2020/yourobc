// src/features/yourobc/supporting/documents/hooks/useDocuments.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { documentsService } from '../services/DocumentsService'
import type {
  CreateDocumentData,
  DocumentFormData,
  DocumentId,
  Document,
  DocumentListItem,
  DocumentEntityType,
} from '../types'

/**
 * Main hook for document management by entity
 */
export function useDocumentsByEntity(
  entityType: DocumentEntityType,
  entityId: string,
  options?: {
    includeConfidential?: boolean
  }
) {
  const authUser = useAuthenticatedUser()

  const {
    data: documentsData,
    isPending,
    error,
    refetch,
  } = documentsService.useDocumentsByEntity(
    authUser?.id!,
    entityType,
    entityId,
    options
  )

  const createMutation = documentsService.useCreateDocument()
  const updateMutation = documentsService.useUpdateDocument()
  const deleteMutation = documentsService.useDeleteDocument()

  const createDocument = useCallback(async (documentData: CreateDocumentData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = documentsService.validateDocumentData(documentData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await documentsService.createDocument(createMutation, authUser.id, documentData)
  }, [authUser, createMutation])

  const updateDocument = useCallback(async (
    documentId: DocumentId,
    updates: {
      title?: string
      description?: string
      isPublic?: boolean
      isConfidential?: boolean
    }
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = documentsService.validateDocumentData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await documentsService.updateDocument(updateMutation, authUser.id, documentId, updates)
  }, [authUser, updateMutation])

  const deleteDocument = useCallback(async (documentId: DocumentId) => {
    if (!authUser) throw new Error('Authentication required')
    return await documentsService.deleteDocument(deleteMutation, authUser.id, documentId)
  }, [authUser, deleteMutation])

  const canUploadDocuments = useMemo(() => {
    if (!authUser) return false
    return true // All authenticated users can upload documents
  }, [authUser])

  const canEditDocument = useCallback((document: Document) => {
    if (!authUser) return false
    return document.uploadedBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteDocument = useCallback((document: Document) => {
    if (!authUser) return false
    return document.uploadedBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedDocuments = useMemo(() => {
    if (!documentsData) return []

    return documentsData.map((document): DocumentListItem => ({
      ...document as Document,
      displayUploadedBy: 'User', // Would be enriched with actual user data
      timeAgo: documentsService.getTimeAgo(document.createdAt),
      canEdit: canEditDocument(document as Document),
      canDelete: canDeleteDocument(document as Document),
      fileExtension: documentsService.getFileExtension(document.originalFilename),
      fileSizeFormatted: documentsService.formatFileSize(document.fileSize),
    }))
  }, [documentsData, authUser, canEditDocument, canDeleteDocument])

  return {
    documents: enrichedDocuments,
    isLoading: isPending,
    error,
    refetch,
    createDocument,
    updateDocument,
    deleteDocument,
    canUploadDocuments,
    canEditDocument,
    canDeleteDocument,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single document
 */
export function useDocument(documentId?: DocumentId) {
  const authUser = useAuthenticatedUser()

  const {
    data: document,
    isPending,
    error,
    refetch,
  } = documentsService.useDocument(authUser?.id!, documentId)

  const canEdit = useMemo(() => {
    if (!authUser || !document) return false
    return document.uploadedBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser, document])

  const canDelete = useMemo(() => {
    if (!authUser || !document) return false
    return document.uploadedBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser, document])

  return {
    document,
    isLoading: isPending,
    error,
    refetch,
    canEdit,
    canDelete,
  }
}

/**
 * Hook for document form management
 */
export function useDocumentForm(initialData?: Partial<DocumentFormData>) {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: 'other',
    isPublic: false,
    isConfidential: false,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = documentsService.validateDocumentData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Title')) errorMap.title = error
      else if (error.includes('Description')) errorMap.description = error
      else if (error.includes('File')) errorMap.file = error
      else errorMap.general = error
    })

    // Validate file if present
    if (formData.file) {
      const fileErrors = documentsService.validateFile(formData.file)
      if (fileErrors.length > 0) {
        errorMap.file = fileErrors.join(', ')
      }
    }

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: DocumentFormData = {
      documentType: 'other',
      isPublic: false,
      isConfidential: false,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}
