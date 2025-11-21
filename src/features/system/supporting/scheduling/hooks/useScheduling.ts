// src/features/system/supporting/scheduling/hooks/useScheduling.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/generated/api';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Get scheduled events for a specific entity
 */
export function useEntityEvents(entityType: string, entityId: string) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getEventsByEntity,
    { entityType, entityId }
  );
}

/**
 * Get a single scheduled event
 */
export function useScheduledEvent(eventId?: Id<'scheduledEvents'>) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getEvent,
    eventId ? { eventId } : 'skip'
  );
}

/**
 * Get user's scheduled events (as organizer or attendee)
 */
export function useUserEvents(includeAttending?: boolean) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getUserEvents,
    { includeAttending }
  );
}

/**
 * Get events in a date range
 */
export function useEventsInRange(
  startDate: number,
  endDate: number,
  handlerType?: string
) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getEventsByDateRange,
    { startDate, endDate, handlerType }
  );
}

/**
 * Get upcoming events for a user
 */
export function useUpcomingEvents(handlerType?: string) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getUpcomingEvents,
    { handlerType }
  );
}

/**
 * Get today's events for a user
 */
export function useTodayEvents() {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getTodayEvents,
    {}
  );
}

/**
 * Check availability for a time slot
 */
export function useCheckAvailability(
  startTime: number,
  endTime: number
) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.checkAvailability,
    { startTime, endTime }
  );
}

/**
 * Get user's availability preferences
 */
export function useAvailabilityPreferences() {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.getAvailabilityPreferences,
    {}
  );
}

/**
 * Find available time slots
 */
export function useFindAvailableSlots(
  startDate: number,
  endDate: number,
  duration: number
) {
  return useQuery(
    api.lib.system.supporting.scheduling.queries.findAvailableSlots,
    { startDate, endDate, duration }
  );
}

/**
 * Create a new scheduled event
 */
export function useCreateEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.createEvent);
}

/**
 * Update an existing event
 */
export function useUpdateEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.updateEvent);
}

/**
 * Cancel an event
 */
export function useCancelEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.cancelEvent);
}

/**
 * Delete an event
 */
export function useDeleteEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.deleteEvent);
}

/**
 * RSVP to an event
 */
export function useRespondToEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.respondToEvent);
}

/**
 * Reschedule an event
 */
export function useRescheduleEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.rescheduleEvent);
}

/**
 * Mark event as completed
 */
export function useCompleteEvent() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.completeEvent);
}

/**
 * Update availability preferences
 */
export function useUpdateAvailabilityPreferences() {
  return useMutation(api.lib.system.supporting.scheduling.mutations.updateAvailabilityPreferences);
}
