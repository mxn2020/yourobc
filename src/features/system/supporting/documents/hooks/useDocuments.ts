// src/features/system/supporting/documents/hooks/useDocuments.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { CreateDocumentData, UpdateDocumentData } from '../types';

/**
 * Fetch documents for a specific entity
 */
export function useEntityDocuments(
  entityType: string,
  entityId: string,
  includeConfidential = false
) {
  return useQuery(
    api.lib.system.supporting.documents.queries.getDocumentsByEntity,
    entityType && entityId ? { entityType, entityId, includeConfidential } : 'skip'
  );
}

/**
 * Fetch a single document by ID
 */
export function useDocument(documentId?: Id<'documents'>) {
  return useQuery(
    api.lib.system.supporting.documents.queries.getDocument,
    documentId ? { documentId } : 'skip'
  );
}

/**
 * Fetch recent documents across all entities
 */
export function useRecentDocuments(limit = 10) {
  return useQuery(
    api.lib.system.supporting.documents.queries.getRecentDocuments,
    { limit }
  );
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  return useMutation(api.lib.system.supporting.documents.mutations.createDocument);
}

/**
 * Update an existing document
 */
export function useUpdateDocument() {
  return useMutation(api.lib.system.supporting.documents.mutations.updateDocument);
}

/**
 * Delete a document (soft delete)
 */
export function useDeleteDocument() {
  return useMutation(api.lib.system.supporting.documents.mutations.deleteDocument);
}

/**
 * Archive a document
 */
export function useArchiveDocument() {
  return useMutation(api.lib.system.supporting.documents.mutations.archiveDocument);
}

/**
 * Restore an archived document
 */
export function useRestoreDocument() {
  return useMutation(api.lib.system.supporting.documents.mutations.restoreDocument);
}

/**
 * Update document status
 */
export function useUpdateDocumentStatus() {
  return useMutation(api.lib.system.supporting.documents.mutations.updateDocumentStatus);
}
