// convex/lib/system/supporting/reminders/constants.ts

/**
 * Reminders Module Constants
 * Defines permissions, limits, and default values for the reminders module
 */
export const REMINDER_CONSTANTS = {
  /**
   * Reminder types
   */
  TYPE: {
    FOLLOW_UP: 'follow_up',
    DEADLINE: 'deadline',
    REVIEW: 'review',
    MEETING: 'meeting',
    TASK: 'task',
  },

  /**
   * Reminder status
   */
  STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    SNOOZED: 'snoozed',
  },

  /**
   * Priority levels
   */
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  /**
   * Recurrence frequency
   */
  FREQUENCY: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
  },

  /**
   * Validation limits
   */
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_COMPLETION_NOTES_LENGTH: 500,
    MAX_SNOOZE_REASON_LENGTH: 200,
  },

  /**
   * Permission strings for authorization
   */
  PERMISSIONS: {
    VIEW: 'reminders.view',
    CREATE: 'reminders.create',
    EDIT: 'reminders.edit',
    DELETE: 'reminders.delete',
    COMPLETE: 'reminders.complete',
  },

  /**
   * Default values
   */
  DEFAULT_VALUES: {
    PRIORITY: 'medium' as const,
    STATUS: 'pending' as const,
    EMAIL_REMINDER: true,
    IS_RECURRING: false,
  },
} as const
