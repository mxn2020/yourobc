// convex/schema/yourobc/supporting.ts
/**
 * YourOBC Supporting Schema
 *
 * Defines schemas for supporting entities including exchange rates, inquiry sources,
 * wiki entries, comments, reminders, documents, notifications, and counters.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/supporting
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
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
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'
import { entityTypes } from '../../lib/system/audit_logs/entityTypes'

// ============================================================================
// Exchange Rates Table
// ============================================================================

/**
 * Exchange rates table
 * Tracks daily exchange rates for currency conversion
 */
export const exchangeRatesTable = defineTable({
  fromCurrency: currencyValidator,
  toCurrency: currencyValidator,
  rate: v.number(),
  date: v.number(),
  source: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_currency_pair', ['fromCurrency', 'toCurrency'])
  .index('by_date', ['date'])
  .index('by_active', ['isActive'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Inquiry Sources Table
// ============================================================================

/**
 * Inquiry sources table
 * Tracks sources of customer inquiries (website, referral, partner, etc.)
 */
export const inquirySourcesTable = defineTable({
  name: v.string(),
  code: v.optional(v.string()),
  type: inquirySourceTypeValidator,
  description: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_active', ['isActive'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Wiki Entries Table
// ============================================================================

/**
 * Wiki entries table
 * Tracks knowledge base articles and procedures
 */
export const wikiEntriesTable = defineTable({
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  type: wikiEntryTypeValidator,
  isPublic: v.boolean(),
  status: wikiStatusValidator,
  viewCount: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),

  // Wiki-specific metadata (category is required for organization)
  category: v.string(),
  tags: v.array(v.string()),
  customFields: v.optional(v.object({})),

  // Audit and soft delete fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_public', ['isPublic'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Comments Table
// ============================================================================

/**
 * Comments table
 * Tracks comments and notes on entities with threading and reactions
 */
export const commentsTable = defineTable({
  entityType: entityTypes.commentable,
  entityId: v.string(),
  content: v.string(),
  type: v.optional(commentTypeValidator),
  isInternal: v.boolean(),

  // Reactions & Mentions
  mentions: v.optional(v.array(v.object({
    userId: v.string(),
    userName: v.string(),
  }))),
  reactions: v.optional(v.array(v.object({
    userId: v.string(),
    reaction: v.string(),
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

  // Replies & Threading
  parentCommentId: v.optional(v.id('yourobcComments')),
  replies: v.optional(v.array(v.any())), // Will be populated at query time
  replyCount: v.optional(v.number()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Followup Reminders Table
// ============================================================================

/**
 * Followup reminders table
 * Tracks reminders and tasks assigned to team members with recurrence support
 */
export const followupRemindersTable = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  type: reminderTypeValidator,
  entityType: entityTypes.all,
  entityId: v.string(),

  // Timeline
  dueDate: v.number(),
  reminderDate: v.optional(v.number()),
  priority: servicePriorityValidator,

  // Assignment
  assignedTo: v.string(),
  assignedBy: v.string(),

  // Status & Completion
  status: reminderStatusValidator,
  completedAt: v.optional(v.number()),
  completedBy: v.optional(v.string()),
  completionNotes: v.optional(v.string()),

  // Recurrence
  isRecurring: v.optional(v.boolean()),
  recurrencePattern: v.optional(v.object({
    frequency: recurrenceFrequencyValidator,
    interval: v.number(),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),

  // Snooze
  snoozeUntil: v.optional(v.number()),
  snoozeReason: v.optional(v.string()),
  snoozedBy: v.optional(v.string()),
  snoozedAt: v.optional(v.number()),

  // Notification
  emailReminder: v.boolean(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_assignedTo', ['assignedTo'])
  .index('by_dueDate', ['dueDate'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_status', ['status'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Documents Table
// ============================================================================

/**
 * Documents table
 * Tracks document storage and metadata with access control
 */
export const documentsTable = defineTable({
  entityType: entityTypes.documentable,
  entityId: v.string(),
  documentType: documentTypeValidator,

  // File Information
  filename: v.string(),
  originalFilename: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  fileUrl: v.string(),

  // Metadata
  title: v.optional(v.string()),
  description: v.optional(v.string()),

  // Access Control
  isPublic: v.boolean(),
  isConfidential: v.boolean(),
  status: documentStatusValidator,
  uploadedBy: v.string(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_documentType', ['documentType'])
  .index('by_uploadedBy', ['uploadedBy'])
  .index('by_public', ['isPublic'])
  .index('by_confidential', ['isConfidential'])
  .index('by_status', ['status'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// YourOBC Notifications Table
// ============================================================================

/**
 * YourOBC notifications table
 * Tracks in-app notifications for users with read status tracking
 */
export const notificationsTable = defineTable({
  userId: v.string(),
  type: notificationTypeValidator,
  title: v.string(),
  message: v.string(),
  entityType: entityTypes.notifiable,
  entityId: v.string(),
  priority: notificationPriorityValidator,
  isRead: v.boolean(),
  actionUrl: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_user', ['userId'])
  .index('by_user_read', ['userId', 'isRead'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Counters Table
// ============================================================================

/**
 * Counters table
 * Manages auto-increment counters for various entity types
 */
export const countersTable = defineTable({
  type: counterTypeValidator,
  prefix: v.string(), // e.g., 'QT', 'SH', 'INV'
  year: v.number(),
  lastNumber: v.number(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_type_year', ['type', 'year'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Supporting schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import all validators from base.ts (statusValidator, typeValidator, etc.)
 * - Import all reusable schemas from base.ts (auditFields, metadataSchema, softDeleteFields)
 * - Use spread operator for standard field groups (...auditFields, ...softDeleteFields)
 * - Add indexes for all frequently queried fields
 * - Include consistent indexes: by_created, by_deleted for all tables
 * - Use entityTypes.* constants for entity type validation
 * - Document table purposes and relationships in comments
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions from base.ts
 * - Forget to add by_deleted and by_created indexes
 * - Use inconsistent field names across tables
 * - Reference non-existent fields in indexes (e.g., isDeleted instead of deletedAt)
 *
 * SUPPORTING TABLES GUIDE:
 *
 * 1. Exchange Rates Table:
 *    - Tracks currency exchange rates for financial calculations
 *    - Indexed by currency pairs and date for efficient lookups
 *    - Use isActive flag to manage current vs historical rates
 *
 * 2. Inquiry Sources Table:
 *    - Manages customer acquisition channels
 *    - Used for marketing analytics and lead tracking
 *    - Link to customers via inquirySourceId
 *
 * 3. Wiki Entries Table:
 *    - Knowledge base and procedure documentation
 *    - Supports versioning through audit fields
 *    - Use status field to manage publication workflow
 *
 * 4. Comments Table:
 *    - Universal commenting system for all entities
 *    - Supports threading via parentCommentId
 *    - Includes reactions, mentions, and attachments
 *    - Use entityType + entityId to link to any entity
 *
 * 5. Followup Reminders Table:
 *    - Task and reminder management system
 *    - Supports recurring tasks via recurrencePattern
 *    - Includes snooze functionality for flexible scheduling
 *    - Link to entities via entityType + entityId
 *
 * 6. Documents Table:
 *    - File storage and metadata management
 *    - Access control via isPublic and isConfidential flags
 *    - Link to entities via entityType + entityId
 *    - Store actual files externally, keep metadata here
 *
 * 7. YourOBC Notifications Table:
 *    - In-app notification system
 *    - Track read/unread status per user
 *    - Link to source entities via entityType + entityId
 *
 * 8. Counters Table:
 *    - Auto-increment counter management
 *    - Supports year-based reset patterns
 *    - Use for generating entity reference numbers (QT-2024-001, etc.)
 *
 * QUERY PATTERNS:
 *
 * Comments by entity:
 *   db.query('yourobcComments')
 *     .withIndex('by_entity', q => q.eq('entityType', type).eq('entityId', id))
 *
 * Reminders by assignee:
 *   db.query('yourobcFollowupReminders')
 *     .withIndex('by_assignedTo', q => q.eq('assignedTo', userId))
 *     .filter(q => q.eq(q.field('status'), 'pending'))
 *
 * Unread notifications:
 *   db.query('yourobcNotifications')
 *     .withIndex('by_user_unread', q => q.eq('userId', userId).eq('isRead', false))
 *
 * Active exchange rates:
 *   db.query('yourobcExchangeRates')
 *     .withIndex('by_currency_pair', q =>
 *       q.eq('fromCurrency', 'USD').eq('toCurrency', 'EUR'))
 *     .filter(q => q.eq(q.field('isActive'), true))
 *
 * INTEGRATION EXAMPLES:
 *
 * In mutations - importing validators:
 *   import { reminderStatusValidator, servicePriorityValidator } from '../../schema/yourobc/base'
 *   export const updateReminder = mutation({
 *     args: {
 *       id: v.id('yourobcFollowupReminders'),
 *       status: v.optional(reminderStatusValidator),
 *       priority: v.optional(servicePriorityValidator),
 *     },
 *     handler: async (ctx, args) => { ... }
 *   })
 *
 * In queries - importing types:
 *   import type { ReminderStatus, ReminderType } from '../../schema/yourobc/base'
 *   export interface ReminderData {
 *     status: ReminderStatus
 *     type: ReminderType
 *   }
 */
