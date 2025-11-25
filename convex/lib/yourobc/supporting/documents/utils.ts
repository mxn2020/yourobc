// convex/lib/yourobc/supporting/documents/utils.ts
// Validation + helpers for documents module

import { DOCUMENTS_CONSTANTS } from './constants';
import type { CreateDocumentData, UpdateDocumentData } from './types';

/**
 * Trim all string fields in document data
 * Generic typing ensures type safety without `any`
 */
export function trimDocumentData<
  T extends Partial<CreateDocumentData | UpdateDocumentData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.filename === 'string') {
    trimmed.filename = trimmed.filename.trim() as T['filename'];
  }

  if (typeof trimmed.originalFilename === 'string') {
    trimmed.originalFilename = trimmed.originalFilename.trim() as T['originalFilename'];
  }

  if (typeof trimmed.title === 'string') {
    trimmed.title = trimmed.title.trim() as T['title'];
  }

  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as T['description'];
  }

  return trimmed;
}

/**
 * Validate document data
 * Returns array of error messages
 */
export function validateDocumentData(
  data: Partial<CreateDocumentData | UpdateDocumentData>
): string[] {
  const errors: string[] = [];

  // Validate filename (only on create)
  if ('filename' in data && data.filename !== undefined) {
    if (typeof data.filename !== 'string') {
      errors.push('Filename must be a string');
    } else {
      const filename = data.filename.trim();

      if (!filename) {
        errors.push('Filename is required');
      }

      if (filename.length > DOCUMENTS_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH) {
        errors.push(
          `Filename cannot exceed ${DOCUMENTS_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH} characters`
        );
      }
    }
  }

  // Validate fileSize (only on create)
  if ('fileSize' in data && data.fileSize !== undefined) {
    if (typeof data.fileSize !== 'number') {
      errors.push('File size must be a number');
    } else {
      if (data.fileSize < DOCUMENTS_CONSTANTS.LIMITS.MIN_FILE_SIZE) {
        errors.push('File size must be positive');
      }

      if (data.fileSize > DOCUMENTS_CONSTANTS.LIMITS.MAX_FILE_SIZE) {
        errors.push(
          `File size cannot exceed ${DOCUMENTS_CONSTANTS.LIMITS.MAX_FILE_SIZE} bytes`
        );
      }
    }
  }

  // Validate title
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else {
      const title = data.title.trim();
      if (title && title.length > DOCUMENTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
        errors.push(
          `Title cannot exceed ${DOCUMENTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > DOCUMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description cannot exceed ${DOCUMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }
  }

  // Validate mutual exclusivity
  if (data.isPublic && data.isConfidential) {
    errors.push('Document cannot be both public and confidential');
  }

  return errors;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if MIME type is allowed for document type
 */
export function isMimeTypeAllowed(mimeType: string, documentType: string): boolean {
  // Basic MIME type validation - can be extended with specific rules per document type
  return !!mimeType && mimeType.length > 0 && mimeType.includes('/');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
