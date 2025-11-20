// src/features/system/supporting/scheduling/services/SchedulingService.ts

import type {
  ScheduledEvent,
  CreateScheduledEventData,
  UpdateScheduledEventData,
  TimeSlot,
  ConflictCheck,
  AvailabilitySlot,
} from '../types';
import { MAX_CONTENT_LENGTH } from '../../shared/constants';
import type { Id } from '@/convex/_generated/dataModel';

export class SchedulingService {
  /**
   * Validate event data before creation
   */
  static validateEventData(data: Partial<CreateScheduledEventData>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Event title is required');
    } else if (data.title.length > MAX_CONTENT_LENGTH.SHORT_TEXT) {
      errors.push(`Title must be less than ${MAX_CONTENT_LENGTH.SHORT_TEXT} characters`);
    }

    if (data.description && data.description.length > MAX_CONTENT_LENGTH.MEDIUM_TEXT) {
      errors.push(`Description must be less than ${MAX_CONTENT_LENGTH.MEDIUM_TEXT} characters`);
    }

    if (!data.startTime) {
      errors.push('Start time is required');
    }

    if (!data.endTime) {
      errors.push('End time is required');
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.push('End time must be after start time');
    }

    if (data.startTime && data.startTime < Date.now() - 24 * 60 * 60 * 1000) {
      errors.push('Start time cannot be more than 24 hours in the past');
    }

    if (!data.entityType) {
      errors.push('Entity type is required');
    }

    if (!data.entityId) {
      errors.push('Entity ID is required');
    }

    if (!data.organizerId) {
      errors.push('Organizer is required');
    }

