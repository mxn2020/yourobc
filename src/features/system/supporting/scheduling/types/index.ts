// src/features/boilerplate/supporting/scheduling/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel';

/**
 * Re-export backend types for scheduling
 */
export type ScheduledEvent = Doc<'scheduledEvents'>;
export type AvailabilityPreference = Doc<'availabilityPreferences'>;

/**
 * Availability slot for scheduling
 */
export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format (e.g., "17:00")
  isAvailable: boolean;
}

/**
 * Data required to create a scheduled event
 */
export interface CreateScheduledEventData {
  title: string;
  description?: string;
  type: ScheduledEvent['type'];
  entityType: string;
  entityId: string;

  // Handler configuration (NEW)
  handlerType: string; // Required: specifies which handler processes this
  handlerData?: Record<string, unknown>; // Optional: handler-specific data
  autoProcess?: boolean; // Optional: defaults based on handler config

  startTime: number;
  endTime: number;
  timezone?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: ScheduledEvent['recurrencePattern'];
  organizerId: Id<"userProfiles">;
  attendees?: Array<{
    userId: Id<"userProfiles">;
    userName: string;
    email?: string;
  }>;
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
 * Data required to update a scheduled event
 */
export interface UpdateScheduledEventData {
  title?: string;
  description?: string;
  type?: ScheduledEvent['type'];

  // Handler configuration (NEW)
  handlerData?: Record<string, unknown>;
  processingStatus?: ScheduledEvent['processingStatus'];

  startTime?: number;
  endTime?: number;
  timezone?: string;
  allDay?: boolean;
  attendees?: Array<{
    userId: Id<"userProfiles">;
    userName: string;
    email?: string;
  }>;
  location?: ScheduledEvent['location'];
  visibility?: ScheduledEvent['visibility'];
  priority?: ScheduledEvent['priority'];
  status?: ScheduledEvent['status'];
  reminders?: Array<{
    type: 'email' | 'notification' | 'sms';
    minutesBefore: number;
  }>;
  color?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * RSVP response for event attendance
 */
export interface RSVPData {
  status: 'accepted' | 'declined' | 'tentative';
  message?: string;
}

/**
 * Time slot for availability checking
 */
export interface TimeSlot {
  startTime: number;
  endTime: number;
  available: boolean;
  conflictingEvents?: Array<{
    eventId: Id<'scheduledEvents'>;
    title: string;
  }>;
}

/**
 * Filter options for querying events
 */
export interface ScheduledEventFilters {
  entityType?: string;
  entityId?: string;
  type?: ScheduledEvent['type'];
  status?: ScheduledEvent['status'];
  priority?: ScheduledEvent['priority'];
  organizerId?: string;
  attendeeId?: string;
  startDate?: number; // Filter events after this date
  endDate?: number; // Filter events before this date
  tags?: string[];
  searchQuery?: string;
}

/**
 * Calendar view configuration
 */
export interface CalendarView {
  mode: 'day' | 'week' | 'month' | 'agenda';
  currentDate: Date;
  timezone: string;
}

/**
 * Conflict detection result
 */
export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: Array<{
    event: ScheduledEvent;
    overlapMinutes: number;
  }>;
}
