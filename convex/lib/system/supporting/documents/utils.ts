// convex/lib/system/supporting/documents/utils.ts
// Validation and helpers for system documents

import { SYSTEM_DOCUMENTS_CONSTANTS } from './constants';
import type {
  CreateSystemDocumentData,
  UpdateSystemDocumentData,
} from './types';

export function trimSystemDocumentData<
  T extends Partial<CreateSystemDocumentData | UpdateSystemDocumentData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as T['name'];
  }
  if (typeof trimmed.entityType === 'string') {
    trimmed.entityType = trimmed.entityType.trim() as T['entityType'];
  }
  if (typeof trimmed.entityId === 'string') {
    trimmed.entityId = trimmed.entityId.trim() as T['entityId'];
  }
  if (typeof trimmed.fileName === 'string') {
    trimmed.fileName = trimmed.fileName.trim() as T['fileName'];
  }
  if (typeof trimmed.fileUrl === 'string') {
    trimmed.fileUrl = trimmed.fileUrl.trim() as T['fileUrl'];
  }
  if (typeof trimmed.mimeType === 'string') {
    trimmed.mimeType = trimmed.mimeType.trim() as T['mimeType'];
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as T['description'];
  }
  if (Array.isArray(trimmed.tags)) {
    trimmed.tags = trimmed.tags.map((t) => t.trim()).filter(Boolean) as T['tags'];
  }

  return trimmed;
}

export function validateSystemDocumentData(
  data: Partial<CreateSystemDocumentData | UpdateSystemDocumentData>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required');
    } else if (data.name.length > SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push('Name exceeds maximum length');
    }
  }

  if (data.fileName !== undefined) {
    if (!data.fileName.trim()) {
      errors.push('Filename is required');
    } else if (data.fileName.length > SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MAX_FILENAME_LENGTH) {
      errors.push('Filename exceeds maximum length');
    }
  }

  if (data.fileSize !== undefined) {
    if (typeof data.fileSize !== 'number' || data.fileSize < SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MIN_FILE_SIZE) {
      errors.push('File size must be non-negative');
    }
    if (data.fileSize > SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MAX_FILE_SIZE) {
      errors.push('File size exceeds maximum allowed');
    }
  }

  if (data.description && data.description.length > SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push('Description exceeds maximum length');
  }

  if (data.tags) {
    if (data.tags.length > SYSTEM_DOCUMENTS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push('Too many tags');
    }
  }

  return errors;
}

export function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx) : '';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}
