// convex/lib/software/yourobc/customers/constants.ts
// Business constants, permissions, and limits for customers module

export const CUSTOMERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'customers:view',
    CREATE: 'customers:create',
    EDIT: 'customers:edit',
    DELETE: 'customers:delete',
    BULK_EDIT: 'customers:bulk_edit',
    SUSPEND_SERVICE: 'customers:suspend_service',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLACKLISTED: 'blacklisted',
  },

  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },

  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer',
    CREDIT_CARD: 'credit_card',
    CASH: 'cash',
    CHECK: 'check',
    PAYPAL: 'paypal',
    WIRE_TRANSFER: 'wire_transfer',
    OTHER: 'other',
  },

  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 200,
    MIN_COMPANY_NAME_LENGTH: 2,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_WEBSITE_LENGTH: 500,
    MAX_NOTES_LENGTH: 5000,
    MAX_INTERNAL_NOTES_LENGTH: 5000,
    MAX_ADDITIONAL_CONTACTS: 10,
    MAX_TAGS: 10,
    MIN_MARGIN: 0,
    MAX_MARGIN: 100,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
  },

  VALIDATION: {
    COMPANY_NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,&()']+$/,
    WEBSITE_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },
} as const;
