// src/features/yourobc/supporting/documents/components/DocumentList.tsx

import React, { useState } from 'react'
import { Download, Trash2, FileText, Image, File } from 'lucide-react'
import {
  Button,
  Loading,
  Alert,
  AlertDescription,
  Badge,
} from '@/components/ui'
import { DocumentUploadForm } from './DocumentUploadForm'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from '../types'
import type { DocumentListItem, DocumentId, DocumentFormData } from '../types'

export interface DocumentListProps {
  documents: DocumentListItem[]
  isLoading: boolean
  error: Error | null
  onUploadDocument: (data: DocumentFormData) => Promise<void>
  onDeleteDocument: (documentId: DocumentId) => Promise<void>
  canUploadDocuments: boolean
  showUploadForm?: boolean
}

export function DocumentList({
  documents,
  isLoading,
  error,
  onUploadDocument,
  onDeleteDocument,
  canUploadDocuments,
  showUploadForm = true,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<DocumentId | null>(null)

  const handleDelete = async (documentId: DocumentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeletingId(documentId)
    try {
      await onDeleteDocument(documentId)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = (document: DocumentListItem) => {
    window.open(document.fileUrl, '_blank')
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />
    } else {
      return <File className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading documents: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      {showUploadForm && canUploadDocuments && (
        <DocumentUploadForm onUpload={onUploadDocument} />
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {canUploadDocuments
              ? 'No documents yet. Upload your first document above.'
              : 'No documents available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document._id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(document.mimeType)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {document.title || document.originalFilename}
                    </h4>
                    <span className="text-xs text-gray-400 uppercase">
                      {DOCUMENT_TYPE_ICONS[document.documentType]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{document.fileSizeFormatted}</span>
                    <span>•</span>
                    <span>{document.timeAgo}</span>
                    {document.isConfidential && (
                      <>
                        <span>•</span>
                        <Badge variant="warning" size="sm">🔒 Confidential</Badge>
                      </>
                    )}
                  </div>

                  {document.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {document.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {document.canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document._id)}
                    disabled={deletingId === document._id}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === document._id ? (
                      <Loading size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
