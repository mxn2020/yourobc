// convex/lib/system/email/email_templates/types.ts
// TypeScript type definitions for email templates module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmailStatus, EmailVariableType } from '@/schema/system/email/types';

// Entity types
export type EmailTemplate = Doc<'emailTemplates'>;
export type EmailTemplateId = Id<'emailTemplates'>;

// Variable interface
export interface EmailTemplateVariable {
  name: string;
  type: EmailVariableType;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

// Data interfaces
export interface CreateEmailTemplateData {
  name: string;
  slug: string;
  description?: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  reactComponentPath?: string;
  variables: EmailTemplateVariable[];
  previewData?: any;
  isActive: boolean;
  category?: string;
  status?: EmailStatus;
}

export interface UpdateEmailTemplateData {
  name?: string;
  slug?: string;
  description?: string;
  subject?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  reactComponentPath?: string;
  variables?: EmailTemplateVariable[];
  previewData?: any;
  isActive?: boolean;
  category?: string;
  status?: EmailStatus;
}

// Response types
export interface EmailTemplateListResponse {
  items: EmailTemplate[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmailTemplateFilters {
  category?: string;
  isActive?: boolean;
  status?: EmailStatus[];
  search?: string;
}

// Statistics
export interface TemplateStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  byCategory: Record<string, number>;
}
