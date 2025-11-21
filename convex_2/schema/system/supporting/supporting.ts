// convex/schema/system/supporting/supporting/supporting.ts
// Table definitions for supporting module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';
import {
  wikiValidators,
  commentValidators,
  reminderValidators,
  documentValidators,
  scheduledEventValidators,
  commonValidators,
} from './validators';

// ============================================================================
// Wiki Entries Table
// ============================================================================

/**
 * Wiki entries table
 * Knowledge base articles, guides, and documentation
 */
export const wikiEntriesTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: wikiValidators.status,

  // Content and slug
  slug: v.string(),
  content: v.string(),
  summary: v.optional(v.string()),

  // Wiki-specific fields
  type: wikiValidators.type,
  visibility: wikiValidators.visibility,
  viewCount: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),

  // Categorization
  category: v.string(),
  tags: v.array(v.string()),

  // Search optimization
  searchableContent: v.optional(v.string()), // Lowercased for search

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_visibility', ['visibility'])
  .index('by_created', ['createdAt']);

// ============================================================================
// Comments Table
// ============================================================================

/**
 * Comments table
 * Universal commenting system for all commentable entities
 */
export const commentsTable = defineTable({
  // Required: Entity reference
  entityType: entityTypes.commentable,
  entityId: v.string(),

  // Required: Content
  content: v.string(),

  // Required: Core fields (using createdBy from auditFields as ownerId equivalent)
  type: v.optional(commentValidators.type),
  isInternal: v.boolean(),

  // Mentions
  mentions: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
  }))),

  // Reactions
  reactions: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
    reaction: v.string(), // emoji or reaction type
    createdAt: v.number(),
  }))),

  // Attachments
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }))),

  // Edit History
  isEdited: v.optional(v.boolean()),
  editHistory: v.optional(v.array(v.object({
    content: v.string(),
    editedAt: v.number(),
    reason: v.optional(v.string()),
  }))),

  // Threading
  parentCommentId: v.optional(v.id('comments')),
  replyCount: v.optional(v.number()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created_by', ['createdBy']);

// ============================================================================
// Reminders Table
// ============================================================================

/**
 * Reminders table
 * Task and reminder management with recurrence support
 */
export const remindersTable = defineTable({
  // Required: Public ID
  publicId: v.string(),

  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: reminderValidators.status,

  // Reminder-specific fields
  description: v.optional(v.string()),
  type: reminderValidators.type,
  entityType: entityTypes.all,
  entityId: v.string(),

  // Timeline
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: reminderValidators.priority,

  // Assignment
  assignedTo: v.id('userProfiles'),
  assignedBy: v.id('userProfiles'),

  // Completion
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.id('userProfiles')),
  completionNotes: v.optional(v.string()),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(v.object({
    frequency: commonValidators.recurrenceFrequency,
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),

  // Snooze
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.id('userProfiles')),
  snoozedAt: v.optional(v.number()),

  // Notification
  emailReminder: v.boolean(),

  // Audit fields
  metadata: v.optional(v.object({
    occurrenceCount: v.optional(v.number()),
    previousReminderId: v.optional(v.id('reminders')),
    source: v.optional(v.string()),
    operation: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })),
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_assignedTo', ['assignedTo'])
  .index('by_dueDate', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_created', ['createdAt']);

// ============================================================================
// Documents Table
// ============================================================================

/**
 * Documents table
 * File storage metadata with access control
 */
export const documentsTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field (using filename as primary identifier)
  title: v.optional(v.string()),
  filename: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: documentValidators.status,

  // Document-specific fields
  entityType: entityTypes.documentable,
  entityId: v.string(),
  documentType: documentValidators.type,

  // File Information
  originalFilename: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  fileUrl: v.string(),

  // Metadata
  description: v.optional(v.string()),

  // Access Control
  isPublic: v.boolean(),
  isConfidential: v.boolean(),
  uploadedBy: v.id('userProfiles'),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_documentType', ['documentType'])
  .index('by_uploadedBy', ['uploadedBy'])
  .index('by_public', ['isPublic'])
  .index('by_confidential', ['isConfidential'])
  .index('by_status', ['status'])
  .index('by_created', ['createdAt']);

// ============================================================================
// Scheduled Events Table
// ============================================================================

/**
 * Scheduled events table
 * Universal scheduling system with pluggable handlers for different content types
 * Supports both auto-processing (blog posts, social media) and manual tracking (meetings, events)
 */
export const scheduledEventsTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs (for calendar integrations)
  publicId: v.string(),

  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  status: scheduledEventValidators.status,

  // Basic info
  description: v.optional(v.string()),
  type: scheduledEventValidators.type,

  // Linked entity (what this event is for)
  entityType: entityTypes.all,
  entityId: v.string(),

  // Handler configuration (for modular system)
  handlerType: v.string(), // 'blog_post', 'social_media', 'event', etc.
  handlerData: v.optional(v.any()), // Handler-specific configuration/context
  autoProcess: v.boolean(), // Should this be auto-processed by cron?
  processingStatus: scheduledEventValidators.processingStatus,
  processedAt: v.optional(v.number()),
  processingError: v.optional(v.string()),
  processingRetryCount: v.optional(v.number()),

  // Time
  startTime: v.number(), // Timestamp
  endTime: v.number(), // Timestamp
  timezone: v.optional(v.string()), // IANA timezone
  allDay: v.boolean(),

  // Recurrence
  isRecurring: v.boolean(),
  recurrencePattern: v.optional(v.object({
    frequency: commonValidators.recurrenceFrequency,
    interval: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
    dayOfMonth: v.optional(v.number()),
    monthOfYear: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),
  parentEventId: v.optional(v.id('scheduledEvents')), // For recurring event instances

  // Participants (for calendar events)
  organizerId: v.id('userProfiles'),
  attendees: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
    email: v.optional(v.string()),
    status: scheduledEventValidators.attendeeStatus,
    responseAt: v.optional(v.number()),
  }))),

  // Location (for meetings/events)
  location: v.optional(v.object({
    type: scheduledEventValidators.locationType,
    address: v.optional(v.string()),
    roomNumber: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    instructions: v.optional(v.string()),
  })),

  // Status and visibility
  visibility: v.optional(scheduledEventValidators.visibility),
  priority: v.optional(scheduledEventValidators.priority),

  // Reminders
  reminders: v.optional(v.array(v.object({
    type: scheduledEventValidators.reminderType,
    minutesBefore: v.number(),
    sent: v.boolean(),
    sentAt: v.optional(v.number()),
  }))),

  // Additional info
  color: v.optional(v.string()), // Hex color for calendar display
  tags: v.optional(v.array(v.string())),
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }))),

  // Cancellation info
  cancelledBy: v.optional(v.id('userProfiles')),
  cancelledAt: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_handlerType', ['handlerType'])
  .index('by_autoProcess', ['autoProcess'])
  .index('by_processingStatus', ['processingStatus'])
  .index('by_startTime', ['startTime'])
  .index('by_endTime', ['endTime'])
  .index('by_organizer', ['organizerId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_created', ['createdAt'])
  .index('by_handler_autoProcess', ['handlerType', 'autoProcess']) // For cron processing
  .index('by_handler_status', ['handlerType', 'processingStatus']) // For filtering
  .index('by_startTime_status', ['startTime', 'status']); // For time-based queries

// ============================================================================
// Availability Preferences Table
// ============================================================================

/**
 * Availability preferences table
 * User availability settings for scheduling and calendar management
 */
export const availabilityPreferencesTable = defineTable({
  // Required: User reference (serves as ownerId)
  userId: v.id('userProfiles'),
  ownerId: v.id('userProfiles'), // Explicitly add ownerId for consistency

  // Timezone
  timezone: v.string(), // IANA timezone (e.g., 'America/New_York')

  // Working hours configuration
  workingHours: v.array(v.object({
    dayOfWeek: v.number(), // 0 = Sunday, 6 = Saturday
    startTime: v.string(), // HH:mm format (e.g., '09:00')
    endTime: v.string(), // HH:mm format (e.g., '17:00')
    isAvailable: v.boolean(),
  })),

  // Scheduling preferences
  bufferTime: v.optional(v.number()), // Minutes between appointments
  allowBackToBack: v.optional(v.boolean()), // Allow consecutive appointments
  autoAccept: v.optional(v.boolean()), // Auto-accept meeting invitations
  defaultEventDuration: v.optional(v.number()), // Default duration in minutes

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_user_id', ['userId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt']);
