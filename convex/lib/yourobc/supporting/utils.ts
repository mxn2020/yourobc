// convex/lib/yourobc/supporting/utils.ts
/**
 * Supporting Module Utilities
 *
 * Utility functions for supporting entities including validation,
 * formatting, and helper operations.
 *
 * @module convex/lib/yourobc/supporting/utils
 */

import type {
  CreateExchangeRateArgs,
  CreateInquirySourceArgs,
  CreateWikiEntryArgs,
  CreateCommentArgs,
  CreateFollowupReminderArgs,
  CreateDocumentArgs,
  CreateNotificationArgs,
  CommentWithReplies,
  Comment,
} from './types'
import {
  EXCHANGE_RATE_LIMITS,
  WIKI_LIMITS,
  COMMENT_LIMITS,
  REMINDER_LIMITS,
  DOCUMENT_LIMITS,
  NOTIFICATION_LIMITS,
  COUNTER_LIMITS,
  ALLOWED_MIME_TYPES,
} from './constants'

// ============================================================================
// Exchange Rates Utilities
// ============================================================================

export function validateExchangeRate(args: CreateExchangeRateArgs): string | null {
  if (args.rate <= 0) {
    return 'Exchange rate must be positive'
  }

  if (args.rate > EXCHANGE_RATE_LIMITS.MAX_RATE) {
    return `Exchange rate cannot exceed ${EXCHANGE_RATE_LIMITS.MAX_RATE}`
  }

  if (args.rate < EXCHANGE_RATE_LIMITS.MIN_RATE) {
    return `Exchange rate cannot be less than ${EXCHANGE_RATE_LIMITS.MIN_RATE}`
  }

  if (args.fromCurrency === args.toCurrency) {
    return 'From and to currencies must be different'
  }

  return null
}

export function calculateConversion(
  amount: number,
  rate: number,
  reverse = false,
): number {
  return reverse ? amount / rate : amount * rate
}

// ============================================================================
// Inquiry Sources Utilities
// ============================================================================

export function validateInquirySource(
  args: CreateInquirySourceArgs,
): string | null {
  if (!args.name || args.name.trim().length === 0) {
    return 'Inquiry source name is required'
  }

  if (args.code && !/^[A-Z0-9_]+$/.test(args.code)) {
    return 'Inquiry source code must contain only uppercase letters, numbers, and underscores'
  }

  return null
}

export function generateInquirySourceCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 20)
}

// ============================================================================
// Wiki Entries Utilities
// ============================================================================

export function validateWikiEntry(args: CreateWikiEntryArgs): string | null {
  if (!args.title || args.title.trim().length === 0) {
    return 'Wiki title is required'
  }

  if (args.title.length > WIKI_LIMITS.MAX_TITLE_LENGTH) {
    return `Wiki title cannot exceed ${WIKI_LIMITS.MAX_TITLE_LENGTH} characters`
  }

  if (!args.slug || args.slug.trim().length === 0) {
    return 'Wiki slug is required'
  }

  if (args.slug.length > WIKI_LIMITS.MAX_SLUG_LENGTH) {
    return `Wiki slug cannot exceed ${WIKI_LIMITS.MAX_SLUG_LENGTH} characters`
  }

  if (!args.content || args.content.trim().length === 0) {
    return 'Wiki content is required'
  }

  if (args.content.length > WIKI_LIMITS.MAX_CONTENT_LENGTH) {
    return `Wiki content cannot exceed ${WIKI_LIMITS.MAX_CONTENT_LENGTH} characters`
  }

  if (!args.category || args.category.trim().length === 0) {
    return 'Wiki category is required'
  }

  if (args.tags && args.tags.length > WIKI_LIMITS.MAX_TAGS) {
    return `Wiki cannot have more than ${WIKI_LIMITS.MAX_TAGS} tags`
  }

  if (args.tags) {
    for (const tag of args.tags) {
      if (tag.length > WIKI_LIMITS.MAX_TAG_LENGTH) {
        return `Tag "${tag}" exceeds maximum length of ${WIKI_LIMITS.MAX_TAG_LENGTH} characters`
      }
    }
  }

  return null
}

export function generateWikiSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, WIKI_LIMITS.MAX_SLUG_LENGTH)
}

export function extractWikiSearchTerms(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(term => term.length >= 3)
    .slice(0, 100)
}