    return errors;
  }

  /**
   * Check if an event is happening now
   */
  static isEventNow(event: ScheduledEvent): boolean {
    const now = Date.now();
    return event.status === 'scheduled' && event.startTime <= now && event.endTime >= now;
  }

  /**
   * Check if an event is upcoming (within next hour)
   */
  static isEventUpcoming(event: ScheduledEvent, minutesAhead = 60): boolean {
    const now = Date.now();
    const threshold = now + minutesAhead * 60 * 1000;
    return event.status === 'scheduled' && event.startTime > now && event.startTime <= threshold;
  }

  /**
   * Check if an event is past
   */
  static isEventPast(event: ScheduledEvent): boolean {
    return event.endTime < Date.now();
  }

  /**
   * Check if an event is today
   */
  static isEventToday(event: ScheduledEvent): boolean {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    return now.toDateString() === eventStart.toDateString();
  }

  /**
   * Calculate event duration in minutes
   */
  static getEventDuration(event: ScheduledEvent): number {
    return Math.floor((event.endTime - event.startTime) / (60 * 1000));
  }

  /**
   * Format event duration for display
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Get event type label
   */
  static getTypeLabel(type: ScheduledEvent['type']): string {
    const labels = {
      meeting: 'Meeting',
      appointment: 'Appointment',
      event: 'Event',
      task: 'Task',
      reminder: 'Reminder',
      block: 'Time Block',
      other: 'Other',
    };
    return labels[type];
  }

  /**
   * Get event type icon
   */
  static getTypeIcon(type: ScheduledEvent['type']): string {
    const icons = {
      meeting: '👥',
      appointment: '📅',
      event: '🎉',
      task: '✓',
      reminder: '🔔',
      block: '🚫',
      other: '📌',
    };
    return icons[type];
  }

  /**
   * Get status badge variant
   */
  static getStatusBadgeVariant(status: ScheduledEvent['status']): 'primary' | 'secondary' | 'destructive' | 'outline' {
    const variants = {
      scheduled: 'primary' as const,
      confirmed: 'secondary' as const,
      cancelled: 'destructive' as const,
      completed: 'outline' as const,
      no_show: 'destructive' as const,
    };
    return variants[status];
  }

  /**
   * Get priority color
   */
  static getPriorityColor(priority: ScheduledEvent['priority']): string {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority ?? 'medium'];
  }

  /**
   * Check for time conflicts between events
   */
  static checkConflict(event1: ScheduledEvent, event2: ScheduledEvent): boolean {
    return !(event1.endTime <= event2.startTime || event1.startTime >= event2.endTime);
  }

  /**
   * Calculate overlap in minutes
   */
  static calculateOverlap(event1: ScheduledEvent, event2: ScheduledEvent): number {
    const overlapStart = Math.max(event1.startTime, event2.startTime);
    const overlapEnd = Math.min(event1.endTime, event2.endTime);
    return overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / (60 * 1000)) : 0;
  }

  /**
   * Check conflicts for a new event against existing events
   */
  static checkConflicts(newEvent: { startTime: number; endTime: number }, existingEvents: ScheduledEvent[]): ConflictCheck {
    const conflicts = existingEvents
      .filter((event) => event.status !== 'cancelled')
      .map((event) => {
        const hasConflict = !(newEvent.endTime <= event.startTime || newEvent.startTime >= event.endTime);
        if (!hasConflict) return null;

        const overlapMinutes = this.calculateOverlapMinutes(newEvent.startTime, newEvent.endTime, event.startTime, event.endTime);
        return { event, overlapMinutes };
      })
      .filter((c): c is { event: ScheduledEvent; overlapMinutes: number } => c !== null);

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Calculate overlap in minutes between two time ranges
   */
  static calculateOverlapMinutes(start1: number, end1: number, start2: number, end2: number): number {
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    return overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / (60 * 1000)) : 0;
  }

  /**
   * Find available time slots
   */
  static findAvailableSlots(
    existingEvents: ScheduledEvent[],
    startDate: number,
    endDate: number,
    slotDuration: number, // in minutes
    bufferTime = 0 // in minutes
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const slotMs = slotDuration * 60 * 1000;
    const bufferMs = bufferTime * 60 * 1000;

    let currentTime = startDate;

    while (currentTime + slotMs <= endDate) {
      const slotEnd = currentTime + slotMs;

      // Check if this slot conflicts with any existing events
      const conflicts = existingEvents.filter((event) =>
        event.status !== 'cancelled' &&
        !(slotEnd + bufferMs <= event.startTime || currentTime >= event.endTime + bufferMs)
      );

      slots.push({
        startTime: currentTime,
        endTime: slotEnd,
        available: conflicts.length === 0,
        conflictingEvents: conflicts.map((e) => ({
          eventId: e._id,
          title: e.title,
        })),
      });

      currentTime += slotMs;
    }

    return slots;
  }

  /**
   * Filter events by date range
   */
  static filterEventsByDateRange(events: ScheduledEvent[], startDate: number, endDate: number): ScheduledEvent[] {
    return events.filter((event) => event.startTime < endDate && event.endTime > startDate);
  }

  /**
   * Filter events by type
   */
  static filterEventsByType(events: ScheduledEvent[], types: Array<ScheduledEvent['type']>): ScheduledEvent[] {
    return events.filter((event) => types.includes(event.type));
  }

  /**
   * Filter events by status
   */
  static filterEventsByStatus(events: ScheduledEvent[], statuses: Array<ScheduledEvent['status']>): ScheduledEvent[] {
    return events.filter((event) => statuses.includes(event.status));
  }

  /**
   * Sort events by start time
   */
  static sortEventsByTime(events: ScheduledEvent[], ascending = true): ScheduledEvent[] {
    return [...events].sort((a, b) => {
      const diff = a.startTime - b.startTime;
      return ascending ? diff : -diff;
    });
  }

  /**
   * Group events by date
   */
  static groupEventsByDate(events: ScheduledEvent[]): Record<string, ScheduledEvent[]> {
    const grouped: Record<string, ScheduledEvent[]> = {};

    events.forEach((event) => {
      const date = new Date(event.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return grouped;
  }

  /**
   * Get event statistics
   */
  static getEventsStats(events: ScheduledEvent[]): {
    total: number;
    upcoming: number;
    past: number;
    today: number;
    cancelled: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalDuration: number;
  } {
    const stats = {
      total: events.length,
      upcoming: 0,
      past: 0,
      today: 0,
      cancelled: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalDuration: 0,
    };

    events.forEach((event) => {
      if (this.isEventToday(event)) stats.today++;
      if (this.isEventPast(event)) stats.past++;
      if (!this.isEventPast(event) && event.status !== 'cancelled') stats.upcoming++;
      if (event.status === 'cancelled') stats.cancelled++;

      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
      stats.totalDuration += this.getEventDuration(event);
    });

    return stats;
  }

  /**
   * Format time range for display
   */
  static formatTimeRange(startTime: number, endTime: number, allDay = false): string {
    if (allDay) {
      return 'All day';
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${startStr} - ${endStr}`;
  }

  /**
   * Check if user is event organizer
   */
  static isOrganizer(event: ScheduledEvent, userId: Id<"userProfiles">): boolean {
    return event.organizerId === userId;
  }

  /**
   * Check if user is event attendee
   */
  static isAttendee(event: ScheduledEvent, userId: Id<"userProfiles">): boolean {
    return event.attendees?.some((a) => a.userId === userId) ?? false;
  }

  /**
   * Get attendee response status
   */
  static getAttendeeStatus(event: ScheduledEvent, userId: Id<"userProfiles">): 'pending' | 'accepted' | 'declined' | 'tentative' | 'not_invited' {
    const attendee = event.attendees?.find((a) => a.userId === userId);
    return attendee?.status || 'not_invited';
  }

  /**
   * Count accepted attendees
   */
  static countAcceptedAttendees(event: ScheduledEvent): number {
    return event.attendees?.filter((a) => a.status === 'accepted').length || 0;
  }

  /**
   * Generate next occurrence for recurring event
   */
  static getNextOccurrence(event: ScheduledEvent): number | null {
    if (!event.isRecurring || !event.recurrencePattern) return null;

    const { frequency, interval, endDate, maxOccurrences } = event.recurrencePattern;
    const duration = event.endTime - event.startTime;
    let nextStart = event.startTime;

    switch (frequency) {
      case 'daily':
        nextStart = event.startTime + interval * 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        nextStart = event.startTime + interval * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        const date = new Date(event.startTime);
        date.setMonth(date.getMonth() + interval);
        nextStart = date.getTime();
        break;
      case 'yearly':
        const yearDate = new Date(event.startTime);
        yearDate.setFullYear(yearDate.getFullYear() + interval);
        nextStart = yearDate.getTime();
        break;
    }

    if (endDate && nextStart > endDate) return null;
    if (maxOccurrences) {
      // Would need to track occurrence count in the event
    }

    return nextStart;
  }
}
