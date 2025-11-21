// convex/schema/system/supporting/validators.ts
// Grouped validators for supporting module

import { v } from 'convex/values';
import {
  currencyValidator,
  reminderStatusValidator,
  servicePriorityValidator,
  notificationPriorityValidator,
  inquirySourceTypeValidator,
  wikiEntryTypeValidator,
  wikiStatusValidator,
  commentTypeValidator,
  reminderTypeValidator,
  recurrenceFrequencyValidator,
  documentTypeValidator,
  documentStatusValidator,
  notificationTypeValidator,
  counterTypeValidator,
} from '@/schema/base';

/**
 * Simple union validators for supporting module
 * These are re-exported from base.ts for consistency
 */
export const supportingValidators = {
  // Currency
  currency: currencyValidator,

  // Status validators
  reminderStatus: reminderStatusValidator,
  wikiStatus: wikiStatusValidator,
  documentStatus: documentStatusValidator,

  // Priority validators
  servicePriority: servicePriorityValidator,
  notificationPriority: notificationPriorityValidator,

  // Type validators
  inquirySourceType: inquirySourceTypeValidator,
  wikiEntryType: wikiEntryTypeValidator,
  commentType: commentTypeValidator,
  reminderType: reminderTypeValidator,
  recurrenceFrequency: recurrenceFrequencyValidator,
  documentType: documentTypeValidator,
  notificationType: notificationTypeValidator,
  counterType: counterTypeValidator,
} as const;

/**
 * Complex object schemas for supporting module
 * These define reusable object structures used across supporting tables
 */
export const supportingFields = {
  // Comment mention object
  mention: v.object({
    userId: v.string(),
    userName: v.string(),
  }),

  // Comment reaction object
  reaction: v.object({
    userId: v.string(),
    reaction: v.string(),
    createdAt: v.number(),
  }),

  // Comment/Document attachment object
  attachment: v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }),

  // Comment edit history entry
  editHistoryEntry: v.object({
    content: v.string(),
    editedAt: v.number(),
    reason: v.optional(v.string()),
  }),

  // Reminder recurrence pattern
  recurrencePattern: v.object({
    frequency: recurrenceFrequencyValidator,
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  }),

} as const;
