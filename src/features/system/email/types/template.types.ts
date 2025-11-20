// src/features/email/types/template.types.ts

export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'date';

export interface TemplateVariable {
  name: string;
  type: TemplateVariableType;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface EmailTemplateData {
  id?: string;
  name: string;
  slug: string; // Unique identifier like 'welcome-email'
  description?: string;
  subject: string; // Can include variables like {{userName}}
  htmlTemplate: string;
  textTemplate?: string;
  reactComponentPath?: string; // Path to React Email component
  variables: TemplateVariable[];
  previewData?: Record<string, unknown>;
  isActive: boolean;
  category?: string; // e.g., 'auth', 'crm', 'notifications'
}

export interface RenderTemplateRequest {
  templateId?: string;
  templateSlug?: string;
  data: Record<string, unknown>;
}

export interface RenderTemplateResponse {
  subject: string;
  html: string;
  text?: string;
}

// Predefined template categories
export const TEMPLATE_CATEGORIES = {
  AUTH: 'auth',
  NOTIFICATIONS: 'notifications',
  MARKETING: 'marketing',
  TRANSACTIONAL: 'transactional',
  SYSTEM: 'system',
} as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES];
