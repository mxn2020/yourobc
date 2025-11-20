// src/features/yourobc/supporting/documents/index.ts

// Components
export { DocumentsSection } from './components/DocumentsSection'
export { DocumentList } from './components/DocumentList'
export { DocumentUploadForm } from './components/DocumentUploadForm'

// Hooks
export {
  useDocumentsByEntity,
  useDocument,
  useDocumentForm,
} from './hooks/useDocuments'

// Types
export type {
  Document,
  DocumentId,
  DocumentType,
  DocumentEntityType,
  CreateDocumentData,
  DocumentFormData,
  DocumentListItem,
} from './types'

export {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_CONSTANTS,
} from './types'

// Services
export { documentsService } from './services/DocumentsService'
