// convex/lib/software/yourobc/quotes/constants.ts
// Business constants, permissions, and limits for quotes module

export const QUOTES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'quotes:view',
    CREATE: 'quotes:create',
    EDIT: 'quotes:edit',
    DELETE: 'quotes:delete',
    SEND: 'quotes:send',
    ACCEPT: 'quotes:accept',
    REJECT: 'quotes:reject',
    CONVERT: 'quotes:convert',
    BULK_EDIT: 'quotes:bulk_edit',
  },

  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  },

  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
  },

  PRIORITY: {
    STANDARD: 'standard',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },

  LIMITS: {
    MAX_QUOTE_NUMBER_LENGTH: 50,
    MAX_CUSTOMER_REFERENCE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 1000,
    MAX_QUOTE_TEXT_LENGTH: 5000,
    MAX_NOTES_LENGTH: 5000,
    MAX_REJECTION_REASON_LENGTH: 500,
    MAX_INCOTERMS_LENGTH: 20,
    MIN_VALIDITY_PERIOD_DAYS: 1,
    MAX_VALIDITY_PERIOD_DAYS: 90,
    DEFAULT_VALIDITY_PERIOD_DAYS: 7,
    MIN_MARKUP_PERCENTAGE: 0,
    MAX_MARKUP_PERCENTAGE: 300,
    MAX_PARTNER_QUOTES: 20,
    MAX_TAGS: 10,
  },

  VALIDATION: {
    QUOTE_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    INCOTERMS_PATTERN: /^[A-Z]{3}$/,
  },
} as const;
