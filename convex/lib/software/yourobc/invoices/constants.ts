// convex/lib/software/yourobc/invoices/constants.ts
// Business constants, permissions, and limits for invoices module

/**
 * Invoice Module Constants
 * Defines permissions, limits, and default values for invoice management
 */
export const INVOICE_CONSTANTS = {
  // ============================================================================
  // Invoice Status
  // ============================================================================
  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  // ============================================================================
  // Invoice Type
  // ============================================================================
  TYPE: {
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
  },

  // ============================================================================
  // Payment Method
  // ============================================================================
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer',
    CREDIT_CARD: 'credit_card',
    CASH: 'cash',
    CHECK: 'check',
    PAYPAL: 'paypal',
    WIRE_TRANSFER: 'wire_transfer',
    OTHER: 'other',
  },

  // ============================================================================
  // Collection Method
  // ============================================================================
  COLLECTION_METHOD: {
    EMAIL: 'email',
    PHONE: 'phone',
    LETTER: 'letter',
    LEGAL_NOTICE: 'legal_notice',
    DEBT_COLLECTION: 'debt_collection',
  },

  // ============================================================================
  // Dunning Levels
  // ============================================================================
  DUNNING_LEVEL: {
    NONE: 0,
    LEVEL_1: 1, // Friendly reminder
    LEVEL_2: 2, // Firm reminder
    LEVEL_3: 3, // Final notice / Legal action
  },

  // ============================================================================
  // Permissions
  // ============================================================================
  PERMISSIONS: {
    VIEW: 'invoices:view',
    VIEW_ALL: 'invoices:view_all',
    CREATE: 'invoices:create',
    EDIT: 'invoices:edit',
    DELETE: 'invoices:delete',
    SEND: 'invoices:send',
    PROCESS_PAYMENT: 'invoices:process_payment',
    MANAGE_COLLECTIONS: 'invoices:manage_collections',
    EXPORT: 'invoices:export',
  },

  // ============================================================================
  // Limits
  // ============================================================================
  LIMITS: {
    MAX_INVOICE_NUMBER_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_NOTES_LENGTH: 5000,
    MAX_LINE_ITEMS: 100,
    MAX_COLLECTION_ATTEMPTS: 50,
    MAX_DUNNING_FEE: 1000,
    MAX_TAX_RATE: 1, // 100%
    MIN_TAX_RATE: 0,
    MAX_PAYMENT_TERMS_DAYS: 365,
  },

  // ============================================================================
  // Default Values
  // ============================================================================
  DEFAULT_VALUES: {
    STATUS: 'draft',
    TYPE: 'outgoing',
    PAYMENT_TERMS: 30, // 30 days
    TAX_RATE: 0,
    DUNNING_LEVEL: 0,
    DUNNING_FEE: 0,
    LINE_ITEMS: [],
    COLLECTION_ATTEMPTS: [],
    TAGS: [],
  },

  // ============================================================================
  // Business Rules
  // ============================================================================
  BUSINESS_RULES: {
    // Days before due date to send first reminder
    FIRST_REMINDER_DAYS_BEFORE_DUE: 7,

    // Days after due date to escalate dunning level
    DUNNING_ESCALATION_DAYS: {
      LEVEL_1: 7,   // 7 days after due date
      LEVEL_2: 21,  // 21 days after due date
      LEVEL_3: 45,  // 45 days after due date
    },

    // Dunning fees per level (in base currency)
    DUNNING_FEES: {
      LEVEL_1: 10,
      LEVEL_2: 25,
      LEVEL_3: 50,
    },

    // Invoice number format
    INVOICE_NUMBER_PREFIX: {
      OUTGOING: 'INV',
      INCOMING: 'BILL',
    },
  },
} as const;

// Status weights for sorting (lower = earlier in workflow)
export const STATUS_WEIGHTS = {
  [INVOICE_CONSTANTS.STATUS.DRAFT]: 1,
  [INVOICE_CONSTANTS.STATUS.SENT]: 2,
  [INVOICE_CONSTANTS.STATUS.OVERDUE]: 3,
  [INVOICE_CONSTANTS.STATUS.PAID]: 4,
  [INVOICE_CONSTANTS.STATUS.CANCELLED]: 5,
} as const;

// Dunning level descriptions
export const DUNNING_LEVEL_DESCRIPTIONS = {
  [INVOICE_CONSTANTS.DUNNING_LEVEL.NONE]: 'No dunning action',
  [INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_1]: 'Friendly reminder',
  [INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_2]: 'Firm reminder',
  [INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_3]: 'Final notice / Legal action',
} as const;
