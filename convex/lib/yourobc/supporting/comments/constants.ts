// convex/lib/yourobc/supporting/comments/constants.ts
// convex/yourobc/supporting/comments/constants.ts
export const COMMENT_CONSTANTS = {
  TYPE: {
    NOTE: 'note',
    STATUS_UPDATE: 'status_update',
    CUSTOMER_COMMUNICATION: 'customer_communication',
    INTERNAL: 'internal',
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
    MAX_CONTENT_LENGTH: 5000,
  },
  PERMISSIONS: {
    VIEW: 'comments.view',
    CREATE: 'comments.create',
    EDIT: 'comments.edit',
    DELETE: 'comments.delete',
  },
} as const;

