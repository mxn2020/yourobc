// convex/lib/yourobc/customers/contacts/constants.ts

export const CONTACT_LOG_CONSTANTS = {
  CONTACT_TYPE: {
    PHONE: 'phone',
    EMAIL: 'email',
    MEETING: 'meeting',
    VIDEO_CALL: 'video_call',
    CHAT: 'chat',
    VISIT: 'visit',
    OTHER: 'other',
  },
  DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
  },
  OUTCOME: {
    SUCCESSFUL: 'successful',
    NO_ANSWER: 'no_answer',
    CALLBACK_REQUESTED: 'callback_requested',
    ISSUE_RESOLVED: 'issue_resolved',
    COMPLAINT: 'complaint',
    INQUIRY: 'inquiry',
    FOLLOW_UP_NEEDED: 'follow_up_needed',
    OTHER: 'other',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  LIMITS: {
    MAX_SUBJECT_LENGTH: 200,
    MAX_SUMMARY_LENGTH: 500,
    MAX_NOTES_LENGTH: 5000,
    MAX_TAGS: 20,
  },
  PERMISSIONS: {
    VIEW: 'contact_logs.view',
    CREATE: 'contact_logs.create',
    EDIT: 'contact_logs.edit',
    DELETE: 'contact_logs.delete',
  },
} as const;
