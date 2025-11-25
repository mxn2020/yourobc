// convex/lib/yourobc/trackingMessages/constants.ts
// Business constants, permissions, and limits for trackingMessages module

export const TRACKING_MESSAGES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'tracking_messages:view',
    CREATE: 'tracking_messages:create',
    EDIT: 'tracking_messages:edit',
    DELETE: 'tracking_messages:delete',
    SEND: 'tracking_messages:send',
    BULK_EDIT: 'tracking_messages:bulk_edit',
  },

  STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    ARCHIVED: 'archived',
  },

  MESSAGE_TYPE: {
    EVENT: 'event',
    NOTE: 'note',
    ALERT: 'alert',
    UPDATE: 'update',
    NOTIFICATION: 'notification',
  },

  PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  DELIVERY_CHANNEL: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    INTERNAL: 'internal',
  },

  LIMITS: {
    MAX_MESSAGE_ID_LENGTH: 100,
    MAX_SUBJECT_LENGTH: 200,
    MAX_CONTENT_LENGTH: 10000,
    MIN_MESSAGE_ID_LENGTH: 3,
    MAX_TAGS: 10,
    MAX_RECIPIENTS: 50,
    MAX_ATTACHMENTS: 10,
    MAX_TIMELINE_EVENTS: 100,
  },

  VALIDATION: {
    MESSAGE_ID_PATTERN: /^[a-zA-Z0-9\-_]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;
