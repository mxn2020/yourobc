// convex/lib/boilerplate/supporting/supporting/utils.ts
// Utility functions for supporting module

import { SUPPORTING_CONSTANTS } from './constants';
import type {
  CreateWikiEntryInput,
  CreateCommentInput,
  CreateReminderInput,
  CreateDocumentInput,
  CreateScheduledEventInput,
} from './types';

// ============================================================================
// Wiki Entries Validation
// ============================================================================

export function validateWikiEntryData(data: CreateWikiEntryInput): void {
  const { title, slug, content, category, tags } = data;

  if (!title || title.trim().length === 0) {
    throw new Error('Wiki entry title is required');
  }

  if (title.length > SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_TITLE_LENGTH) {
    throw new Error(
      `Wiki entry title must be less than ${SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (!slug || slug.trim().length === 0) {
    throw new Error('Wiki entry slug is required');
  }

  if (slug.length > SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_SLUG_LENGTH) {
    throw new Error(
      `Wiki entry slug must be less than ${SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_SLUG_LENGTH} characters`
    );
  }

  if (!content || content.trim().length === 0) {
    throw new Error('Wiki entry content is required');
  }

  if (content.length > SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_CONTENT_LENGTH) {
    throw new Error(
      `Wiki entry content must be less than ${SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_CONTENT_LENGTH} characters`
    );
  }

  if (!category || category.trim().length === 0) {
    throw new Error('Wiki entry category is required');
  }

  if (tags && tags.length > SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_TAGS) {
    throw new Error(
      `Wiki entry cannot have more than ${SUPPORTING_CONSTANTS.WIKI.LIMITS.MAX_TAGS} tags`
    );
  }
}

// ============================================================================
// Comments Validation
// ============================================================================

export function validateCommentData(data: CreateCommentInput): void {
  const { entityType, entityId, content, mentions, attachments } = data;

  if (!entityType || entityType.trim().length === 0) {
    throw new Error('Comment entity type is required');
  }

  if (!entityId || entityId.trim().length === 0) {
    throw new Error('Comment entity ID is required');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('Comment content is required');
  }

  if (content.length > SUPPORTING_CONSTANTS.COMMENTS.LIMITS.MAX_CONTENT_LENGTH) {
    throw new Error(
      `Comment content must be less than ${SUPPORTING_CONSTANTS.COMMENTS.LIMITS.MAX_CONTENT_LENGTH} characters`
    );
  }

  if (mentions && mentions.length > SUPPORTING_CONSTANTS.COMMENTS.LIMITS.MAX_MENTIONS) {
    throw new Error(
      `Comment cannot have more than ${SUPPORTING_CONSTANTS.COMMENTS.LIMITS.MAX_MENTIONS} mentions`
    );
  }
}

// ============================================================================
// Reminders Validation
// ============================================================================

export function validateReminderData(data: CreateReminderInput): void {
  const { title, entityType, entityId, dueDate, assignedTo } = data;

  if (!title || title.trim().length === 0) {
    throw new Error('Reminder title is required');
  }

  if (title.length > SUPPORTING_CONSTANTS.REMINDERS.LIMITS.MAX_TITLE_LENGTH) {
    throw new Error(
      `Reminder title must be less than ${SUPPORTING_CONSTANTS.REMINDERS.LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (!entityType || entityType.trim().length === 0) {
    throw new Error('Reminder entity type is required');
  }

  if (!entityId || entityId.trim().length === 0) {
    throw new Error('Reminder entity ID is required');
  }

  if (!dueDate || dueDate <= 0) {
    throw new Error('Reminder due date is required');
  }

  if (!assignedTo) {
    throw new Error('Reminder assignedTo is required');
  }
}

// ============================================================================
// Documents Validation
// ============================================================================

export function validateDocumentData(data: CreateDocumentInput): void {
  const { entityType, entityId, filename, fileUrl, fileSize, mimeType } = data;

  if (!entityType || entityType.trim().length === 0) {
    throw new Error('Document entity type is required');
  }

  if (!entityId || entityId.trim().length === 0) {
    throw new Error('Document entity ID is required');
  }

  if (!filename || filename.trim().length === 0) {
    throw new Error('Document filename is required');
  }

  if (filename.length > SUPPORTING_CONSTANTS.DOCUMENTS.LIMITS.MAX_FILENAME_LENGTH) {
    throw new Error(
      `Document filename must be less than ${SUPPORTING_CONSTANTS.DOCUMENTS.LIMITS.MAX_FILENAME_LENGTH} characters`
    );
  }

  if (!fileUrl || fileUrl.trim().length === 0) {
    throw new Error('Document file URL is required');
  }

  if (!fileSize || fileSize <= 0) {
    throw new Error('Document file size is required');
  }

  if (fileSize > SUPPORTING_CONSTANTS.DOCUMENTS.LIMITS.MAX_FILE_SIZE) {
    throw new Error(
      `Document file size must be less than ${SUPPORTING_CONSTANTS.DOCUMENTS.LIMITS.MAX_FILE_SIZE} bytes`
    );
  }

  if (!mimeType || mimeType.trim().length === 0) {
    throw new Error('Document mime type is required');
  }
}

// ============================================================================
// Scheduled Events Validation
// ============================================================================

export function validateScheduledEventData(data: CreateScheduledEventInput): void {
  const { title, entityType, entityId, handlerType, startTime, endTime, organizerId } = data;

  if (!title || title.trim().length === 0) {
    throw new Error('Scheduled event title is required');
  }

  if (title.length > SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.LIMITS.MAX_TITLE_LENGTH) {
    throw new Error(
      `Scheduled event title must be less than ${SUPPORTING_CONSTANTS.SCHEDULED_EVENTS.LIMITS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (!entityType || entityType.trim().length === 0) {
    throw new Error('Scheduled event entity type is required');
  }

  if (!entityId || entityId.trim().length === 0) {
    throw new Error('Scheduled event entity ID is required');
  }

  if (!handlerType || handlerType.trim().length === 0) {
    throw new Error('Scheduled event handler type is required');
  }

  if (!startTime || startTime <= 0) {
    throw new Error('Scheduled event start time is required');
  }

  if (!endTime || endTime <= 0) {
    throw new Error('Scheduled event end time is required');
  }

  if (endTime <= startTime) {
    throw new Error('Scheduled event end time must be after start time');
  }

  if (!organizerId) {
    throw new Error('Scheduled event organizer ID is required');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate searchable content by lowercasing and normalizing
 */
export function generateSearchableContent(content: string): string {
  return content.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Check if a reminder is overdue
 */
export function isReminderOverdue(dueDate: number): boolean {
  return dueDate < Date.now();
}

/**
 * Check if an event is in the past
 */
export function isEventPast(endTime: number): boolean {
  return endTime < Date.now();
}

/**
 * Check if an event is currently happening
 */
export function isEventCurrent(startTime: number, endTime: number): boolean {
  const now = Date.now();
  return startTime <= now && now <= endTime;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
