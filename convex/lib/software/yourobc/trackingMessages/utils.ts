// convex/lib/software/yourobc/trackingMessages/utils.ts
// Validation functions and utility helpers for trackingMessages module

import { TRACKING_MESSAGES_CONSTANTS } from './constants';
import type { CreateTrackingMessageData, UpdateTrackingMessageData } from './types';

/**
 * Validate tracking message data for creation/update
 */
export function validateTrackingMessageData(
  data: Partial<CreateTrackingMessageData | UpdateTrackingMessageData>
): string[] {
  const errors: string[] = [];

  // Validate messageId if provided
  if (data.messageId !== undefined) {
    const trimmed = data.messageId.trim();

    if (trimmed.length < TRACKING_MESSAGES_CONSTANTS.LIMITS.MIN_MESSAGE_ID_LENGTH) {
      errors.push(`Message ID must be at least ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MIN_MESSAGE_ID_LENGTH} characters`);
    } else if (trimmed.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_MESSAGE_ID_LENGTH) {
      errors.push(`Message ID cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_MESSAGE_ID_LENGTH} characters`);
    } else if (!TRACKING_MESSAGES_CONSTANTS.VALIDATION.MESSAGE_ID_PATTERN.test(trimmed)) {
      errors.push('Message ID contains invalid characters');
    }
  }

  // Validate subject
  if (data.subject !== undefined && data.subject.trim()) {
    const trimmed = data.subject.trim();
    if (trimmed.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
      errors.push(`Subject cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
    }
  }

  // Validate content (required for create)
  if ('content' in data) {
    if (!data.content || !data.content.trim()) {
      errors.push('Content is required');
    } else if (data.content.trim().length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
    }
  }

  // Validate recipients
  if ('recipients' in data && data.recipients) {
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

  // Validate attachments
  if ('attachments' in data && data.attachments) {
    if (data.attachments.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
      errors.push(`Cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_ATTACHMENTS} attachments`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${TRACKING_MESSAGES_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

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