// ============================================================================
// Comments Utilities
// ============================================================================

export function validateComment(args: CreateCommentArgs): string | null {
  if (!args.content || args.content.trim().length === 0) {
    return 'Comment content is required'
  }

  if (args.content.length > COMMENT_LIMITS.MAX_CONTENT_LENGTH) {
    return `Comment cannot exceed ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} characters`
  }

  if (!args.entityType || !args.entityId) {
    return 'Entity type and ID are required'
  }

  if (args.mentions && args.mentions.length > COMMENT_LIMITS.MAX_MENTIONS) {
    return `Comment cannot have more than ${COMMENT_LIMITS.MAX_MENTIONS} mentions`
  }

  if (
    args.attachments &&
    args.attachments.length > COMMENT_LIMITS.MAX_ATTACHMENTS
  ) {
    return `Comment cannot have more than ${COMMENT_LIMITS.MAX_ATTACHMENTS} attachments`
  }

  if (args.attachments) {
    for (const attachment of args.attachments) {
      if (attachment.fileSize > COMMENT_LIMITS.MAX_ATTACHMENT_SIZE) {
        return `Attachment "${attachment.filename}" exceeds maximum size of ${COMMENT_LIMITS.MAX_ATTACHMENT_SIZE} bytes`
      }
    }
  }

  return null
}

export function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]) // User ID
  }

  return mentions
}

export function buildCommentThread(
  comments: Comment[],
  parentId?: string,
): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const rootComments: CommentWithReplies[] = []

  // First pass: create all comment objects
  for (const comment of comments) {
    commentMap.set(comment._id, {
      ...comment,
      replies: [],
      replyCount: comment.replyCount || 0,
    })
  }

  // Second pass: build the tree
  for (const comment of comments) {
    const commentWithReplies = commentMap.get(comment._id)!

    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else if (!parentId || comment._id === parentId) {
      rootComments.push(commentWithReplies)
    }
  }

  return rootComments
}

// ============================================================================
// Followup Reminders Utilities
// ============================================================================

