// convex/lib/boilerplate/supporting/scheduling/utils.ts

import type { ScheduledEvent, CreateScheduledEventData, UpdateScheduledEventData } from './types';
import { SCHEDULING_CONSTANTS } from './constants';
import { getHandler } from './handlers/registry';

/**
 * Validate create event data
 */
export function validateCreateEventData(data: CreateScheduledEventData): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.entityType || !data.entityId) {
    errors.push('Entity type and ID are required');
  }

  if (!data.handlerType) {
    errors.push('Handler type is required');
  }

  if (!data.startTime || !data.endTime) {
    errors.push('Start time and end time are required');
  }

  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    errors.push('End time must be after start time');
  }

  if (!data.organizerId) {
    errors.push('Organizer ID is required');
  }

  // Validate handler exists
  const handler = getHandler(data.handlerType);
  if (!handler) {
    errors.push(`Unknown handler type: ${data.handlerType}`);
  }

  return errors;
}

/**
 * Validate update event data
 */
export function validateUpdateEventData(data: UpdateScheduledEventData): string[] {
  const errors: string[] = [];

  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    errors.push('End time must be after start time');
  }

  return errors;
}

/**
 * Check if event is in the past
 */
export function isEventPast(event: ScheduledEvent, now: number = Date.now()): boolean {
  return event.endTime < now;
}

/**
 * Check if event is upcoming (within next 7 days)
 */
export function isEventUpcoming(event: ScheduledEvent, now: number = Date.now()): boolean {
  return (
    event.startTime > now &&
    event.startTime <= now + SCHEDULING_CONSTANTS.UPCOMING_WINDOW_MS
  );
}

/**
 * Check if event is happening today
 */
export function isEventToday(event: ScheduledEvent, now: number = Date.now()): boolean {
  const eventDate = new Date(event.startTime);
  const todayDate = new Date(now);

  return (
    eventDate.getFullYear() === todayDate.getFullYear() &&
    eventDate.getMonth() === todayDate.getMonth() &&
    eventDate.getDate() === todayDate.getDate()
  );
}

/**
 * Check if event is overdue (scheduled but not processed)
 */
export function isEventOverdue(event: ScheduledEvent, now: number = Date.now()): boolean {
  return (
    event.autoProcess &&
    event.processingStatus === 'pending' &&
    event.startTime < now
  );
}

/**
 * Check if event needs processing
 */
export function needsProcessing(event: ScheduledEvent, now: number = Date.now()): boolean {
  return (
    event.autoProcess &&
    event.processingStatus === 'pending' &&
    event.startTime <= now &&
    event.status === 'scheduled'
  );
}

/**
 * Check if event can be retried
 */
export function canRetry(event: ScheduledEvent): boolean {
  return (
    event.processingStatus === 'failed' &&
    (event.processingRetryCount || 0) < SCHEDULING_CONSTANTS.MAX_RETRY_ATTEMPTS
  );
}

/**
 * Calculate event duration in milliseconds
 */
export function getEventDuration(event: ScheduledEvent): number {
  return event.endTime - event.startTime;
}

/**
 * Check if two events overlap
 */
export function eventsOverlap(event1: ScheduledEvent, event2: ScheduledEvent): boolean {
  return (
    (event1.startTime >= event2.startTime && event1.startTime < event2.endTime) ||
    (event1.endTime > event2.startTime && event1.endTime <= event2.endTime) ||
    (event1.startTime <= event2.startTime && event1.endTime >= event2.endTime)
  );
}

/**
 * Get overlap duration in milliseconds
 */
export function getOverlapDuration(event1: ScheduledEvent, event2: ScheduledEvent): number {
  if (!eventsOverlap(event1, event2)) return 0;

  const overlapStart = Math.max(event1.startTime, event2.startTime);
  const overlapEnd = Math.min(event1.endTime, event2.endTime);

  return overlapEnd - overlapStart;
}

/**
 * Format event time range
 */
export function formatEventTimeRange(event: ScheduledEvent): string {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  if (event.allDay) {
    return `All day - ${startDate.toLocaleDateString()}`;
  }

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (isSameDay) {
    return `${startDate.toLocaleString()} - ${endDate.toLocaleTimeString()}`;
  }

  return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
}

/**
 * Get priority value for sorting
 */
export function getPriorityValue(priority?: ScheduledEvent['priority']): number {
  if (!priority) return 0;
  return SCHEDULING_CONSTANTS.PRIORITY[priority].value;
}

/**
 * Sort events by start time
 */
export function sortEventsByStartTime(events: ScheduledEvent[], ascending: boolean = true): ScheduledEvent[] {
  return [...events].sort((a, b) => {
    const diff = a.startTime - b.startTime;
    return ascending ? diff : -diff;
  });
}

/**
 * Sort events by priority
 */
export function sortEventsByPriority(events: ScheduledEvent[], ascending: boolean = false): ScheduledEvent[] {
  return [...events].sort((a, b) => {
    const diff = getPriorityValue(a.priority) - getPriorityValue(b.priority);
    return ascending ? diff : -diff;
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: ScheduledEvent[]): Map<string, ScheduledEvent[]> {
  const grouped = new Map<string, ScheduledEvent[]>();

  for (const event of events) {
    const date = new Date(event.startTime).toLocaleDateString();
    const existing = grouped.get(date) || [];
    existing.push(event);
    grouped.set(date, existing);
  }

  return grouped;
}

/**
 * Group events by handler type
 */
export function groupEventsByHandler(events: ScheduledEvent[]): Map<string, ScheduledEvent[]> {
  const grouped = new Map<string, ScheduledEvent[]>();

  for (const event of events) {
    const existing = grouped.get(event.handlerType) || [];
    existing.push(event);
    grouped.set(event.handlerType, existing);
  }

  return grouped;
}

