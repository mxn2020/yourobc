// convex/lib/system/email/templates/types.ts
// TypeScript type definitions for email templates module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmailTemplateStatus, EmailTemplateVariableType } from '@/schema/system/email/email_templates/types';

// Entity types
export type EmailTemplate = Doc<'emailTemplates'>;
export type EmailTemplateId = Id<'emailTemplates'>;

// Variable interface
export interface EmailTemplateVariable {
  name: string;
  type: EmailTemplateVariableType;
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
  status?: EmailTemplateStatus;
}

export interface UpdateEmailTemplateData {
  name?: string;
  description?: string;
  subject?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  reactComponentPath?: string;
  variables?: EmailTemplateVariable[];
  previewData?: any;
  isActive?: boolean;
  category?: string;
  status?: EmailTemplateStatus;
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
  status?: EmailTemplateStatus[];
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
