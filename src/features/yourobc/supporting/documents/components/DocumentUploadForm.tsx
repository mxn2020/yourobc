// src/features/yourobc/supporting/documents/components/DocumentUploadForm.tsx

import React, { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { DOCUMENT_TYPE_LABELS } from '../types'
import type { DocumentFormData, DocumentType } from '../types'
import { documentsService } from '../services/DocumentsService'

export interface DocumentUploadFormProps {
  onUpload: (data: DocumentFormData) => Promise<void>
  className?: string
}

export function DocumentUploadForm({ onUpload, className = '' }: DocumentUploadFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<DocumentFormData>>({
    documentType: 'other',
    isPublic: false,
    isConfidential: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const errors = documentsService.validateFile(file)
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setSelectedFile(file)
    setError(null)
    setIsExpanded(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Note: In a real implementation, you would first upload the file to Convex storage
      // and get the fileUrl before calling onUpload
      // For now, we'll simulate this with a placeholder URL

      const uploadData: DocumentFormData = {
        documentType: (formData.documentType as DocumentType) || 'other',
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic || false,
        isConfidential: formData.isConfidential || false,
        file: selectedFile,
      }

      await onUpload(uploadData)

      // Reset form
      setSelectedFile(null)
      setFormData({
        documentType: 'other',
        isPublic: false,
        isConfidential: false,
      })
      setIsExpanded(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setFormData({
      documentType: 'other',
      isPublic: false,
      isConfidential: false,
    })
    setIsExpanded(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`bg-gray-50 border rounded-lg p-4 ${className}`}>
      {!isExpanded ? (
        <div className="flex items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected File */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-white border rounded">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({documentsService.formatFileSize(selectedFile.size)})
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData({ ...formData, documentType: value as DocumentType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (Optional)
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter document title"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter document description"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.isConfidential || false}
                onChange={(checked) => setFormData({ ...formData, isConfidential: checked })}
              />
              <label className="text-sm text-gray-700">
                Mark as confidential
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.isPublic || false}
                onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
              <label className="text-sm text-gray-700">
                Make publicly accessible
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
