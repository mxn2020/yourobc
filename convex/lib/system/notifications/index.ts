// convex/lib/boilerplate/notifications/index.ts

/**
 * Notification Module Exports
 *
 * Export all queries, mutations, constants, types, and utilities for easy access
 */

// Export constants
export { NOTIFICATION_CONSTANTS } from './constants';

// Export types
export * from './types';

// Export utilities
export {
  validateCreateNotificationData,
  canReadNotification,
  canDeleteNotification,
  isAdmin,
} from './utils';

// Export all queries
export {
  getNotifications,
  getUnreadCount,
  getNotification,
} from './queries';

// Export all mutations
export {
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications,
} from './mutations';