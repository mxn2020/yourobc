// convex/lib/yourobc/trackingMessages/index.ts
// Public API exports for trackingMessages module

// Constants & Configuration
export { TRACKING_MESSAGES_CONSTANTS } from './constants';

// Types & Interfaces
export type * from './types';

// Utilities, Validation & Helpers
export {
  // Business logic
  formatTrackingMessageDisplayName,
  generateMessageId,
  isTrackingMessageEditable,
  isTrackingMessageRead,
  calculateDeliveryTime,
  // Validation & Trimming
  validateTrackingMessageData,
  trimTrackingMessageData,
  buildSearchableText,
} from './utils';

// Permissions
export {
  canViewTrackingMessage,
  canEditTrackingMessage,
  canDeleteTrackingMessage,
  requireViewTrackingMessageAccess,
  requireEditTrackingMessageAccess,
  requireDeleteTrackingMessageAccess,
  filterTrackingMessagesByAccess,
} from './permissions';

// Queries
export {
  getTrackingMessages,
  getTrackingMessage,
  getTrackingMessageByPublicId,
  getTrackingMessageByMessageId,
  getTrackingMessageStats,
} from './queries';

// Mutations
export {
  createTrackingMessage,
  updateTrackingMessage,
  deleteTrackingMessage,
  restoreTrackingMessage,
  markTrackingMessageAsRead,
} from './mutations';
