// convex/lib/yourobc/supporting/documents/types.ts
// convex/yourobc/supporting/documents/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type Document = Doc<'yourobcDocuments'>;
export type DocumentId = Id<'yourobcDocuments'>;

export interface CreateDocumentData {
  entityType: Document['entityType'];
  entityId: string;
  documentType: Document['documentType'];
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  isConfidential?: boolean;
}

