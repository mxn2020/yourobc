// convex/lib/yourobc/supporting/followup_reminders/constants.ts
// Business constants, permissions, and limits for followup reminders module

export const FOLLOWUP_REMINDERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'followup_reminders:view',
    CREATE: 'followup_reminders:create',
    EDIT: 'followup_reminders:edit',
    DELETE: 'followup_reminders:delete',
    COMPLETE: 'followup_reminders:complete',
  },

  LIMITS: {
    MIN_TITLE_LENGTH: 1,
    MAX_TITLE_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_COMPLETION_NOTES_LENGTH: 5000,
    MAX_SNOOZE_REASON_LENGTH: 500,
    MAX_SNOOZE_DAYS: 90,
  },

  DEFAULTS: {
    EMAIL_REMINDER: true,
  },

  SNOOZE_OPTIONS: [1, 3, 7, 14, 30] as const, // days
} as const;

export const FOLLOWUP_REMINDERS_VALUES = {
  // Status and priority values are defined in base validators
} as const;
