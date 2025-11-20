// src/features/boilerplate/supporting/documents/components/DocumentUploadForm.tsx

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Upload, X, File } from 'lucide-react';
import { formatFileSize } from '../../shared/constants';
import { DocumentsService } from '../services';
import type { Document, CreateDocumentData } from '../types';

interface DocumentUploadFormProps {
  onSubmit: (data: CreateDocumentData, file: File) => void | Promise<void>;
  onCancel?: () => void;
  entityType: string;
  entityId: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
}

export function DocumentUploadForm({
  onSubmit,
  onCancel,
  entityType,
  entityId,
  maxFileSize,
  allowedTypes,
  className,
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<Document['documentType']>('other');
  const [isPublic, setIsPublic] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [tags, setTags] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationErrors: string[] = [];

    // Validate file type
    if (allowedTypes && !DocumentsService.validateFileType(selectedFile.type, allowedTypes)) {
      validationErrors.push('File type not allowed');
    }

    // Validate file size
    if (maxFileSize && !DocumentsService.validateFileSize(selectedFile.size, maxFileSize)) {
      validationErrors.push(`File size must be less than ${formatFileSize(maxFileSize)}`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    // Auto-set title from filename if not already set
    if (!title) {
      setTitle(selectedFile.name);
    }

    // Auto-detect document type
    const detectedType = DocumentsService.getDocumentTypeFromMimeType(selectedFile.type);
    setDocumentType(detectedType);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const data: CreateDocumentData = {
      entityType,
      entityId,
      documentType,
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileUrl: '', // This will be set after upload
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      isPublic,
      isConfidential,
    };

    const validationErrors = DocumentsService.validateDocumentData(data);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await onSubmit(data, file);
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setDocumentType('other');
      setIsPublic(false);
      setIsConfidential(false);
      setTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to upload document']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-sm text-red-600 list-disc list-inside">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">File</label>
        {!file ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            {maxFileSize && (
              <p className="text-xs text-gray-500">
                Max size: {formatFileSize(maxFileSize)}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={allowedTypes?.join(',') || '*'}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 flex items-center gap-3">
            <File className="h-8 w-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title (Optional)</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the document"
          className="min-h-[80px]"
          disabled={isSubmitting}
        />
      </div>

      {/* Document Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Document Type</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as Document['documentType'])}
          className="w-full border rounded-md px-3 py-2"
          disabled={isSubmitting}
        >
          <option value="contract">Contract</option>
          <option value="invoice">Invoice</option>
          <option value="receipt">Receipt</option>
          <option value="report">Report</option>
          <option value="image">Image</option>
          <option value="presentation">Presentation</option>
          <option value="spreadsheet">Spreadsheet</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
        <Input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
      </div>

      {/* Checkboxes */}
      <div className="mb-4 space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isSubmitting}
            className="rounded"
          />
          <span className="text-sm">Public (visible to everyone)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isConfidential}
            onChange={(e) => setIsConfidential(e.target.checked)}
            disabled={isSubmitting}
            className="rounded"
          />
          <span className="text-sm">Confidential (restricted access)</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!file || isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </form>
  );
}
