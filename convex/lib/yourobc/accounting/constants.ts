// convex/lib/yourobc/accounting/constants.ts
// Business constants, permissions, and limits for accounting module

export const ACCOUNTING_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'accounting:view',
    CREATE: 'accounting:create',
    EDIT: 'accounting:edit',
    DELETE: 'accounting:delete',
    APPROVE: 'accounting:approve',
    RECONCILE: 'accounting:reconcile',
    POST: 'accounting:post',
    BULK_EDIT: 'accounting:bulk_edit',
  },

  STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    POSTED: 'posted',
    RECONCILED: 'reconciled',
    CANCELLED: 'cancelled',
    ARCHIVED: 'archived',
  },

  TRANSACTION_TYPE: {
    JOURNAL_ENTRY: 'journal_entry',
    INVOICE: 'invoice',
    EXPENSE: 'expense',
    PAYMENT: 'payment',
    TRANSFER: 'transfer',
    ADJUSTMENT: 'adjustment',
  },

  RECONCILIATION_STATUS: {
    UNRECONCILED: 'unreconciled',
    PARTIAL: 'partial',
    RECONCILED: 'reconciled',
    DISPUTED: 'disputed',
  },

  APPROVAL_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    REVISION_REQUESTED: 'revision_requested',
  },

  LIMITS: {
    MAX_JOURNAL_ENTRY_NUMBER_LENGTH: 50,
    MAX_REFERENCE_NUMBER_LENGTH: 50,
    MAX_MEMO_LENGTH: 500,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_APPROVAL_NOTES_LENGTH: 1000,
    MIN_JOURNAL_ENTRY_NUMBER_LENGTH: 3,
    MAX_TAGS: 10,
    MAX_ATTACHMENTS: 20,
  },

  VALIDATION: {
    JOURNAL_ENTRY_NUMBER_PATTERN: /^[A-Z0-9\-_]+$/,
    CURRENCY_CODE_PATTERN: /^[A-Z]{3}$/,
  },
} as const;
