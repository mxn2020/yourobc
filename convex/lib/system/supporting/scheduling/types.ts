// convex/lib/boilerplate/supporting/scheduling/types.ts

import type { Doc, Id } from '@/generated/dataModel';

/**
 * Scheduled Event Type
 */
export type ScheduledEvent = Doc<'scheduledEvents'>;
export type ScheduledEventId = Id<'scheduledEvents'>;

/**
 * Create Scheduled Event Data
 */
export interface CreateScheduledEventData {
  title: string;
  description?: string;
  type: ScheduledEvent['type'];
  entityType: string;
  entityId: string;

  // Handler configuration
  handlerType: string;
  handlerData?: Record<string, unknown>;
  autoProcess?: boolean; // Will default based on handler config if not provided

  startTime: number;
  endTime: number;
  timezone?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: ScheduledEvent['recurrencePattern'];
  organizerId: Id<'userProfiles'>;
  attendees?: ScheduledEvent['attendees'];
  location?: ScheduledEvent['location'];
  visibility?: ScheduledEvent['visibility'];
  priority?: ScheduledEvent['priority'];
  reminders?: Array<{
    type: 'email' | 'notification' | 'sms';
    minutesBefore: number;
  }>;
  color?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Update Scheduled Event Data
 */
export interface UpdateScheduledEventData {
  title?: string;
  description?: string;
  type?: ScheduledEvent['type'];
  handlerData?: Record<string, unknown>;
  processingStatus?: ScheduledEvent['processingStatus'];
  startTime?: number;
  endTime?: number;
  timezone?: string;
  allDay?: boolean;
  attendees?: ScheduledEvent['attendees'];
  location?: ScheduledEvent['location'];
  visibility?: ScheduledEvent['visibility'];
  priority?: ScheduledEvent['priority'];
  status?: ScheduledEvent['status'];
  reminders?: ScheduledEvent['reminders'];
  color?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Scheduled Event Filters
 */
export interface ScheduledEventFilters {
  entityType?: string;
  entityId?: string;
  handlerType?: string;
  type?: ScheduledEvent['type'];
  status?: ScheduledEvent['status'];
  processingStatus?: ScheduledEvent['processingStatus'];
  priority?: ScheduledEvent['priority'];
  organizerId?: string;
  attendeeId?: string;
  autoProcess?: boolean;
  startDate?: number;
  endDate?: number;
  tags?: string[];
}
