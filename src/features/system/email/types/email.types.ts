// src/features/email/types/email.types.ts

import type { EmailProvider } from './provider.types';
import { Id } from "@/convex/_generated/dataModel";

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer; // Base64 string or Buffer
  contentType?: string;
  path?: string; // File path (for some providers)
}

export interface EmailRequest {
  to: string | string[] | EmailAddress | EmailAddress[];
  from?: EmailAddress | string; // Optional, uses default from config
  replyTo?: EmailAddress | string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[]; // For tracking and categorization
  metadata?: Record<string, unknown>; // Additional metadata

  // Template support
  templateId?: string;
  templateData?: Record<string, unknown>;

  // Context for logging
  context?: string; // e.g., 'user_signup', 'password_reset'
  triggeredBy?: Id<"userProfiles">; // userId or 'system'
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  error?: string;
  providerResponse?: unknown;
  timestamp: number;
}

export interface BulkEmailRequest {
  emails: EmailRequest[];
  batchSize?: number; // How many to send at once
}

export interface BulkEmailResponse {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  results: EmailResponse[];
}

export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface EmailLog {
  id: string;
  provider: EmailProvider;
  to: string[];
  from: string;
  subject: string;
  status: EmailStatus;
  messageId?: string;
  error?: string;
  context?: string;
  sentAt?: number;
  deliveredAt?: number;
  createdAt: number;
}

export interface SendEmailOptions {
  skipLogging?: boolean; // Skip saving to email logs
  retryOnFailure?: boolean; // Retry if sending fails
  maxRetries?: number; // Max number of retries
}
