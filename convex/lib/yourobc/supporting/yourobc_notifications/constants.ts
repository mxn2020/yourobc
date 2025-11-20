// convex/lib/yourobc/supporting/yourobc_notifications/constants.ts
// convex/yourobc/supporting/yourobcNotifications/constants.ts
export const YourOBC_NOTIFICATION_CONSTANTS = {
  TYPE: {
    QUOTE_EXPIRING: 'quote_expiring',
    SLA_WARNING: 'sla_warning',
    PAYMENT_OVERDUE: 'payment_overdue',
    TASK_ASSIGNED: 'task_assigned',
    REMINDER_DUE: 'reminder_due',
    // Employee/HR notifications
    VACATION_REQUEST: 'vacation_request',
    VACATION_APPROVED: 'vacation_approved',
    VACATION_DENIED: 'vacation_denied',
    COMMISSION_READY: 'commission_ready',
    PERFORMANCE_REVIEW_DUE: 'performance_review_due',
    EMPLOYEE_STATUS_CHANGE: 'employee_status_change',
  },
  PRIORITY: {
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  ENTITY_TYPE: {
    CUSTOMER: 'customer',
    QUOTE: 'quote',
    SHIPMENT: 'shipment',
    INVOICE: 'invoice',
    REMINDER: 'reminder',
    EMPLOYEE: 'employee',
    COMMISSION: 'commission',
    VACATION: 'vacation',
    PARTNER: 'partner',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_MESSAGE_LENGTH: 1000,
  },
} as const;

