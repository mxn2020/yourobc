// src/features/boilerplate/supporting/documents/services/DocumentsService.ts

import { Id } from '@/convex/_generated/dataModel'
import type { Document, CreateDocumentData, UpdateDocumentData } from '../types';
import {
  MAX_CONTENT_LENGTH,
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  formatFileSize,
  isAllowedFileType,
  isValidFileSize,
} from '../../shared/constants';

/**
 * DocumentsService - Service layer for document-related business logic
 */
export class DocumentsService {
  /**
   * Validate document data before upload
   */
  static validateDocumentData(data: Partial<CreateDocumentData>): string[] {
    const errors: string[] = [];

    if (!data.originalFilename || data.originalFilename.trim().length === 0) {
      errors.push('Original filename is required');
    }

    if (!data.fileUrl || data.fileUrl.trim().length === 0) {
      errors.push('File URL is required');
    }

    if (!data.mimeType || data.mimeType.trim().length === 0) {
      errors.push('MIME type is required');
    }

    if (data.fileSize === undefined || data.fileSize <= 0) {
      errors.push('File size must be greater than 0');
    } else if (data.fileSize > FILE_SIZE_LIMITS.VERY_LARGE) {
      errors.push(`File size must be less than ${formatFileSize(FILE_SIZE_LIMITS.VERY_LARGE)}`);
    }

    if (!data.entityType || data.entityType.trim().length === 0) {
      errors.push('Entity type is required');
    }

    if (!data.entityId || data.entityId.trim().length === 0) {
      errors.push('Entity ID is required');
    }

    if (!data.documentType) {
      errors.push('Document type is required');
    }

    if (data.title && data.title.length > MAX_CONTENT_LENGTH.SHORT_TEXT) {
      errors.push(`Title must be less than ${MAX_CONTENT_LENGTH.SHORT_TEXT} characters`);
    }

    if (data.description && data.description.length > MAX_CONTENT_LENGTH.MEDIUM_TEXT) {
      errors.push(`Description must be less than ${MAX_CONTENT_LENGTH.MEDIUM_TEXT} characters`);
    }

    return errors;
  }

  /**
   * Validate update data
   */
  static validateUpdateData(data: Partial<UpdateDocumentData>): string[] {
    const errors: string[] = [];

    if (data.title !== undefined) {
      if (data.title.length > MAX_CONTENT_LENGTH.SHORT_TEXT) {
        errors.push(`Title must be less than ${MAX_CONTENT_LENGTH.SHORT_TEXT} characters`);
      }
    }

    if (data.description !== undefined) {
      if (data.description.length > MAX_CONTENT_LENGTH.MEDIUM_TEXT) {
        errors.push(`Description must be less than ${MAX_CONTENT_LENGTH.MEDIUM_TEXT} characters`);
      }
    }

    return errors;
  }

  /**
   * Validate file type
   */
  static validateFileType(mimeType: string, allowedTypes?: readonly string[]): boolean {
    const allowed = allowedTypes || ALLOWED_FILE_TYPES.ALL;
    return isAllowedFileType(mimeType, allowed);
  }

  /**
   * Validate file size
   */
  static validateFileSize(fileSize: number, maxSize = FILE_SIZE_LIMITS.LARGE): boolean {
    return isValidFileSize(fileSize, maxSize);
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get document type from MIME type
   */
  static getDocumentTypeFromMimeType(mimeType: string): Document['documentType'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'report';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('invoice')) return 'invoice';
    if (mimeType.includes('contract')) return 'contract';
    return 'other';
  }

  /**
   * Format document filename for display
   */
  static formatFilename(filename: string, maxLength = 30): string {
    if (filename.length <= maxLength) return filename;

    const extension = this.getFileExtension(filename);
    const nameWithoutExt = filename.substring(0, filename.length - extension.length - 1);
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);

