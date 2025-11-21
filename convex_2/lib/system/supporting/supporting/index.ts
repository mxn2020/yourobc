// convex/lib/system/supporting/supporting/index.ts
// Public API exports for supporting module

// Constants
export {
  SUPPORTING_CONSTANTS,
  PRIORITY_WEIGHTS,
  EVENT_PRIORITY_WEIGHTS,
} from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateWikiEntryData,
  validateCommentData,
  validateReminderData,
  validateDocumentData,
  validateScheduledEventData,
  generateSlug,
  generateSearchableContent,
  isReminderOverdue,
  isEventPast,
  isEventCurrent,
  formatFileSize,
} from './utils';

// Permissions
export {
  canViewWikiEntry,
  canEditWikiEntry,
  canDeleteWikiEntry,
  canViewComment,
  canEditComment,
  canDeleteComment,
  canViewReminder,
  canEditReminder,
  canDeleteReminder,
  canViewDocument,
  canEditDocument,
  canDeleteDocument,
  canViewScheduledEvent,
  canEditScheduledEvent,
  canDeleteScheduledEvent,
  canViewAvailability,
  canEditAvailability,
  canDeleteAvailability,
  requireAccess,
} from './permissions';

// Queries
export {
  getWikiEntry,
  getWikiEntryByPublicId,
  listWikiEntries,
  getComment,
  listCommentsForEntity,
  getReminder,
  listUserReminders,
  getDocument,
  listDocumentsForEntity,
  getScheduledEvent,
  listUserScheduledEvents,
  getUserAvailability,
} from './queries';

// Mutations
export {
  createWikiEntry,
  updateWikiEntry,
  deleteWikiEntry,
  createComment,
  updateComment,
  deleteComment,
  createReminder,
  updateReminder,
  deleteReminder,
} from './mutations';
