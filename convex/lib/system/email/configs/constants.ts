// convex/lib/system/email/configs/constants.ts
// Business constants, permissions, and limits for email configs module

export const EMAIL_CONFIGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'email_configs:view',
    CREATE: 'email_configs:create',
    EDIT: 'email_configs:edit',
    DELETE: 'email_configs:delete',
    TEST: 'email_configs:test',
    ACTIVATE: 'email_configs:activate',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  TEST_STATUS: {
    SUCCESS: 'success',
    FAILED: 'failed',
  },

  PROVIDERS: {
    RESEND: 'resend',
    SENDGRID: 'sendgrid',
    SES: 'ses',
    POSTMARK: 'postmark',
    MAILGUN: 'mailgun',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 3,
    MAX_CONFIGS: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const EMAIL_PROVIDER_NAMES = {
  resend: 'Resend',
  sendgrid: 'SendGrid',
  ses: 'AWS SES',
  postmark: 'Postmark',
  mailgun: 'Mailgun',
} as const;
