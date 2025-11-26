// convex/lib/marketing/newsletters/constants.ts

export const NEWSLETTER_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    SENDING: 'sending',
    SENT: 'sent',
    FAILED: 'failed',
    ARCHIVED: 'archived',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },
  SUBSCRIBER_STATUS: {
    ACTIVE: 'active',
    UNSUBSCRIBED: 'unsubscribed',
    BOUNCED: 'bounced',
    COMPLAINED: 'complained',
  },
  PERMISSIONS: {
    VIEW: 'newsletters.view',
    CREATE: 'newsletters.create',
    EDIT: 'newsletters.edit',
    DELETE: 'newsletters.delete',
    SEND: 'newsletters.send',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_SUBJECT_LENGTH: 200,
    MAX_CONTENT_LENGTH: 100000,
    MAX_TAGS: 20,
  },
} as const;

export type NewsletterStatus = typeof NEWSLETTER_CONSTANTS.STATUS[keyof typeof NEWSLETTER_CONSTANTS.STATUS];
export type SubscriberStatus = typeof NEWSLETTER_CONSTANTS.SUBSCRIBER_STATUS[keyof typeof NEWSLETTER_CONSTANTS.SUBSCRIBER_STATUS];
