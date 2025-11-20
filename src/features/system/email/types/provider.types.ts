// src/features/email/types/provider.types.ts

export type EmailProvider = 'resend' | 'sendgrid' | 'ses' | 'postmark' | 'mailgun';

export interface ProviderConfig {
  provider: EmailProvider;
  apiKey?: string;
  apiSecret?: string;
  domain?: string; // For Mailgun, SES
  region?: string; // For AWS SES
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  additionalSettings?: Record<string, unknown>;
}

export interface ProviderCapabilities {
  maxRecipientsPerEmail: number;
  maxEmailsPerSecond: number;
  supportsBulkSending: boolean;
  supportsTemplates: boolean;
  supportsAttachments: boolean;
  supportsScheduling: boolean;
  supportsAnalytics: boolean;
  supportsWebhooks: boolean;
}

export interface EmailProviderInfo {
  name: string;
  provider: EmailProvider;
  description: string;
  capabilities: ProviderCapabilities;
  pricingModel: string;
  documentationUrl: string;
  configFields: EmailProviderConfigField[];
}

export interface EmailProviderConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
}

export const EMAIL_PROVIDERS: Record<EmailProvider, EmailProviderInfo> = {
  resend: {
    name: 'Resend',
    provider: 'resend',
    description: 'Modern email API designed for developers. Simple, fast, and reliable.',
    capabilities: {
      maxRecipientsPerEmail: 50,
      maxEmailsPerSecond: 10,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: false,
      supportsAnalytics: true,
      supportsWebhooks: true,
    },
    pricingModel: '$20/mo for 50,000 emails (100/day free for testing)',
    documentationUrl: 'https://resend.com/docs',
    configFields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 're_***',
        description: 'Get your API key from the Resend dashboard',
      },
      {
        name: 'fromEmail',
        label: 'From Email',
        type: 'text',
        required: true,
        placeholder: 'hello@yourdomain.com',
        description: 'Must be a verified email/domain',
      },
      {
        name: 'fromName',
        label: 'From Name',
        type: 'text',
        required: true,
        placeholder: 'Your Company',
      },
    ],
  },
  sendgrid: {
    name: 'SendGrid',
    provider: 'sendgrid',
    description: 'Enterprise-grade email delivery with advanced analytics and templates.',
    capabilities: {
      maxRecipientsPerEmail: 1000,
      maxEmailsPerSecond: 100,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: true,
      supportsAnalytics: true,
      supportsWebhooks: true,
    },
    pricingModel: '100 emails/day free, $19.95/mo for 50,000 emails',
    documentationUrl: 'https://docs.sendgrid.com',
    configFields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'SG.***',
        description: 'Get your API key from SendGrid settings',
      },
      {
        name: 'fromEmail',
        label: 'From Email',
        type: 'text',
        required: true,
        placeholder: 'no-reply@yourdomain.com',
      },
      {
        name: 'fromName',
        label: 'From Name',
        type: 'text',
        required: true,
        placeholder: 'Your Company',
      },
    ],
  },
  ses: {
    name: 'AWS SES',
    provider: 'ses',
    description: 'Cost-effective email service from Amazon Web Services. $0.10 per 1,000 emails.',
    capabilities: {
      maxRecipientsPerEmail: 50,
      maxEmailsPerSecond: 14, // Default sending rate
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: false,
      supportsAnalytics: true,
      supportsWebhooks: true,
    },
    pricingModel: '$0.10 per 1,000 emails (62,000 free on EC2)',
    documentationUrl: 'https://docs.aws.amazon.com/ses',
    configFields: [
      {
        name: 'apiKey',
        label: 'Access Key ID',
        type: 'text',
        required: true,
        placeholder: 'AKIA***',
        description: 'AWS IAM Access Key ID',
      },
      {
        name: 'apiSecret',
        label: 'Secret Access Key',
        type: 'password',
        required: true,
        placeholder: '***',
        description: 'AWS IAM Secret Access Key',
      },
      {
        name: 'region',
        label: 'AWS Region',
        type: 'select',
        required: true,
        description: 'AWS region for SES',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'eu-central-1', label: 'EU (Frankfurt)' },
        ],
      },
      {
        name: 'fromEmail',
        label: 'From Email',
        type: 'text',
        required: true,
        placeholder: 'verified@yourdomain.com',
      },
      {
        name: 'fromName',
        label: 'From Name',
        type: 'text',
        required: true,
        placeholder: 'Your Company',
      },
    ],
  },
  postmark: {
    name: 'Postmark',
    provider: 'postmark',
    description: 'Transactional email service focused on deliverability and speed.',
    capabilities: {
      maxRecipientsPerEmail: 50,
      maxEmailsPerSecond: 10,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: false,
      supportsAnalytics: true,
      supportsWebhooks: true,
    },
    pricingModel: '$15/mo for 10,000 emails (100 free for testing)',
    documentationUrl: 'https://postmarkapp.com/developer',
    configFields: [
      {
        name: 'apiKey',
        label: 'Server API Token',
        type: 'password',
        required: true,
        placeholder: '***',
        description: 'Server API token from Postmark',
      },
      {
        name: 'fromEmail',
        label: 'From Email',
        type: 'text',
        required: true,
        placeholder: 'sender@yourdomain.com',
      },
      {
        name: 'fromName',
        label: 'From Name',
        type: 'text',
        required: true,
        placeholder: 'Your Company',
      },
    ],
  },
  mailgun: {
    name: 'Mailgun',
    provider: 'mailgun',
    description: 'Developer-focused email API with powerful validation and routing features.',
    capabilities: {
      maxRecipientsPerEmail: 1000,
      maxEmailsPerSecond: 100,
      supportsBulkSending: true,
      supportsTemplates: true,
      supportsAttachments: true,
      supportsScheduling: true,
      supportsAnalytics: true,
      supportsWebhooks: true,
    },
    pricingModel: '5,000 free emails for 3 months, then $35/mo for 50,000',
    documentationUrl: 'https://documentation.mailgun.com',
    configFields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: '***',
        description: 'Get your API key from Mailgun settings',
      },
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        required: true,
        placeholder: 'mg.yourdomain.com',
        description: 'Your verified Mailgun domain',
      },
      {
        name: 'fromEmail',
        label: 'From Email',
        type: 'text',
        required: true,
        placeholder: 'noreply@mg.yourdomain.com',
      },
      {
        name: 'fromName',
        label: 'From Name',
        type: 'text',
        required: true,
        placeholder: 'Your Company',
      },
    ],
  },
};
