// convex/lib/yourobc/supporting/documents/utils.ts
// convex/yourobc/supporting/documents/utils.ts
import { DOCUMENT_CONSTANTS } from './constants';
import type { CreateDocumentData } from './types';

export function validateDocumentData(data: Partial<CreateDocumentData>): string[] {
  const errors: string[] = [];

  if (data.filename !== undefined) {
    if (!data.filename.trim()) {
      errors.push('Filename is required');
    } else if (data.filename.length > DOCUMENT_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH) {
      errors.push(`Filename must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH} characters`);
    }
  }

  if (data.fileSize !== undefined) {
    if (data.fileSize > DOCUMENT_CONSTANTS.LIMITS.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  if (data.title && data.title.length > DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
  }

  if (data.description && data.description.length > DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${DOCUMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  return errors;
}

export function generateSystemFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop() || '';
  return `${timestamp}_${randomId}.${extension}`;
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

