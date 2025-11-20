// convex/lib/yourobc/supporting/documents/constants.ts
// convex/yourobc/supporting/documents/constants.ts
export const DOCUMENT_CONSTANTS = {
  TYPE: {
    CONTRACT: 'contract',
    AWB: 'awb',
    POD: 'pod', // Proof of Delivery
    INVOICE: 'invoice',
    CERTIFICATE: 'certificate',
    CUSTOMS: 'customs',
    PHOTO: 'photo',
    // Employee document types
    EMPLOYMENT_CONTRACT: 'employment_contract',
    ID_DOCUMENT: 'id_document',
    TRAINING_CERTIFICATE: 'training_certificate',
    PERFORMANCE_REVIEW: 'performance_review',
    VACATION_REQUEST: 'vacation_request',
    OTHER: 'other',
  },
  STATUS: {
    READY: 'ready',
    PROCESSING: 'processing',
    ERROR: 'error',
  },
  ENTITY_TYPE: {
    CUSTOMER: 'customer',
    QUOTE: 'quote',
    SHIPMENT: 'shipment',
    INVOICE: 'invoice',
    EMPLOYEE: 'employee',
    PARTNER: 'partner',
  },
  LIMITS: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILENAME_LENGTH: 255,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },
} as const;

