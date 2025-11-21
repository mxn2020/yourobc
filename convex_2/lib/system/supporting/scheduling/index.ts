// convex/lib/system/supporting/scheduling/index.ts

/**
 * Scheduling Module
 * Universal scheduling system with pluggable handlers for different content types
 *
 * This module provides:
 * - Modular handler-based architecture
 * - Support for auto-processing (blog posts, social media) and manual tracking (meetings, events)
 * - Recurring events
 * - Conflict detection
 * - RSVP functionality
 * - Priority and visibility management
 *
 * @module convex/lib/system/supporting/scheduling
 */

// Types
export type {
  ScheduledEvent,
  ScheduledEventId,
  CreateScheduledEventData,
  UpdateScheduledEventData,
  ScheduledEventFilters,
} from './types';

// Constants
export { SCHEDULING_CONSTANTS } from './constants';

// Utils
export {
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
} from './utils';

// Queries
export {
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
} from './queries';

// Mutations
export {
  createEvent,
  updateEvent,
  cancelEvent,
  completeEvent,
  deleteEvent,
  respondToEvent,
  processScheduledEvents,
} from './mutations';

// Handlers
export type { SchedulingHandler, HandlerRegistration } from './handlers/types';
export {
  registerHandler,
  getHandler,
  getAllHandlers,
  getHandlerConfigs,
  isHandlerRegistered,
  getAutoProcessableHandlers,
  setHandlerEnabled,
  eventHandler,
  blogPostHandler,
} from './handlers';
