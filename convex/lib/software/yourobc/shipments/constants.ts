// convex/lib/software/yourobc/shipments/constants.ts
// Business constants, permissions, and limits for shipments module

export const SHIPMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'shipments:view',
    CREATE: 'shipments:create',
    EDIT: 'shipments:edit',
    DELETE: 'shipments:delete',
    ASSIGN: 'shipments:assign',
    UPDATE_STATUS: 'shipments:update_status',
    BULK_EDIT: 'shipments:bulk_edit',
    MANAGE_ALL: 'shipments:manage_all',
  },

  STATUS: {
    QUOTED: 'quoted',
    BOOKED: 'booked',
    PICKUP: 'pickup',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CUSTOMS: 'customs',
    DOCUMENT: 'document',
    INVOICED: 'invoiced',
    CANCELLED: 'cancelled',
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

  COMMUNICATION_CHANNEL: {
    EMAIL: 'email',
    WHATSAPP: 'whatsapp',
    PHONE: 'phone',
    OTHER: 'other',
  },

  SLA_STATUS: {
    ON_TRACK: 'on_track',
    AT_RISK: 'at_risk',
    BREACHED: 'breached',
  },

  DOCUMENT_STATUS: {
    PENDING: 'pending',
    RECEIVED: 'received',
    VERIFIED: 'verified',
    MISSING: 'missing',
  },

  LIMITS: {
    MAX_SHIPMENT_NUMBER_LENGTH: 50,
    MAX_AWB_NUMBER_LENGTH: 50,
    MAX_CUSTOMER_REFERENCE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 2000,
    MAX_COURIER_INSTRUCTIONS_LENGTH: 2000,
    MAX_PARTNER_REFERENCE_LENGTH: 100,
    MAX_NOTES_LENGTH: 5000,
    MIN_WEIGHT: 0.1, // kg
    MAX_WEIGHT: 10000, // kg
    MIN_DIMENSIONS: 1, // cm
    MAX_DIMENSIONS: 500, // cm
    MAX_TRACKING_EVENTS: 100,
  },

  VALIDATION: {
    SHIPMENT_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    AWB_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    TRACKING_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
  },

  // Weight/Dimension defaults
  DEFAULTS: {
    WEIGHT_UNIT: 'kg',
    DIMENSION_UNIT: 'cm',
    CURRENCY: 'EUR',
  },
} as const;
