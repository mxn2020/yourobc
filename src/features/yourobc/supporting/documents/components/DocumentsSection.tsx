// src/features/yourobc/supporting/documents/components/DocumentsSection.tsx

import React from 'react'
import { FileText } from 'lucide-react'
import { DocumentList } from './DocumentList'
import { useDocumentsByEntity } from '../hooks/useDocuments'
import { isDocumentsEnabled } from '../../config'
import type { DocumentEntityType, DocumentFormData, DocumentId, CreateDocumentData } from '../types'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'

export interface DocumentsSectionProps {
  entityType: DocumentEntityType
  entityId: string
  title?: string
  showConfidential?: boolean
  className?: string
}

/**
 * Reusable documents section component that can be used in any YourOBC entity detail page
 *
 * @example
 * // In QuoteDetailsPage
 * <DocumentsSection
 *   entityType="yourobc_quote"
 *   entityId={quoteId}
 *   title="Quote Documents"
 *   showConfidential={true}
 * />
 *
 * @example
 * // In ShipmentDetailsPage
 * <DocumentsSection
 *   entityType="yourobc_shipment"
 *   entityId={shipmentId}
 *   title="Shipment Documents"
 * />
 */
export function DocumentsSection({
  entityType,
  entityId,
  title = 'Documents & Files',
  showConfidential = true,
  className = '',
}: DocumentsSectionProps) {
  const toast = useToast()

  // Check if documents feature is enabled
  if (!isDocumentsEnabled()) {
    return null
  }

  const {
    documents,
    isLoading,
    error,
    createDocument,
    deleteDocument,
    canUploadDocuments,
    refetch,
  } = useDocumentsByEntity(entityType, entityId, {
    includeConfidential: showConfidential,
  })

  const handleUpload = async (data: DocumentFormData): Promise<void> => {
    if (!data.file) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      // Note: In a real implementation, you would first upload the file to Convex storage
      // For now, this is a placeholder - you need to implement file upload to Convex storage first
      // See: https://docs.convex.dev/file-storage

      // Simulate file upload URL (replace with actual upload logic)
      const fileUrl = 'https://placeholder-url.com/' + data.file.name

      const createData: CreateDocumentData = {
        entityType,
        entityId,
        documentType: data.documentType,
        originalFilename: data.file.name,
        fileSize: data.file.size,
        mimeType: data.file.type,
        fileUrl: fileUrl,
        title: data.title,
        description: data.description,
        isPublic: data.isPublic,
        isConfidential: data.isConfidential,
      }

      await createDocument(createData)
      toast.success('Document uploaded successfully!')
      await refetch()
    } catch (error: any) {
      console.error('Upload error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleDelete = async (documentId: DocumentId): Promise<void> => {
    try {
      await deleteDocument(documentId)
      toast.success('Document deleted successfully!')
      await refetch()
    } catch (error: any) {
      console.error('Delete error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {!isLoading && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {documents.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6">
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error}
          onUploadDocument={handleUpload}
          onDeleteDocument={handleDelete}
          canUploadDocuments={canUploadDocuments}
          showUploadForm={canUploadDocuments}
        />
      </div>
    </div>
  )
}
