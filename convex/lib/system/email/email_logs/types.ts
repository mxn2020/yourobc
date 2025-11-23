// convex/lib/system/email/email_logs/types.ts
// TypeScript interfaces for email logs module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  EmailProvider,
  EmailDeliveryStatus,
} from '@/schema/system/email/types';

// ============================================================================
// Email Log Types
// ============================================================================

export type EmailLog = Doc<'emailLogs'>;
export type EmailLogId = Id<'emailLogs'>;

// Type aliases for consistency with module naming
export type DeliveryStatus = EmailDeliveryStatus;
export type { EmailProvider };

export interface EmailLogStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  pending: number;
  byProvider: Record<string, number>;
  byContext: Record<string, number>;
}

export interface CreateEmailLogData {
  provider: EmailProvider;
  to: string[];
  from: string;
  replyTo?: string;
  subject: string;
  htmlPreview?: string;
  textPreview?: string;
  templateId?: Id<'emailTemplates'>;
  templateData?: any;
  status: DeliveryStatus;
  messageId?: string;
  error?: string;
  providerResponse?: any;
  context?: string;
  triggeredBy?: Id<'userProfiles'>;
  metadata?: any;
}

export interface UpdateEmailStatusData {
  messageId: string;
  status: DeliveryStatus;
  error?: string;
}
