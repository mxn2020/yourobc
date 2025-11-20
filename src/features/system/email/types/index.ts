// src/features/email/types/index.ts

// Provider types
export type {
  EmailProvider,
  ProviderConfig,
  ProviderCapabilities,
  EmailProviderInfo,
  EmailProviderConfigField,
} from './provider.types';

export { EMAIL_PROVIDERS } from './provider.types';

// Email types
export type {
  EmailAddress,
  EmailAttachment,
  EmailRequest,
  EmailResponse,
  BulkEmailRequest,
  BulkEmailResponse,
  EmailStatus,
  EmailLog,
  SendEmailOptions,
} from './email.types';

// Template types
export type {
  TemplateVariableType,
  TemplateVariable,
  EmailTemplateData,
  RenderTemplateRequest,
  RenderTemplateResponse,
  TemplateCategory,
} from './template.types';

export { TEMPLATE_CATEGORIES } from './template.types';
