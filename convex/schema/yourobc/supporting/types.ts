// convex/schema/yourobc/supporting/types.ts
/**
 * Supporting Module Type Definitions
 *
 * Type extractions for all supporting tables.
 * These types are inferred from validators and table schemas.
 *
 * @module convex/schema/yourobc/supporting/types
 */

import type { Doc, Id } from '@/generated/dataModel'

// ============================================================================
// Exchange Rates Types
// ============================================================================

export type ExchangeRate = Doc<'yourobcExchangeRates'>
export type ExchangeRateId = Id<'yourobcExchangeRates'>

// ============================================================================
// Inquiry Sources Types
// ============================================================================

export type InquirySource = Doc<'yourobcInquirySources'>
export type InquirySourceId = Id<'yourobcInquirySources'>

// ============================================================================
// Wiki Entries Types
// ============================================================================

export type WikiEntry = Doc<'yourobcWikiEntries'>
export type WikiEntryId = Id<'yourobcWikiEntries'>

// ============================================================================
// Comments Types
// ============================================================================

export type Comment = Doc<'yourobcComments'>
export type CommentId = Id<'yourobcComments'>

export interface CommentMention {
  userId: string
  userName: string
}

export interface CommentReaction {
  userId: string
  reaction: string
  createdAt: number
}

export interface CommentAttachment {
  filename: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export interface CommentEditHistory {
  content: string
  editedAt: number
  reason?: string
}

// ============================================================================
// Followup Reminders Types
// ============================================================================

export type FollowupReminder = Doc<'yourobcFollowupReminders'>
export type FollowupReminderId = Id<'yourobcFollowupReminders'>

export interface RecurrencePattern {
  frequency: string
  interval: number
  endDate?: number
  maxOccurrences?: number
}

// ============================================================================
// Documents Types
// ============================================================================

export type Document = Doc<'yourobcDocuments'>
export type DocumentId = Id<'yourobcDocuments'>

// ============================================================================
// Notifications Types
// ============================================================================

export type Notification = Doc<'yourobcNotifications'>
export type NotificationId = Id<'yourobcNotifications'>

// ============================================================================
// Counters Types
// ============================================================================

export type Counter = Doc<'yourobcCounters'>
export type CounterId = Id<'yourobcCounters'>

// ============================================================================
// Validator Types (from base.ts via validators.ts)
// ============================================================================

// All validator types are defined in base.ts and re-exported through validators.ts
// Import types directly from base.ts for type inference
export type {
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
} from '@/schema/base'

// Re-export validators and fields for convenience
export { supportingValidators, supportingFields } from './validators'
