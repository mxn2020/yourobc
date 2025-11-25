// convex/lib/yourobc/trackingMessages/utils.ts
// Utility helpers for trackingMessages module

import { TRACKING_MESSAGES_CONSTANTS } from './constants';
import type { CreateTrackingMessageData, UpdateTrackingMessageData } from './types';

/**
 * Format tracking message display name
 */
export function formatTrackingMessageDisplayName(message: { messageId: string; status?: string }): string {
  const statusBadge = message.status ? ` [${message.status}]` : '';
  return `${message.messageId}${statusBadge}`;
}

/**
 * Generate unique message ID
 */
export function generateMessageId(prefix: string = 'MSG'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if message is editable
 */
export function isTrackingMessageEditable(message: { status: string; deletedAt?: number }): boolean {
  if (message.deletedAt) return false;
  return message.status === 'draft';
}

/**
 * Check if message has been read
 */
export function isTrackingMessageRead(message: { readAt?: number }): boolean {
  return !!message.readAt;
}

/**
 * Calculate message delivery time
 */
export function calculateDeliveryTime(message: { sentAt?: number; deliveredAt?: number }): number | null {
  if (!message.sentAt || !message.deliveredAt) return null;
  return message.deliveredAt - message.sentAt;
}

// ============================================================================
// Validation and Trimming Functions
// ============================================================================

/**
 * Trim all string fields in tracking message data
 * Generic typing ensures type safety without `any`
 */
export function trimTrackingMessageData<T extends Partial<CreateTrackingMessageData | UpdateTrackingMessageData>>(data: T): T {
  const trimmed = { ...data };

  if (trimmed.messageId && typeof trimmed.messageId === 'string') {
    trimmed.messageId = trimmed.messageId.trim() as T['messageId'];
  }

  if (trimmed.subject && typeof trimmed.subject === 'string') {
    trimmed.subject = trimmed.subject.trim() as T['subject'];
  }

  if (trimmed.content && typeof trimmed.content === 'string') {
    trimmed.content = trimmed.content.trim() as T['content'];
  }

  if (trimmed.templateId && typeof trimmed.templateId === 'string') {
    trimmed.templateId = trimmed.templateId.trim() as T['templateId'];
  }

  if (trimmed.shipmentNumber && typeof trimmed.shipmentNumber === 'string') {
    trimmed.shipmentNumber = trimmed.shipmentNumber.trim() as T['shipmentNumber'];
  }

  if (trimmed.tags && Array.isArray(trimmed.tags)) {
    trimmed.tags = (trimmed.tags
      .filter((t): t is string => typeof t === 'string')
      .map(t => t.trim())
      .filter(Boolean)) as T['tags'];
  }

  return trimmed;
}

/**
 * Validate tracking message data for creation/update
 * Returns array of error messages
 */
export function validateTrackingMessageData(
  data: Partial<CreateTrackingMessageData | UpdateTrackingMessageData>
): string[] {
  const errors: string[] = [];

  // Validate messageId if provided
  if (data.messageId !== undefined) {
    if (typeof data.messageId !== 'string') {
      errors.push('Message ID must be a string');
    } else {
      const trimmed = data.messageId.trim();

      if (trimmed.length < TRACKING_MESSAGES_CONSTANTS.LIMITS.MIN_MESSAGE_ID_LENGTH) {
        errors.push(`Message ID must be at least ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MIN_MESSAGE_ID_LENGTH} characters`);
      } else if (trimmed.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_MESSAGE_ID_LENGTH) {
        errors.push(`Message ID cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_MESSAGE_ID_LENGTH} characters`);
      } else if (!TRACKING_MESSAGES_CONSTANTS.VALIDATION.MESSAGE_ID_PATTERN.test(trimmed)) {
        errors.push('Message ID contains invalid characters');
      }
    }
  }

  // Validate subject
  if (data.subject !== undefined) {
    if (typeof data.subject !== 'string') {
      errors.push('Subject must be a string');
    } else {
      const trimmed = data.subject.trim();
      if (trimmed && trimmed.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
        errors.push(`Subject cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
      }
    }
  }

  // Validate content (required for create)
  if ('content' in data) {
    if (typeof data.content !== 'string') {
      errors.push('Content must be a string');
    } else {
      const trimmed = data.content.trim();
      if (!trimmed) {
        errors.push('Content is required');
      } else if (trimmed.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
        errors.push(`Content cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
      }
    }
  }

  // Validate recipients
  if ('recipients' in data && data.recipients) {
    if (!Array.isArray(data.recipients)) {
      errors.push('Recipients must be an array');
    } else {
      if (data.recipients.length === 0) {
        errors.push('At least one recipient is required');
      }

      if (data.recipients.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_RECIPIENTS) {
        errors.push(`Cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_RECIPIENTS} recipients`);
      }

      // Validate email format
      for (const recipient of data.recipients) {
        if (recipient.email && !TRACKING_MESSAGES_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(recipient.email)) {
          errors.push(`Invalid email format: ${recipient.email}`);
        }
      }
    }
  }

  // Validate attachments
  if ('attachments' in data && data.attachments) {
    if (!Array.isArray(data.attachments)) {
      errors.push('Attachments must be an array');
    } else {
      if (data.attachments.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
        errors.push(`Cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_ATTACHMENTS} attachments`);
      }
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else {
      if (data.tags.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push(`Cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_TAGS} tags`);
      }

      const emptyTags = data.tags.filter((tag): tag is string =>
        typeof tag === 'string' && !tag.trim()
      );
      if (emptyTags.length > 0) {
        errors.push('Tags cannot be empty');
      }
    }
  }

  return errors;
}

/**
 * Build searchable text for full-text search
 * Only include if using search indexes
 */
export function buildSearchableText(
  data: Partial<CreateTrackingMessageData | UpdateTrackingMessageData>
): string {
  const parts: string[] = [];

  if (data.messageId) parts.push(data.messageId);
  if (data.subject) parts.push(data.subject);
  if (data.content) parts.push(data.content);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags.filter(t => typeof t === 'string'));

  return parts.join(' ').toLowerCase().trim();
}
