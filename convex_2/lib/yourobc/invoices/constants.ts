// convex/lib/yourobc/invoices/constants.ts
// Business constants, permissions, and limits for invoices module

export const INVOICES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'invoices:view',
    CREATE: 'invoices:create',
    EDIT: 'invoices:edit',
    DELETE: 'invoices:delete',
    SEND: 'invoices:send',
    APPROVE: 'invoices:approve',
    PROCESS_PAYMENT: 'invoices:process_payment',
    MANAGE_DUNNING: 'invoices:manage_dunning',
    BULK_EDIT: 'invoices:bulk_edit',
  },

  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  TYPE: {
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
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

  PAYMENT_METHOD_LABELS: {
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    cash: 'Cash',
    check: 'Check',
    paypal: 'PayPal',
    wire_transfer: 'Wire Transfer',
    other: 'Other',
  },

  LIMITS: {
    MAX_INVOICE_NUMBER_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_NOTES_LENGTH: 5000,
    MIN_INVOICE_NUMBER_LENGTH: 3,
    MAX_LINE_ITEMS: 100,
    MIN_LINE_ITEMS: 1,
    MAX_COLLECTION_ATTEMPTS: 50,
    MAX_PAYMENT_TERMS_DAYS: 365,
    MIN_PAYMENT_TERMS_DAYS: 0,
    MAX_TAX_RATE: 100, // 100% max tax rate
    MIN_TAX_RATE: 0,
    MAX_DUNNING_LEVEL: 3,
    MIN_DUNNING_LEVEL: 0,
  },

  VALIDATION: {
    INVOICE_NUMBER_PATTERN: /^[A-Z0-9\-]+$/,
    AMOUNT_PATTERN: /^\d+(\.\d{1,2})?$/,
  },

  DUNNING: {
    LEVELS: {
      NONE: 0,
      LEVEL_1: 1, // Friendly reminder
      LEVEL_2: 2, // Firm reminder
      LEVEL_3: 3, // Final notice / Legal action
    },
    LEVEL_LABELS: {
      0: 'None',
      1: 'Level 1 - Friendly Reminder',
      2: 'Level 2 - Firm Reminder',
      3: 'Level 3 - Final Notice',
    },
    DEFAULT_FEES: {
      1: 0,    // No fee for first reminder
      2: 10,   // €10 fee for second reminder
      3: 25,   // €25 fee for final notice
    },
  },

  PAYMENT_TERMS: {
    NET_15: 15,
    NET_30: 30,
    NET_45: 45,
    NET_60: 60,
    NET_90: 90,
    DUE_ON_RECEIPT: 0,
  },

  TAX_RATES: {
    STANDARD_EU: 19,    // Standard VAT in many EU countries (Germany)
    REDUCED_EU: 7,      // Reduced VAT rate
    ZERO: 0,            // Tax-exempt
    US_STANDARD: 8.5,   // Approximate average US sales tax
  },

  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },

  // Roles that can manage all invoices
  MANAGER_ROLES: ['admin', 'superadmin', 'accountant', 'finance_manager'],

  // Roles that can view all invoices
  VIEWER_ROLES: ['admin', 'superadmin', 'accountant', 'finance_manager', 'analyst'],
} as const;
