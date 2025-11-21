// convex/lib/system/supporting/supporting/constants.ts
// Business constants, permissions, and limits for supporting module

/**
 * Supporting Module Constants
 * Defines permissions, limits, and default values for all supporting entities
 */
export const SUPPORTING_CONSTANTS = {
  // ============================================================================
  // Wiki Entries
  // ============================================================================
  WIKI: {
    TYPE: {
      GUIDE: 'guide',
      TUTORIAL: 'tutorial',
      REFERENCE: 'reference',
      FAQ: 'faq',
      ARTICLE: 'article',
      DOCUMENTATION: 'documentation',
    },
    STATUS: {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      ARCHIVED: 'archived',
      REVIEW: 'review',
    },
    VISIBILITY: {
      PUBLIC: 'public',
      PRIVATE: 'private',
      TEAM: 'team',
      RESTRICTED: 'restricted',
    },
    PERMISSIONS: {
      VIEW: 'wiki:view',
      VIEW_DRAFT: 'wiki:view_draft',
      CREATE: 'wiki:create',
      EDIT: 'wiki:edit',
      DELETE: 'wiki:delete',
      PUBLISH: 'wiki:publish',
    },
    LIMITS: {
      MAX_TITLE_LENGTH: 200,
      MAX_CONTENT_LENGTH: 50000,
      MAX_SLUG_LENGTH: 100,
      MAX_CATEGORY_LENGTH: 50,
      MAX_TAGS: 20,
      MAX_SUMMARY_LENGTH: 500,
    },
    DEFAULT_VALUES: {
      STATUS: 'draft',
      VISIBILITY: 'private',
      VIEW_COUNT: 0,
    },
  },

  // ============================================================================
  // Comments
  // ============================================================================
  COMMENTS: {
    TYPE: {
      COMMENT: 'comment',
      NOTE: 'note',
      FEEDBACK: 'feedback',
      QUESTION: 'question',
      ANSWER: 'answer',
    },
    PERMISSIONS: {
      VIEW: 'comments:view',
      VIEW_INTERNAL: 'comments:view_internal',
      CREATE: 'comments:create',
      EDIT: 'comments:edit',
      DELETE: 'comments:delete',
      REACT: 'comments:react',
    },
    LIMITS: {
      MAX_CONTENT_LENGTH: 5000,
      MAX_MENTIONS: 20,
      MAX_ATTACHMENTS: 10,
      MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
      MAX_EDIT_HISTORY: 50,
      MAX_REACTIONS_PER_COMMENT: 100,
    },
    DEFAULT_VALUES: {
      IS_INTERNAL: false,
      REPLY_COUNT: 0,
      IS_EDITED: false,
    },
  },

  // ============================================================================
  // Reminders
  // ============================================================================
  REMINDERS: {
    TYPE: {
      TASK: 'task',
      REMINDER: 'reminder',
      FOLLOW_UP: 'follow_up',
      DEADLINE: 'deadline',
      MEETING: 'meeting',
    },
    STATUS: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      SNOOZED: 'snoozed',
    },
    PRIORITY: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent',
    },
    PERMISSIONS: {
      VIEW: 'reminders:view',
      CREATE: 'reminders:create',
      EDIT: 'reminders:edit',
      DELETE: 'reminders:delete',
      ASSIGN: 'reminders:assign',
      COMPLETE: 'reminders:complete',
      SNOOZE: 'reminders:snooze',
    },
    LIMITS: {
      MAX_TITLE_LENGTH: 200,
      MAX_DESCRIPTION_LENGTH: 2000,
      MAX_COMPLETION_NOTES_LENGTH: 1000,
      MAX_SNOOZE_REASON_LENGTH: 500,
      MAX_RECURRENCE_OCCURRENCES: 365,
    },
    DEFAULT_VALUES: {
      STATUS: 'pending',
      PRIORITY: 'medium',
      IS_RECURRING: false,
      EMAIL_REMINDER: true,
    },
  },

  // ============================================================================
  // Documents
  // ============================================================================
  DOCUMENTS: {
    TYPE: {
      FILE: 'file',
      IMAGE: 'image',
      VIDEO: 'video',
      AUDIO: 'audio',
      DOCUMENT: 'document',
      SPREADSHEET: 'spreadsheet',
      PRESENTATION: 'presentation',
      PDF: 'pdf',
      OTHER: 'other',
    },
    STATUS: {
      UPLOADED: 'uploaded',
      PROCESSING: 'processing',
      READY: 'ready',
      FAILED: 'failed',
      ARCHIVED: 'archived',
    },
    PERMISSIONS: {
      VIEW: 'documents:view',
      VIEW_CONFIDENTIAL: 'documents:view_confidential',
      UPLOAD: 'documents:upload',
      EDIT: 'documents:edit',
      DELETE: 'documents:delete',
      DOWNLOAD: 'documents:download',
    },
    LIMITS: {
      MAX_FILENAME_LENGTH: 255,
      MAX_TITLE_LENGTH: 200,
      MAX_DESCRIPTION_LENGTH: 1000,
      MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    },
    DEFAULT_VALUES: {
      STATUS: 'uploaded',
      IS_PUBLIC: false,
      IS_CONFIDENTIAL: false,
    },
  },

  // ============================================================================
  // Scheduled Events
  // ============================================================================
  SCHEDULED_EVENTS: {
    TYPE: {
      MEETING: 'meeting',
      EVENT: 'event',
      DEADLINE: 'deadline',
      TASK: 'task',
      REMINDER: 'reminder',
      BLOG_POST: 'blog_post',
      SOCIAL_MEDIA: 'social_media',
      OTHER: 'other',
    },
    STATUS: {
      SCHEDULED: 'scheduled',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      IN_PROGRESS: 'in_progress',
      POSTPONED: 'postponed',
    },
    PROCESSING_STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      SKIPPED: 'skipped',
    },
    VISIBILITY: {
      PUBLIC: 'public',
      PRIVATE: 'private',
      TEAM: 'team',
      RESTRICTED: 'restricted',
    },
    PRIORITY: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent',
      CRITICAL: 'critical',
    },
    ATTENDEE_STATUS: {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      DECLINED: 'declined',
      TENTATIVE: 'tentative',
    },
    LOCATION_TYPE: {
      PHYSICAL: 'physical',
      VIRTUAL: 'virtual',
      PHONE: 'phone',
      OTHER: 'other',
    },
    REMINDER_TYPE: {
      EMAIL: 'email',
      NOTIFICATION: 'notification',
      SMS: 'sms',
    },
    PERMISSIONS: {
      VIEW: 'scheduled_events:view',
      CREATE: 'scheduled_events:create',
      EDIT: 'scheduled_events:edit',
      DELETE: 'scheduled_events:delete',
      MANAGE_ATTENDEES: 'scheduled_events:manage_attendees',
      PROCESS: 'scheduled_events:process',
    },
    LIMITS: {
      MAX_TITLE_LENGTH: 200,
      MAX_DESCRIPTION_LENGTH: 5000,
      MAX_ATTENDEES: 500,
      MAX_ATTACHMENTS: 20,
      MAX_REMINDERS: 10,
      MAX_TAGS: 20,
      MAX_PROCESSING_RETRIES: 5,
    },
    DEFAULT_VALUES: {
      STATUS: 'scheduled',
      PROCESSING_STATUS: 'pending',
      AUTO_PROCESS: false,
      IS_RECURRING: false,
      ALL_DAY: false,
      VISIBILITY: 'private',
      PRIORITY: 'medium',
      PROCESSING_RETRY_COUNT: 0,
    },
  },

  // ============================================================================
  // Availability Preferences
  // ============================================================================
  AVAILABILITY: {
    PERMISSIONS: {
      VIEW: 'availability:view',
      EDIT: 'availability:edit',
    },
    LIMITS: {
      MAX_BUFFER_TIME: 240, // 4 hours in minutes
      MAX_DEFAULT_DURATION: 480, // 8 hours in minutes
      MIN_BUFFER_TIME: 0,
      MIN_DEFAULT_DURATION: 15,
    },
    DEFAULT_VALUES: {
      TIMEZONE: 'America/New_York',
      BUFFER_TIME: 15,
      ALLOW_BACK_TO_BACK: false,
      AUTO_ACCEPT: false,
      DEFAULT_EVENT_DURATION: 60,
    },
  },

  // ============================================================================
  // Common/Shared
  // ============================================================================
  COMMON: {
    RECURRENCE_FREQUENCY: {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
      CUSTOM: 'custom',
    },
  },
} as const;

// Priority weights for sorting
export const PRIORITY_WEIGHTS = {
  [SUPPORTING_CONSTANTS.REMINDERS.PRIORITY.LOW]: 1,
  [SUPPORTING_CONSTANTS.REMINDERS.PRIORITY.MEDIUM]: 2,
  [SUPPORTING_CONSTANTS.REMINDERS.PRIORITY.HIGH]: 3,
  [SUPPORTING_CONSTANTS.REMINDERS.PRIORITY.URGENT]: 4,
} as const;

export const EVENT_PRIORITY_WEIGHTS = {
  [SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.PRIORITY.LOW]: 1,
  [SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.PRIORITY.MEDIUM]: 2,
  [SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.PRIORITY.HIGH]: 3,
  [SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.PRIORITY.URGENT]: 4,
  [SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.PRIORITY.CRITICAL]: 5,
} as const;
