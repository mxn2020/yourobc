// convex/lib/system/supporting/followup_reminders/constants.ts
// Business constants for system followup reminders module

export const SYSTEM_FOLLOWUP_REMINDERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:followup_reminders:view',
    CREATE: 'system:followup_reminders:create',
    EDIT: 'system:followup_reminders:edit',
    DELETE: 'system:followup_reminders:delete',
    COMPLETE: 'system:followup_reminders:complete',
  },

  LIMITS: {
    MIN_NAME_LENGTH: 1,
    MAX_NAME_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_NOTES_LENGTH: 5000,
    MAX_SNOOZE_REASON_LENGTH: 500,
    MAX_SNOOZE_DAYS: 90,
  },

  DEFAULTS: {
    STATUS: 'pending' as const,
    PRIORITY: 'medium' as const,
  },

  SNOOZE_OPTIONS: [1, 3, 7, 14, 30] as const,
} as const;

export const SYSTEM_FOLLOWUP_REMINDERS_VALUES = {
  // Enums defined in schema validators
} as const;
