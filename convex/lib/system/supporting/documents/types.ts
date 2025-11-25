// convex/lib/system/supporting/documents/types.ts
// Type definitions for system documents module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  DocumentType,
  DocumentStatus,
  DocumentSchema,
} from '@/schema/system/supporting/documents/types';

export type SystemDocument = Doc<'systemSupportingDocuments'>;
export type SystemDocumentId = Id<'systemSupportingDocuments'>;

export interface CreateSystemDocumentData {
  name: string;
  entityType: string;
  entityId: string;
  type: DocumentType;
  status?: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  tags?: string[];
  version?: number;
}

export interface UpdateSystemDocumentData {
  name?: string;
  status?: DocumentStatus;
  description?: string;
  tags?: string[];
  version?: number;
}

export interface SystemDocumentFilters {
  entityType?: string;
  entityId?: string;
  type?: DocumentType;
  status?: DocumentStatus;
}

export interface SystemDocumentListResponse {
  items: SystemDocument[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export type SystemDocumentSchema = DocumentSchema;