export function validateFollowupReminder(
  args: CreateFollowupReminderArgs,
): string | null {
  if (!args.title || args.title.trim().length === 0) {
    return 'Reminder title is required'
  }

  if (args.title.length > REMINDER_LIMITS.MAX_TITLE_LENGTH) {
    return `Reminder title cannot exceed ${REMINDER_LIMITS.MAX_TITLE_LENGTH} characters`
  }

  if (
    args.description &&
    args.description.length > REMINDER_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    return `Reminder description cannot exceed ${REMINDER_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
  }

  if (args.dueDate <= Date.now()) {
    return 'Due date must be in the future'
  }

  if (args.reminderDate && args.reminderDate >= args.dueDate) {
    return 'Reminder date must be before due date'
  }

  if (!args.assignedTo || !args.assignedBy) {
    return 'Assigned to and assigned by are required'
  }

  if (!args.entityType || !args.entityId) {
    return 'Entity type and ID are required'
  }

  if (args.isRecurring && !args.recurrencePattern) {
    return 'Recurrence pattern is required for recurring reminders'
  }

  if (args.recurrencePattern) {
    if (
      args.recurrencePattern.interval > REMINDER_LIMITS.MAX_RECURRENCE_INTERVAL
    ) {
      return `Recurrence interval cannot exceed ${REMINDER_LIMITS.MAX_RECURRENCE_INTERVAL} days`
    }

    if (
      args.recurrencePattern.maxOccurrences &&
      args.recurrencePattern.maxOccurrences > REMINDER_LIMITS.MAX_OCCURRENCES
    ) {
      return `Maximum occurrences cannot exceed ${REMINDER_LIMITS.MAX_OCCURRENCES}`
    }
  }

  return null
}

export function calculateNextReminderDate(
  dueDate: number,
  pattern: { frequency: string; interval: number },
): number {
  const date = new Date(dueDate)

  switch (pattern.frequency) {
    case 'daily':
      date.setDate(date.getDate() + pattern.interval)
      break
    case 'weekly':
      date.setDate(date.getDate() + pattern.interval * 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + pattern.interval)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + pattern.interval)
      break
  }

  return date.getTime()
}

export function isReminderOverdue(dueDate: number, status: string): boolean {
  return status === 'pending' && dueDate < Date.now()
}

// ============================================================================
// Documents Utilities
// ============================================================================

export function validateDocument(args: CreateDocumentArgs): string | null {
  if (!args.filename || args.filename.trim().length === 0) {
    return 'Document filename is required'
  }

  if (args.filename.length > DOCUMENT_LIMITS.MAX_FILENAME_LENGTH) {
    return `Filename cannot exceed ${DOCUMENT_LIMITS.MAX_FILENAME_LENGTH} characters`
  }

  if (args.fileSize <= 0) {
    return 'File size must be positive'
  }

  if (args.fileSize > DOCUMENT_LIMITS.MAX_FILE_SIZE) {
    return `File size cannot exceed ${DOCUMENT_LIMITS.MAX_FILE_SIZE} bytes`
  }

  if (!args.mimeType) {
    return 'MIME type is required'
  }

  if (!ALLOWED_MIME_TYPES.includes(args.mimeType as any)) {
    return `MIME type "${args.mimeType}" is not allowed`
  }

  if (!args.fileUrl || !args.fileUrl.startsWith('http')) {
    return 'Valid file URL is required'
  }

  if (!args.entityType || !args.entityId) {
    return 'Entity type and ID are required'
  }

  if (!args.uploadedBy) {
    return 'Uploaded by is required'
  }

  if (args.title && args.title.length > DOCUMENT_LIMITS.MAX_TITLE_LENGTH) {
    return `Document title cannot exceed ${DOCUMENT_LIMITS.MAX_TITLE_LENGTH} characters`
  }

  if (
    args.description &&
    args.description.length > DOCUMENT_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    return `Document description cannot exceed ${DOCUMENT_LIMITS.MAX_DESCRIPTION_LENGTH} characters`
  }

  return null
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot >= 0 ? filename.slice(lastDot + 1).toLowerCase() : ''
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// ============================================================================
// Notifications Utilities
// ============================================================================

export function validateNotification(
  args: CreateNotificationArgs,
): string | null {
  if (!args.userId) {
    return 'User ID is required'
  }

  if (!args.title || args.title.trim().length === 0) {
    return 'Notification title is required'
  }

  if (args.title.length > NOTIFICATION_LIMITS.MAX_TITLE_LENGTH) {
    return `Notification title cannot exceed ${NOTIFICATION_LIMITS.MAX_TITLE_LENGTH} characters`
  }

  if (!args.message || args.message.trim().length === 0) {
    return 'Notification message is required'
  }

  if (args.message.length > NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH) {
    return `Notification message cannot exceed ${NOTIFICATION_LIMITS.MAX_MESSAGE_LENGTH} characters`
  }

  if (!args.entityType || !args.entityId) {
    return 'Entity type and ID are required'
  }

  if (
    args.actionUrl &&
    args.actionUrl.length > NOTIFICATION_LIMITS.MAX_ACTION_URL_LENGTH
  ) {
    return `Action URL cannot exceed ${NOTIFICATION_LIMITS.MAX_ACTION_URL_LENGTH} characters`
  }

  return null
}

export function shouldDeleteNotification(createdAt: number): boolean {
  const retentionMs = NOTIFICATION_LIMITS.RETENTION_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - createdAt > retentionMs
}

// ============================================================================
// Counters Utilities
// ============================================================================

export function formatCounterNumber(
  prefix: string,
  year: number,
  number: number,
  digits = 6,
): string {
  const paddedNumber = String(number).padStart(digits, '0')
  return `${prefix}-${year}-${paddedNumber}`
}

export function parseCounterNumber(
  formattedNumber: string,
): { prefix: string; year: number; number: number } | null {
  const match = formattedNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/)
  if (!match) {
    return null
  }

  return {
    prefix: match[1],
    year: parseInt(match[2], 10),
    number: parseInt(match[3], 10),
  }
}

export function validateCounterPrefix(prefix: string): string | null {
  if (!prefix || prefix.trim().length === 0) {
    return 'Counter prefix is required'
  }

  if (prefix.length > COUNTER_LIMITS.MAX_PREFIX_LENGTH) {
    return `Counter prefix cannot exceed ${COUNTER_LIMITS.MAX_PREFIX_LENGTH} characters`
  }

  if (!/^[A-Z]+$/.test(prefix)) {
    return 'Counter prefix must contain only uppercase letters'
  }

  return null
}

// ============================================================================
// Common Utilities
// ============================================================================

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) {
    return text
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - 3) + '...'
}
