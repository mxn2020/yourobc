// convex/lib/yourobc/invoices/constants.ts
// convex/yourobc/invoices/constants.ts

export const INVOICE_CONSTANTS = {
  TYPE: {
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
  },
  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer',
    CREDIT_CARD: 'credit_card',
    CASH: 'cash',
    CHECK: 'check',
    PAYPAL: 'paypal',
    WIRE_TRANSFER: 'wire_transfer',
  },
  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },
  DEFAULT_VALUES: {
    CURRENCY: 'EUR',
    PAYMENT_TERMS: 30, // days
    TAX_RATE: 19, // percentage
    STATUS: 'draft',
  },
  LIMITS: {
    MAX_INVOICE_NUMBER_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MAX_REFERENCE_LENGTH: 50,
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999,
    MAX_LINE_ITEMS: 50,
    MAX_COLLECTION_ATTEMPTS: 10,
  },
  PERMISSIONS: {
    VIEW: 'invoices.view',
    CREATE: 'invoices.create',
    EDIT: 'invoices.edit',
    DELETE: 'invoices.delete',
    APPROVE: 'invoices.approve',
    PROCESS_PAYMENT: 'invoices.process_payment',
    SEND: 'invoices.send',
    CANCEL: 'invoices.cancel',
    VIEW_FINANCIAL_DATA: 'invoices.view_financial_data',
  },
} as const;

export const INVOICE_STATUS_COLORS = {
  [INVOICE_CONSTANTS.STATUS.DRAFT]: '#6b7280',
  [INVOICE_CONSTANTS.STATUS.SENT]: '#3b82f6',
  [INVOICE_CONSTANTS.STATUS.PAID]: '#10b981',
  [INVOICE_CONSTANTS.STATUS.OVERDUE]: '#ef4444',
  [INVOICE_CONSTANTS.STATUS.CANCELLED]: '#9ca3af',
} as const;

export const INVOICE_TYPE_COLORS = {
  [INVOICE_CONSTANTS.TYPE.INCOMING]: '#8b5cf6',
  [INVOICE_CONSTANTS.TYPE.OUTGOING]: '#06b6d4',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [INVOICE_CONSTANTS.PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.CREDIT_CARD]: 'Credit Card',
  [INVOICE_CONSTANTS.PAYMENT_METHOD.CASH]: 'Cash',
} as const;

export const CURRENCY_SYMBOLS = {
  [INVOICE_CONSTANTS.CURRENCY.EUR]: '€',
  [INVOICE_CONSTANTS.CURRENCY.USD]: '$',
} as const;

export const OVERDUE_THRESHOLDS = {
  WARNING: 3, // days before due date
  CRITICAL: 0, // due date
  SEVERELY_OVERDUE: 30, // days after due date
} as const;

export const COLLECTION_ATTEMPT_METHODS = [
  'email',
  'phone',
  'letter',
  'legal_notice',
  'debt_collection',
] as const;

export const TAX_RATES = {
  GERMANY: {
    STANDARD: 19,
    REDUCED: 7,
    EXEMPT: 0,
  },
  EU: {
    REVERSE_CHARGE: 0,
  },
  INTERNATIONAL: {
    EXEMPT: 0,
  },
} as const;