// convex/lib/yourobc/supporting/followup_reminders/constants.ts
// convex/yourobc/supporting/followupReminders/constants.ts
export const REMINDER_CONSTANTS = {
  TYPE: {
    FOLLOW_UP: 'follow_up',
    DEADLINE: 'deadline',
    REVIEW: 'review',
    PAYMENT: 'payment',
    VACATION_APPROVAL: 'vacation_approval',
    COMMISSION_REVIEW: 'commission_review',
    PERFORMANCE_REVIEW: 'performance_review',
  },
  STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },
  PERMISSIONS: {
    VIEW: 'reminders.view',
    CREATE: 'reminders.create',
    EDIT: 'reminders.edit',
    DELETE: 'reminders.delete',
  },
} as const;

