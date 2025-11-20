// convex/lib/system/email/constants.ts
// convex/lib/email/constants.ts

export const EMAIL_CONSTANTS = {
  MAX_CONFIGS: 10, // Maximum number of saved configurations
  DEFAULT_FROM_NAME: 'Your App',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

export const EMAIL_PROVIDER_NAMES = {
  resend: 'Resend',
  sendgrid: 'SendGrid',
  ses: 'AWS SES',
  postmark: 'Postmark',
  mailgun: 'Mailgun',
} as const;

export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced',
} as const;