    return `${truncatedName}...${extension}`;
  }

  /**
   * Check if document is editable by user
   */
  static isDocumentEditable(document: Document, userId: Id<"userProfiles">, isAdmin = false): boolean {
    if (document.deletedAt) return false;
    if (document.status === 'processing') return false;
    return isAdmin || document.uploadedBy === userId;
  }

  /**
   * Check if document is deletable by user
   */
  static isDocumentDeletable(document: Document, userId: Id<"userProfiles">, isAdmin = false): boolean {
    if (document.deletedAt) return false;
    return isAdmin || document.uploadedBy === userId;
  }

  /**
   * Check if user can view confidential documents
   */
  static canViewConfidential(isAdmin = false, isOwner = false): boolean {
    return isAdmin || isOwner;
  }

  /**
   * Filter documents by type
   */
  static filterDocumentsByType(documents: Document[], types: Array<Document['documentType']>): Document[] {
    return documents.filter((doc) => types.includes(doc.documentType));
  }

  /**
   * Filter documents by status
   */
  static filterDocumentsByStatus(documents: Document[], statuses: Array<Document['status']>): Document[] {
    return documents.filter((doc) => statuses.includes(doc.status));
  }

  /**
   * Filter confidential documents
   */
  static filterConfidentialDocuments(documents: Document[], includeConfidential: boolean): Document[] {
    if (includeConfidential) return documents;
    return documents.filter((doc) => !doc.isConfidential);
  }

  /**
   * Search documents by filename or title
   */
  static searchDocuments(documents: Document[], query: string): Document[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return documents;

    return documents.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(lowerQuery) ||
        doc.originalFilename.toLowerCase().includes(lowerQuery) ||
        doc.title?.toLowerCase().includes(lowerQuery) ||
        doc.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Sort documents by date
   */
  static sortDocumentsByDate(documents: Document[], ascending = false): Document[] {
    return [...documents].sort((a, b) => {
      const diff = a.createdAt - b.createdAt;
      return ascending ? diff : -diff;
    });
  }

  /**
   * Sort documents by size
   */
  static sortDocumentsBySize(documents: Document[], ascending = true): Document[] {
    return [...documents].sort((a, b) => {
      const diff = a.fileSize - b.fileSize;
      return ascending ? diff : -diff;
    });
  }

  /**
   * Sort documents by name
   */
  static sortDocumentsByName(documents: Document[], ascending = true): Document[] {
    return [...documents].sort((a, b) => {
      const nameA = (a.title || a.originalFilename).toLowerCase();
      const nameB = (b.title || b.originalFilename).toLowerCase();
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  /**
   * Get total size of documents
   */
  static getTotalSize(documents: Document[]): number {
    return documents.reduce((total, doc) => total + doc.fileSize, 0);
  }

  /**
   * Get document statistics
   */
  static getDocumentStats(documents: Document[]): {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalSize: number;
    confidential: number;
    public: number;
  } {
    const stats = {
      total: documents.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalSize: this.getTotalSize(documents),
      confidential: 0,
      public: 0,
    };

    documents.forEach((doc) => {
      // Count by type
      stats.byType[doc.documentType] = (stats.byType[doc.documentType] || 0) + 1;

      // Count by status
      stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;

      // Count visibility
      if (doc.isConfidential) {
        stats.confidential++;
      }
      if (doc.isPublic) {
        stats.public++;
      }
    });

    return stats;
  }

  /**
   * Get icon for document type
   */
  static getDocumentTypeIcon(documentType: Document['documentType']): string {
    const icons: Record<Document['documentType'], string> = {
      contract: '📄',
      invoice: '🧾',
      specification: '📋',
      report: '📊',
      image: '🖼️',
      presentation: '📽️',
      spreadsheet: '📈',
      other: '📁',
    };
    return icons[documentType] || '📄';
  }

  /**
   * Get label for document type
   */
  static getDocumentTypeLabel(documentType: Document['documentType']): string {
    const labels: Record<Document['documentType'], string> = {
      contract: 'Contract',
      invoice: 'Invoice',
      specification: 'Specification',
      report: 'Report',
      image: 'Image',
      presentation: 'Presentation',
      spreadsheet: 'Spreadsheet',
      other: 'Other',
    };
    return labels[documentType] || documentType;
  }

  /**
   * Generate a safe filename
   */
  static generateSafeFilename(originalFilename: string, entityId: string): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalFilename);
    const nameWithoutExt = originalFilename
      .substring(0, originalFilename.length - extension.length - 1)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);

    return `${entityId}_${nameWithoutExt}_${timestamp}.${extension}`;
  }

  /**
   * Check if file is an image
   */
  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a PDF
   */
  static isPDF(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Check if file can be previewed
   */
  static canPreview(mimeType: string): boolean {
    return this.isImage(mimeType) || this.isPDF(mimeType);
  }
}
