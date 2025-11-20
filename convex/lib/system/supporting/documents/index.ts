// convex/lib/boilerplate/supporting/documents/index.ts

/**
 * Documents Module
 * File storage and metadata management for all documentable entities
 *
 * Features:
 * - File metadata storage (actual files stored externally)
 * - Access control (public/confidential flags)
 * - Document type classification
 * - Processing status tracking
 * - Soft delete support
 *
 * @module convex/lib/boilerplate/supporting/documents
 */

// Export constants
export { DOCUMENT_CONSTANTS } from './constants'

// Export types
export type {
  Document,
  DocumentId,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentFilters,
} from './types'

// Export queries
export {
  getDocumentsByEntity,
  getDocument,
  getDocumentsByType,
  getUserDocuments,
  getRecentDocuments,
  getDocuments,
} from './queries'

// Export mutations
export {
  createDocument,
  updateDocument,
  deleteDocument,
  updateDocumentStatus,
} from './mutations'

// Export utilities
export {
  validateCreateDocumentData,
  validateUpdateDocumentData,
  generateSystemFilename,
  isImageFile,
  isPdfFile,
  isDocumentFile,
  getFileExtension,
  formatFileSize,
  isValidFileType,
  getMimeType,
  canUserAccessDocument,
  filterDocumentsByAccess,
  groupDocumentsByType,
} from './utils'
