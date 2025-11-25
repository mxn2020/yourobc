// convex/lib/system/email/email_logs/utils.ts
// Validation and helper functions for email logs module

import { EMAIL_LOGS_CONSTANTS } from './constants';
import type { CreateEmailLogData, DeliveryStatus, EmailLog } from './types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate email log data
 */
export function validateEmailLogData(data: CreateEmailLogData): string[] {
  const errors: string[] = [];

  // Validate to array
  if (!data.to || data.to.length === 0) {
    errors.push('At least one recipient email is required');
  }

  // Validate email format for recipients
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  data.to.forEach((email, index) => {
    if (!emailRegex.test(email)) {
      errors.push(`Invalid email format for recipient ${index + 1}: ${email}`);
    }
  });

  // Validate from email
  if (!data.from) {
    errors.push('From email is required');
  } else if (!emailRegex.test(data.from)) {
    errors.push(`Invalid from email format: ${data.from}`);
  }

  // Validate subject
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (data.subject.length < EMAIL_LOGS_CONSTANTS.VALIDATION.MIN_SUBJECT_LENGTH) {
    errors.push(`Subject must be at least ${EMAIL_LOGS_CONSTANTS.VALIDATION.MIN_SUBJECT_LENGTH} character`);
  } else if (data.subject.length > EMAIL_LOGS_CONSTANTS.VALIDATION.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject cannot exceed ${EMAIL_LOGS_CONSTANTS.VALIDATION.MAX_SUBJECT_LENGTH} characters`);
  }

  // Validate provider
  const validProviders = Object.values(EMAIL_LOGS_CONSTANTS.PROVIDERS);
  if (!validProviders.includes(data.provider as any)) {
    errors.push(`Invalid provider: ${data.provider}`);
  }

  // Validate delivery status
  const validStatuses = Object.values(EMAIL_LOGS_CONSTANTS.DELIVERY_STATUS);
  if (!validStatuses.includes(data.status as any)) {
    errors.push(`Invalid delivery status: ${data.status}`);
  }

  return errors;
}

/**
 * Validate delivery status value
 */
export function isValidDeliveryStatus(status: string): status is DeliveryStatus {
  const validStatuses = Object.values(EMAIL_LOGS_CONSTANTS.DELIVERY_STATUS);
  return validStatuses.includes(status as any);
}

/**
 * Truncate text to preview length
 */
export function truncatePreview(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.substring(0, EMAIL_LOGS_CONSTANTS.LIMITS.PREVIEW_LENGTH);
}

/**
 * Trim email addresses
 */
export function trimEmailAddresses(emails: string[]): string[] {
  return emails.map(email => email.trim());
}

/**
 * Format email log display name (subject or fallback)
 */
export function formatEmailLogDisplayName(log: EmailLog): string {
  return log.subject || `Email to ${log.to[0]}`;
}

/**
 * Get color for delivery status
 */
export function getDeliveryStatusColor(status: DeliveryStatus): string {
  switch (status) {
    case 'delivered':
      return 'green';
    case 'sent':
      return 'blue';
    case 'pending':
      return 'yellow';
    case 'failed':
    case 'bounced':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Format email log for display
 */
export function formatEmailLogForDisplay(log: EmailLog) {
  return {
    id: log._id,
    to: log.to.join(', '),
    from: log.from,
    subject: log.subject,
    status: log.deliveryStatus,
    provider: log.provider,
    sentAt: log.sentAt ? new Date(log.sentAt).toISOString() : null,
    deliveredAt: log.deliveredAt ? new Date(log.deliveredAt).toISOString() : null,
    failedAt: log.failedAt ? new Date(log.failedAt).toISOString() : null,
    error: log.error,
    context: log.context,
  };
}
