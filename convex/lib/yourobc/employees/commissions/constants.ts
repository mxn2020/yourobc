// convex/lib/yourobc/employees/commissions/constants.ts

export const COMMISSION_CONSTANTS = {
  TYPE: {
    MARGIN_PERCENTAGE: 'margin_percentage',
    REVENUE_PERCENTAGE: 'revenue_percentage',
    FIXED_AMOUNT: 'fixed_amount',
    TIERED: 'tiered',
  },
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    PAID: 'paid',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
    CHECK: 'check',
    PAYROLL: 'payroll',
  },
  LIMITS: {
    MIN_RATE: 0,
    MAX_RATE: 100,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_NOTES_LENGTH: 2000,
  },
  PERMISSIONS: {
    VIEW: 'commissions.view',
    CREATE: 'commissions.create',
    EDIT: 'commissions.edit',
    DELETE: 'commissions.delete',
    APPROVE: 'commissions.approve',
    PAY: 'commissions.pay',
  },
} as const;
