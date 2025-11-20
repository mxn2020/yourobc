// convex/lib/boilerplate/supporting/index.ts

/**
 * Supporting Modules
 * Centralized export for all supporting functionality modules
 *
 * This file provides a single import point for all supporting modules including:
 * - Comments: Threaded discussions with mentions and reactions
 * - Documents: File attachments and document management
 * - Reminders: Task reminders with recurrence patterns
 * - Wiki: Knowledge base articles and guides
 *
 * Note: Notifications is a main feature, not a supporting feature.
 * It is located at convex/lib/boilerplate/notifications/
 *
 * @module convex/lib/boilerplate/supporting
 */

// ============================================================================
// COMMENTS MODULE
// ============================================================================
export {
  COMMENT_CONSTANTS,
  type Comment,
  type CommentId,
  type CreateCommentData,
  type UpdateCommentData,
  type CommentFilters,
  type CommentThread,
  getComments,
  getComment,
  getCommentsByEntity,
  getCommentThread,
  createComment,
  updateComment,
  addCommentReaction,
  removeCommentReaction,
  deleteComment,
  validateCreateCommentData,
  validateUpdateCommentData,
  buildCommentTree,
  flattenCommentTree,
  getMentionedUserIds,
  extractMentions,
} from './comments'

// ============================================================================
// DOCUMENTS MODULE
// ============================================================================
export {
  DOCUMENT_CONSTANTS,
  type Document,
  type DocumentId,
  type CreateDocumentData,
  type UpdateDocumentData,
  type DocumentFilters,
  getDocuments,
  getDocument,
  getDocumentsByEntity,
  getDocumentsByType,
  getRecentDocuments,
  createDocument,
  updateDocument,
  updateDocumentStatus,
  deleteDocument,
  validateCreateDocumentData,
  validateUpdateDocumentData,
  generateSystemFilename,
  getFileExtension,
  isValidFileType,
  formatFileSize,
  getMimeType,
  canUserAccessDocument,
  filterDocumentsByAccess,
  groupDocumentsByType,
} from './documents'

// ============================================================================
// REMINDERS MODULE
// ============================================================================
export {
  REMINDER_CONSTANTS,
  type Reminder,
  type ReminderId,
  type CreateReminderData,
  type UpdateReminderData,
  type ReminderFilters,
  getReminders,
  getReminder,
  getRemindersByEntity,
  getUpcomingReminders,
  getOverdueReminders,
  createReminder,
  updateReminder,
  completeReminder,
  snoozeReminder,
  cancelReminder,
  deleteReminder,
  validateCreateReminderData,
  validateUpdateReminderData,
  validateRecurrencePattern,
  isReminderOverdue,
  isReminderUpcoming,
  shouldCreateNextOccurrence,
  formatReminderDueDate,
  getReminderStatus,
  groupRemindersByStatus,
} from './reminders'

// ============================================================================
// WIKI MODULE
// ============================================================================
export {
  WIKI_CONSTANTS,
  type WikiEntry,
  type WikiEntryId,
  type CreateWikiEntryData,
  type UpdateWikiEntryData,
  type WikiEntryFilters,
  type WikiSearchResult,
  getWikiEntries,
  getWikiEntry,
  getWikiEntryBySlug,
  searchWiki,
  getWikiCategories,
  getPublishedWikiEntries,
  getPopularWikiEntries,
  createWikiEntry,
  updateWikiEntry,
  publishWikiEntry,
  archiveWikiEntry,
  incrementWikiEntryViews,
  deleteWikiEntry,
  validateCreateWikiEntryData,
  validateUpdateWikiEntryData,
  generateSlug,
  createSearchableContent,
  searchWikiEntries,
  extractPlainText,
  getExcerpt,
} from './wiki'

// ============================================================================
// SCHEDULING MODULE
// ============================================================================
export {
  SCHEDULING_CONSTANTS,
  type ScheduledEvent,
  type ScheduledEventId,
  type CreateScheduledEventData,
  type UpdateScheduledEventData,
  type ScheduledEventFilters,
  getEventsByEntity,
  getEvent,
  getEventsByHandler,
  getUserEvents,
  getUpcomingEvents,
  getTodayEvents,
  getEventsByDateRange,
  getEventsPendingProcessing,
  getFailedEvents,
  checkEventConflicts,
  createEvent,
  updateEvent,
  cancelEvent,
  completeEvent,
  deleteEvent,
  respondToEvent,
  processScheduledEvents,
  validateCreateEventData,
  validateUpdateEventData,
  isEventPast,
  isEventUpcoming,
  isEventToday,
  isEventOverdue,
  needsProcessing,
  canRetry,
  getEventDuration,
  eventsOverlap,
  getOverlapDuration,
  formatEventTimeRange,
  getPriorityValue,
  sortEventsByStartTime,
  sortEventsByPriority,
  groupEventsByDate,
  groupEventsByHandler,
  type SchedulingHandler,
  type HandlerRegistration,
  registerHandler,
  getHandler,
  getAllHandlers,
  getHandlerConfigs,
  isHandlerRegistered,
  getAutoProcessableHandlers,
  setHandlerEnabled,
  eventHandler,
  blogPostHandler,
} from './scheduling'

// ============================================================================
// MODULE METADATA
// ============================================================================

/**
 * Metadata about each supporting module
 */
export const SUPPORTING_MODULES = {
  COMMENTS: {
    name: 'Comments',
    description: 'Threaded discussions with mentions and reactions',
    icon: 'MessageSquare',
    route: '/supporting/comments',
    permissions: {
      view: 'comments.view',
      create: 'comments.create',
      edit: 'comments.edit',
      delete: 'comments.delete',
    },
  },
  DOCUMENTS: {
    name: 'Documents',
    description: 'File attachments and document management',
    icon: 'FileText',
    route: '/supporting/documents',
    permissions: {
      view: 'documents.view',
      upload: 'documents.upload',
      edit: 'documents.edit',
      delete: 'documents.delete',
    },
  },
  REMINDERS: {
    name: 'Reminders',
    description: 'Task reminders with recurrence patterns',
    icon: 'Bell',
    route: '/supporting/reminders',
    permissions: {
      view: 'reminders.view',
      create: 'reminders.create',
      edit: 'reminders.edit',
      delete: 'reminders.delete',
    },
  },
  WIKI: {
    name: 'Wiki',
    description: 'Knowledge base articles and guides',
    icon: 'Book',
    route: '/supporting/wiki',
    permissions: {
      view: 'wiki.view',
      create: 'wiki.create',
      edit: 'wiki.edit',
      publish: 'wiki.publish',
      delete: 'wiki.delete',
    },
  },
  SCHEDULING: {
    name: 'Scheduling',
    description: 'Event scheduling and calendar management',
    icon: 'Calendar',
    route: '/supporting/scheduling',
    permissions: {
      view: 'scheduling.view',
      create: 'scheduling.create',
      edit: 'scheduling.edit',
      delete: 'scheduling.delete',
    },
  },
} as const

/**
 * Get all supporting module names
 */
export function getSupportingModuleNames(): string[] {
  return Object.keys(SUPPORTING_MODULES)
}

/**
 * Get supporting module metadata by key
 */
export function getSupportingModuleMetadata(moduleKey: keyof typeof SUPPORTING_MODULES) {
  return SUPPORTING_MODULES[moduleKey]
}

/**
 * Check if a module key is valid
 */
export function isValidSupportingModule(moduleKey: string): moduleKey is keyof typeof SUPPORTING_MODULES {
  return moduleKey in SUPPORTING_MODULES
}
