// convex/lib/yourobc/employees/commissions/constants.ts
// Business constants, permissions, and limits for employeeCommissions module

export const EMPLOYEE_COMMISSIONS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'employeeCommissions:view',
    CREATE: 'employeeCommissions:create',
    EDIT: 'employeeCommissions:edit',
    DELETE: 'employeeCommissions:delete',
    APPROVE: 'employeeCommissions:approve',
    PAY: 'employeeCommissions:pay',
    CANCEL: 'employeeCommissions:cancel',
    BULK_EDIT: 'employeeCommissions:bulk_edit',
    VIEW_ALL: 'employeeCommissions:view_all',
  },

  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    PAID: 'paid',
    CANCELLED: 'cancelled',
  },

  LIMITS: {
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_NOTES_LENGTH: 2000,
    MAX_APPROVAL_NOTES_LENGTH: 1000,
    MAX_CANCELLATION_REASON_LENGTH: 1000,
    MAX_PAYMENT_REFERENCE_LENGTH: 200,
    MIN_BASE_AMOUNT: 0,
    MIN_COMMISSION_PERCENTAGE: 0,
    MAX_COMMISSION_PERCENTAGE: 100,
    MAX_ADJUSTMENTS: 10,
  },

  VALIDATION: {
    COMMISSION_ID_PATTERN: /^COMM-\d{4}-\d{6}$/,
  },
} as const;
