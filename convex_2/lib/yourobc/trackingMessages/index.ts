// convex/lib/yourobc/trackingMessages/index.ts
// Public API exports for trackingMessages module

// Constants
export { TRACKING_MESSAGES_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateTrackingMessageData,
  formatTrackingMessageDisplayName,
  generateMessageId,
  isTrackingMessageEditable,
  isTrackingMessageRead,
  calculateDeliveryTime,
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
