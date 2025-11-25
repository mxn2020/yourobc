// convex/schema/yourobc/supporting/documents/types.ts
// Type definitions for documents module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { documentsValidators } from './validators';
import { documentsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Document = Doc<'yourobcDocuments'>;
export type DocumentId = Id<'yourobcDocuments'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type DocumentSchema = Infer<typeof documentsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type DocumentType = Infer<typeof documentsValidators.documentType>;
export type DocumentStatus = Infer<typeof documentsValidators.documentStatus>;
