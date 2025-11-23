// convex/lib/system/email/email_logs/constants.ts
// Business constants for email logs module

export const EMAIL_LOGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'email_logs:view',
    CREATE: 'email_logs:create',
    UPDATE: 'email_logs:update',
    DELETE: 'email_logs:delete',
  },

  DELIVERY_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    BOUNCED: 'bounced',
  } as const,

  PROVIDERS: {
    RESEND: 'resend',
    SENDGRID: 'sendgrid',
    SES: 'ses',
    POSTMARK: 'postmark',
    MAILGUN: 'mailgun',
  } as const,

  LIMITS: {
    PREVIEW_LENGTH: 500, // Max characters for HTML/text preview
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 200,
  },

  VALIDATION: {
    MIN_SUBJECT_LENGTH: 1,
    MAX_SUBJECT_LENGTH: 500,
  },

  CONTEXTS: {
    USER_SIGNUP: 'user_signup',
    PASSWORD_RESET: 'password_reset',
    YOUROBC_QUOTE: 'yourobc_quote',
  },
} as const;

export const EMAIL_LOGS_VALUES = {
  deliveryStatus: Object.values(EMAIL_LOGS_CONSTANTS.DELIVERY_STATUS),
  providers: Object.values(EMAIL_LOGS_CONSTANTS.PROVIDERS),
  contexts: Object.values(EMAIL_LOGS_CONSTANTS.CONTEXTS),
} as const;
