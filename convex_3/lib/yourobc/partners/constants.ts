// convex/lib/yourobc/partners/constants.ts
// Business constants, permissions, and limits for partners module

export const PARTNERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'partners:view',
    CREATE: 'partners:create',
    EDIT: 'partners:edit',
    DELETE: 'partners:delete',
    BULK_EDIT: 'partners:bulk_edit',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 200,
    MIN_COMPANY_NAME_LENGTH: 2,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_NOTES_LENGTH: 5000,
    MAX_INTERNAL_NOTES_LENGTH: 5000,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
    MIN_RANKING: 1,
    MAX_RANKING: 5,
    MIN_COMMISSION_RATE: 0,
    MAX_COMMISSION_RATE: 100,
  },

  VALIDATION: {
    COMPANY_NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,&()']+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const PARTNERS_VALUES = {
  status: Object.values(PARTNERS_CONSTANTS.STATUS),
} as const;
