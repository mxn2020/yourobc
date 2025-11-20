// convex/lib/software/yourobc/quotes/constants.ts
/**
 * Quote Constants
 *
 * Business constants, permissions, and limits for quote management.
 *
 * @module convex/lib/software/yourobc/quotes/constants
 */

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

  SHIPMENT_TYPE: {
    DOOR_DOOR: 'door-door',
    DOOR_AIRPORT: 'door-airport',
    AIRPORT_DOOR: 'airport-door',
    AIRPORT_AIRPORT: 'airport-airport',
  },

  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },

  LIMITS: {
    MAX_QUOTE_NUMBER_LENGTH: 50,
    MAX_CUSTOMER_REFERENCE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 2000,
    MAX_QUOTE_TEXT_LENGTH: 10000,
    MAX_NOTES_LENGTH: 5000,
    MAX_REJECTION_REASON_LENGTH: 1000,
    MAX_INCOTERMS_LENGTH: 20,
    MIN_QUOTE_NUMBER_LENGTH: 3,
    MAX_TAGS: 10,
    MAX_PARTNER_QUOTES: 20,

    // Dimension limits
    MIN_DIMENSION: 0.1,
    MAX_DIMENSION: 10000,
    MIN_WEIGHT: 0.1,
    MAX_WEIGHT: 100000,

    // Pricing limits
    MIN_PRICE: 0,
    MAX_PRICE: 1000000,
    MIN_MARKUP: 0,
    MAX_MARKUP: 1000, // 1000% max markup
  },

  VALIDATION: {
    QUOTE_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    INCOTERMS_PATTERN: /^[A-Z]{3}$/,
  },

  // Default validity period (30 days in milliseconds)
  DEFAULT_VALIDITY_DAYS: 30,
  DEFAULT_VALIDITY_MS: 30 * 24 * 60 * 60 * 1000,

  // Quote expiration check interval
  EXPIRATION_WARNING_DAYS: 3,
  EXPIRATION_WARNING_MS: 3 * 24 * 60 * 60 * 1000,
} as const
