// convex/lib/software/yourobc/customerMargins/constants.ts
// Business constants, permissions, and limits for customerMargins module

export const CUSTOMER_MARGINS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'customer_margins:view',
    CREATE: 'customer_margins:create',
    EDIT: 'customer_margins:edit',
    DELETE: 'customer_margins:delete',
    APPROVE: 'customer_margins:approve',
    BULK_EDIT: 'customer_margins:bulk_edit',
  },

  STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PENDING_APPROVAL: 'pending_approval',
    EXPIRED: 'expired',
    ARCHIVED: 'archived',
  },

  SERVICE_TYPE: {
    STANDARD: 'standard',
    EXPRESS: 'express',
    OVERNIGHT: 'overnight',
    INTERNATIONAL: 'international',
    FREIGHT: 'freight',
    CUSTOM: 'custom',
  },

  MARGIN_TYPE: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    TIERED: 'tiered',
    VOLUME_BASED: 'volume_based',
  },

  APPROVAL_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    REVISION_REQUESTED: 'revision_requested',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MAX_MARGIN_ID_LENGTH: 50,
    MAX_CHANGE_REASON_LENGTH: 500,
    MAX_NOTES_LENGTH: 2000,
    MAX_APPROVAL_NOTES_LENGTH: 1000,
    MIN_NAME_LENGTH: 3,
    MAX_TAGS: 10,
    MAX_PRICING_RULES: 20,
    MAX_VOLUME_TIERS: 10,
    MAX_HISTORY_ENTRIES: 100,
    MIN_MARGIN: 0,
    MAX_MARGIN: 100,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,]+$/,
    MARGIN_ID_PATTERN: /^[A-Z0-9\-_]+$/,
  },
} as const;
