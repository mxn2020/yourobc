// src/features/yourobc/supporting/documents/types/index.ts

import type { Id } from '@/convex/_generated/dataModel'

export type DocumentId = Id<'yourobcDocuments'>

export type DocumentType =
  | 'contract'
  | 'awb'
  | 'pod'
  | 'invoice'
  | 'certificate'
  | 'customs'
  | 'photo'
  | 'employment_contract'
  | 'id_document'
  | 'training_certificate'
  | 'performance_review'
  | 'vacation_request'
  | 'commission_statement'
  | 'other'

export type DocumentEntityType =
  | 'yourobc_customer'
  | 'yourobc_quote'
  | 'yourobc_shipment'
  | 'yourobc_invoice'
  | 'yourobc_employee'
  | 'yourobc_partner'

export interface Document {
  _id: DocumentId
  _creationTime: number
  entityType: DocumentEntityType
  entityId: string
  documentType: DocumentType
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  fileUrl: string
  title?: string
  description?: string
  isPublic: boolean
  isConfidential: boolean
  status: 'ready' | 'processing' | 'error'
  uploadedBy: string
  tags?: string[]
  category?: string
  customFields?: {}
  createdBy: string
  createdAt: number
  updatedBy?: string
  updatedAt?: number
  deletedAt?: number
  deletedBy?: string
}

export interface CreateDocumentData {
  entityType: DocumentEntityType
  entityId: string
  documentType: DocumentType
  originalFilename: string
  fileSize: number
  mimeType: string
  fileUrl: string
  title?: string
  description?: string
  isPublic?: boolean
  isConfidential?: boolean
}

export interface DocumentFormData {
  documentType: DocumentType
  title?: string
  description?: string
  isPublic?: boolean
  isConfidential?: boolean
  file?: File
}

export interface DocumentListItem extends Document {
  displayUploadedBy: string
  timeAgo: string
  canEdit: boolean
  canDelete: boolean
  fileExtension: string
  fileSizeFormatted: string
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Contract',
  awb: 'Air Waybill',
  pod: 'Proof of Delivery',
  invoice: 'Invoice',
  certificate: 'Certificate',
  customs: 'Customs Document',
  photo: 'Photo',
  employment_contract: 'Employment Contract',
  id_document: 'ID Document',
  training_certificate: 'Training Certificate',
  performance_review: 'Performance Review',
  vacation_request: 'Vacation Request',
  commission_statement: 'Commission Statement',
  other: 'Other',
}

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  contract: '📄',
  awb: '✈️',
  pod: '📦',
  invoice: '💰',
  certificate: '🎓',
  customs: '🛃',
  photo: '📷',
  employment_contract: '📋',
  id_document: '🆔',
  training_certificate: '📜',
  performance_review: '⭐',
  vacation_request: '🏖️',
  commission_statement: '💵',
  other: '📎',
}

export const DOCUMENT_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
}
