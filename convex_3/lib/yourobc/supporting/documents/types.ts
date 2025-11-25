// convex/lib/yourobc/supporting/documents/types.ts
// TypeScript type definitions for documents module

import type { Doc, Id } from '@/generated/dataModel';
import type { DocumentType, DocumentStatus } from '@/schema/yourobc/supporting/documents/types';

// Entity types
export type Document = Doc<'yourobcDocuments'>;
export type DocumentId = Id<'yourobcDocuments'>;

// Create operation
export interface CreateDocumentData {
  entityType: string;
  entityId: string;
  documentType: DocumentType;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  isConfidential?: boolean;
  status?: DocumentStatus;
}

// Update operation
export interface UpdateDocumentData {
  title?: string;
  description?: string;
  isPublic?: boolean;
  isConfidential?: boolean;
  status?: DocumentStatus;
}

// List response
export interface DocumentListResponse {
  items: Document[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface DocumentFilters {
  entityType?: string;
  entityId?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  isPublic?: boolean;
  isConfidential?: boolean;
  uploadedBy?: string;
}
