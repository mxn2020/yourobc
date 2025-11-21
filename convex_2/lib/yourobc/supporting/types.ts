// convex/lib/yourobc/supporting/types.ts
/**
 * Supporting Module Library Types
 *
 * Type definitions for library functions, query results, and mutation arguments.
 *
 * @module convex/lib/yourobc/supporting/types
 */

import type { Id } from '@/generated/dataModel'

// Re-export schema types
export type {
  ExchangeRate,
  ExchangeRateId,
  InquirySource,
  InquirySourceId,
  WikiEntry,
  WikiEntryId,
  Comment,
  CommentId,
  CommentMention,
  CommentReaction,
  CommentAttachment,
  CommentEditHistory,
  FollowupReminder,
  FollowupReminderId,
  RecurrencePattern,
  Document,
  DocumentId,
  Notification,
  NotificationId,
  Counter,
  CounterId,
  Currency,
  ReminderStatus,
  ServicePriority,
  NotificationPriority,
  InquirySourceType,
  WikiEntryType,
  WikiStatus,
  CommentType,
  ReminderType,
  RecurrenceFrequency,
  DocumentType,
  DocumentStatus,
  NotificationType,
  CounterType,
} from '../../../schema/yourobc/supporting'

// ============================================================================
// Exchange Rates Types
// ============================================================================

export interface CreateExchangeRateArgs {
  fromCurrency: string
  toCurrency: string
  rate: number
  date: number
  source?: string
  isActive?: boolean
}

export interface UpdateExchangeRateArgs {
  id: Id<'exchangeRates'>
  rate?: number
  isActive?: boolean
  source?: string
}

export interface GetExchangeRateArgs {
  fromCurrency: string
  toCurrency: string
  date?: number
}

// ============================================================================
// Inquiry Sources Types
// ============================================================================

export interface CreateInquirySourceArgs {
  name: string
  code?: string
  type: string
  description?: string
  isActive?: boolean
}

export interface UpdateInquirySourceArgs {
  id: Id<'inquirySources'>
  name?: string
  code?: string
  type?: string
  description?: string
  isActive?: boolean
}

// ============================================================================
// Wiki Entries Types
// ============================================================================

export interface CreateWikiEntryArgs {
  title: string
  slug: string
  content: string
  type: string
  category: string
  isPublic?: boolean
  status?: string
  tags?: string[]
  customFields?: Record<string, unknown>
}

export interface UpdateWikiEntryArgs {
  id: Id<'wikiEntries'>
  title?: string
  slug?: string
  content?: string
  type?: string
  category?: string
  isPublic?: boolean
  status?: string
  tags?: string[]
  customFields?: Record<string, unknown>
}

export interface WikiSearchArgs {
  query: string
  category?: string
  type?: string
  status?: string
  tags?: string[]
  limit?: number
}

// ============================================================================
// Comments Types
// ============================================================================

export interface CreateCommentArgs {
  entityType: string
  entityId: string
  content: string
  type?: string
  isInternal?: boolean
  mentions?: Array<{ userId: string; userName: string }>
  attachments?: Array<{
    filename: string
    fileUrl: string
    fileSize: number
    mimeType: string
  }>
  parentCommentId?: Id<'comments'>
}

export interface UpdateCommentArgs {
  id: Id<'comments'>
  content?: string
  reason?: string
}

export interface AddCommentReactionArgs {
  id: Id<'comments'>
  userId: string
  reaction: string
}

export interface RemoveCommentReactionArgs {
  id: Id<'comments'>
  userId: string
  reaction: string
}

// ============================================================================
// Followup Reminders Types
// ============================================================================

export interface CreateFollowupReminderArgs {
  title: string
  description?: string
  type: string
  entityType: string
  entityId: string
  dueDate: number
  reminderDate?: number
  priority: string
  assignedTo: string
  assignedBy: string
  emailReminder?: boolean
  isRecurring?: boolean
  recurrencePattern?: {
    frequency: string
    interval: number
    endDate?: number
    maxOccurrences?: number
  }
}

export interface UpdateFollowupReminderArgs {
  id: Id<'yourobcFollowupReminders'>
  title?: string
  description?: string
  type?: string
  dueDate?: number
  reminderDate?: number
  priority?: string
  assignedTo?: string
  status?: string
  emailReminder?: boolean
}

export interface CompleteReminderArgs {
  id: Id<'yourobcFollowupReminders'>
  completedBy: string
  completionNotes?: string
}

export interface SnoozeReminderArgs {
  id: Id<'yourobcFollowupReminders'>
  snoozeUntil: number
  snoozeReason?: string
  snoozedBy: string
}

// ============================================================================
// Documents Types
// ============================================================================

export interface CreateDocumentArgs {
  entityType: string
  entityId: string
  documentType: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  fileUrl: string
  title?: string
  description?: string
  isPublic?: boolean
  isConfidential?: boolean
  uploadedBy: string
}

export interface UpdateDocumentArgs {
  id: Id<'yourobcDocuments'>
  title?: string
  description?: string
  isPublic?: boolean
  isConfidential?: boolean
  status?: string
  documentType?: string
}

// ============================================================================
// Notifications Types
// ============================================================================

export interface CreateNotificationArgs {
  userId: string
  type: string
  title: string
  message: string
  entityType: string
  entityId: string
  priority?: string
  actionUrl?: string
}

export interface MarkNotificationReadArgs {
  id: Id<'yourobcNotifications'>
  isRead: boolean
}

export interface MarkAllNotificationsReadArgs {
  userId: string
}

// ============================================================================
// Counters Types
// ============================================================================

export interface GetNextCounterArgs {
  type: string
  prefix: string
  year?: number
}

export interface ResetCounterArgs {
  type: string
  year: number
}

export interface CounterResult {
  number: number
  formattedNumber: string
}

// ============================================================================
// Query Result Types
// ============================================================================

export interface PaginatedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
  cursor?: string
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
  replyCount: number
}

export interface EntityStats {
  totalComments: number
  totalDocuments: number
  totalReminders: number
  pendingReminders: number
}
