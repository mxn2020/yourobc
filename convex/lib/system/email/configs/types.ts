// convex/lib/system/email/configs/types.ts
// TypeScript type definitions for email configs module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmailProvider, EmailConfigStatus } from '@/schema/system/email/configs/types';

// Entity types
export type EmailConfig = Doc<'emailConfigs'>;
export type EmailConfigId = Id<'emailConfigs'>;

// Data interfaces
export interface CreateEmailConfigData {
  name: string;
  provider: EmailProvider;
  config: {
    apiKey?: string;
    apiSecret?: string;
    domain?: string;
    region?: string;
    fromEmail: string;
    fromName: string;
    replyToEmail?: string;
    additionalSettings?: any;
  };
  setAsActive?: boolean;
  status?: EmailConfigStatus;
}

export interface UpdateEmailConfigData {
  name?: string;
  config?: EmailConfig['config'];
  isActive?: boolean;
  isVerified?: boolean;
  status?: EmailConfigStatus;
  settings?: EmailConfig['settings'];
}

// Response types
export interface EmailConfigListResponse {
  items: EmailConfig[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmailConfigFilters {
  provider?: EmailProvider[];
  status?: EmailConfigStatus[];
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

// Test connection result
export interface TestConnectionResult {
  success: boolean;
  message: string;
  error?: string;
  provider: EmailProvider;
}
