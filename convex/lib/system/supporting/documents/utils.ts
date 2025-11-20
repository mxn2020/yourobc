// convex/lib/boilerplate/supporting/documents/utils.ts

/**
 * Documents Module Utilities
 * Validation and helper functions for document operations
 */
import { DOCUMENT_CONSTANTS } from './constants'
import type { CreateDocumentData, UpdateDocumentData } from './types'
import { Id } from '@/generated/dataModel';

/**
 * Validate document data for create operation
 * @param data - Partial document data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCreateDocumentData(data: Partial<CreateDocumentData>): string[] {
  const errors: string[] = []

  // Filename validation
  if (data.filename !== undefined) {
    if (!data.filename.trim()) {
      errors.push('Filename is required')
    } else if (data.filename.length > DOCUMENT_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH) {
      errors.push(`Filename must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH} characters`)
    }
  }

  // File size validation
  if (data.fileSize !== undefined) {
    if (data.fileSize <= 0) {
      errors.push('File size must be greater than 0')
    } else if (data.fileSize > DOCUMENT_CONSTANTS.LIMITS.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }
  }

  // Title validation
  if (data.title && data.title.length > DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
  }

  // Description validation
  if (data.description && data.description.length > DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`)
  }

  // File URL validation
  if (data.fileUrl !== undefined && !data.fileUrl.trim()) {
    errors.push('File URL is required')
  }

  return errors
}

/**
 * Validate document data for update operation
 * @param data - Partial document data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUpdateDocumentData(data: Partial<UpdateDocumentData>): string[] {
  const errors: string[] = []

  // Title validation
  if (data.title !== undefined && data.title.length > DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
  }

  // Description validation
  if (data.description !== undefined && data.description.length > DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`)
  }

  return errors
}

/**
 * Generate a unique system filename from the original filename
 * @param originalFilename - The original filename
 * @returns System-generated unique filename
 */
export function generateSystemFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = originalFilename.split('.').pop() || ''
  return `${timestamp}_${randomId}.${extension}`
}

/**
 * Check if a file is an image based on MIME type
 * @param mimeType - The MIME type of the file
 * @returns true if the file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Check if a file is a PDF based on MIME type
 * @param mimeType - The MIME type of the file
 * @returns true if the file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

/**
 * Check if a file is a document (Word, Excel, PowerPoint, etc.)
 * @param mimeType - The MIME type of the file
 * @returns true if the file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentMimeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]
  return documentMimeTypes.includes(mimeType)
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if a file type is valid based on MIME type
 * @param mimeType - The MIME type to validate
 * @param allowedTypes - Optional array of allowed MIME types or patterns
 * @returns true if the file type is valid
 */
export function isValidFileType(mimeType: string, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    // By default, allow common file types
    const defaultAllowed = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ]
    return defaultAllowed.some(type => mimeType.startsWith(type) || mimeType === type)
  }

  return allowedTypes.some(type =>
    type.endsWith('/') ? mimeType.startsWith(type) : mimeType === type
  )
}

/**
 * Get MIME type from file extension
 * @param filename - The filename or extension
 * @returns MIME type string
 */
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename)

  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',

    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
  }

  return mimeTypes[extension] || 'application/octet-stream'
}

/**
 * Check if a user can access a document based on permissions
 * @param document - The document to check
 * @param userId - The user ID
 * @param isAdmin - Whether the user is an admin
 * @returns true if user can access the document
 */
export function canUserAccessDocument(
  document: { isPublic: boolean; isConfidential: boolean; uploadedBy: string; deletedAt?: number | null },
  userId: Id<'userProfiles'>,
  isAdmin: boolean
): boolean {
  // Can't access deleted documents
  if (document.deletedAt) {
    return false
  }

  // Admin can access all documents
  if (isAdmin) {
    return true
  }

  // Owner can access their own documents
  if (document.uploadedBy === userId) {
    return true
  }

  // Can access public non-confidential documents
  if (document.isPublic && !document.isConfidential) {
    return true
  }

  return false
}

/**
 * Filter documents by user access permissions
 * @param documents - Array of documents to filter
 * @param userId - The user ID
 * @param isAdmin - Whether the user is an admin
 * @returns Filtered array of documents the user can access
 */
export function filterDocumentsByAccess<T extends { isPublic: boolean; isConfidential: boolean; uploadedBy: string; deletedAt?: number | null }>(
  documents: T[],
  userId: Id<'userProfiles'>,
  isAdmin: boolean
): T[] {
  return documents.filter(doc => canUserAccessDocument(doc, userId, isAdmin))
}

/**
 * Group documents by their document type
 * @param documents - Array of documents to group
 * @returns Object with document types as keys and arrays of documents as values
 */
export function groupDocumentsByType<T extends { documentType: string }>(documents: T[]): Record<string, T[]> {
  return documents.reduce((groups, doc) => {
    const type = doc.documentType
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(doc)
    return groups
  }, {} as Record<string, T[]>)
}
