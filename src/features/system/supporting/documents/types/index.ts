// src/features/boilerplate/supporting/documents/types/index.ts

import type { Doc } from '@/convex/_generated/dataModel';

// Use the Convex-generated Document type
export type Document = Doc<'documents'>;

/**
 * Document with resolved user information
 */
export interface DocumentWithUser extends Document {
  uploadedByName?: string;
  uploadedByEmail?: string;
}

export interface CreateDocumentData {
  entityType: string;
  entityId: string;
  documentType: Document['documentType'];
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  isConfidential?: boolean;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  documentType?: Document['documentType'];
  isPublic?: boolean;
  isConfidential?: boolean;
  status?: Document['status'];
}

export interface DocumentFilters {
  entityType?: string;
  entityId?: string;
  documentType?: Document['documentType'];
  isPublic?: boolean;
  isConfidential?: boolean;
  uploadedBy?: string;
  status?: Document['status'];
  tags?: string[];
  searchQuery?: string;
}

export interface DocumentUploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}
