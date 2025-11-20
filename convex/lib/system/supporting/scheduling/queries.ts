// convex/lib/boilerplate/supporting/scheduling/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';
import type { ScheduledEventFilters } from './types';
import { isEventUpcoming, isEventToday, needsProcessing } from './utils';

/**
 * Get scheduled events by entity
 */
export const getEventsByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('scheduledEvents')
      .withIndex('by_entity', (q) =>
        q.eq('entityType', args.entityType).eq('entityId', args.entityId)
      );

    const events = await query.collect();

    // Filter out deleted unless requested
    if (!args.includeDeleted) {
      return events.filter((event) => !event.deletedAt);
    }

    return events;
  },
});

/**
 * Get single scheduled event
 */
export const getEvent = query({
  args: {
    eventId: v.id('scheduledEvents'),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event && !event.deletedAt ? event : null;
  },
});

/**
 * Get events by handler type
 */
export const getEventsByHandler = query({
  args: {
    handlerType: v.string(),
    autoProcessOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('scheduledEvents')
      .withIndex('by_handlerType', (q) => q.eq('handlerType', args.handlerType));

    let events = await query.collect();

    // Filter out deleted
    events = events.filter((event) => !event.deletedAt);

    // Filter auto-process only if requested
    if (args.autoProcessOnly) {
      events = events.filter((event) => event.autoProcess);
    }

    return events;
  },
});

/**
 * Get events for current user (as organizer or attendee)
 */
export const getUserEvents = query({
  args: {
    includeAttending: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Get events where user is organizer
    const organized = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_organizer', (q) => q.eq('organizerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    if (!args.includeAttending) {
      return organized;
    }

    // Get all events and filter for attendees
    const allEvents = await ctx.db
      .query('scheduledEvents')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const attending = allEvents.filter((event) =>
      event.attendees?.some((attendee) => attendee.userId === user._id)
    );

    // Combine and deduplicate
    const eventMap = new Map();
    [...organized, ...attending].forEach((event) => {
      eventMap.set(event._id, event);
    });

    return Array.from(eventMap.values());
  },
});

/**
 * Get upcoming events (next 7 days) for current user
 */
export const getUpcomingEvents = query({
  args: {
    handlerType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    let events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_startTime', (q) => q.gte('startTime', now))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter upcoming
    events = events.filter((event) => isEventUpcoming(event, now));

    // Filter by current user
    events = events.filter(
      (event) =>
        event.organizerId === user._id ||
        event.attendees?.some((a) => a.userId === user._id)
    );

    // Filter by handler if provided
    if (args.handlerType) {
      events = events.filter((event) => event.handlerType === args.handlerType);
    }

    return events;
  },
});

/**
 * Get today's events for current user
 */
export const getTodayEvents = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const events = await ctx.db
      .query('scheduledEvents')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    let todayEvents = events.filter((event) => isEventToday(event, now));

    // Filter by current user
    todayEvents = todayEvents.filter(
      (event) =>
        event.organizerId === user._id ||
        event.attendees?.some((a) => a.userId === user._id)
    );

    return todayEvents;
  },
});

/**
 * Get events in date range for current user
 */
export const getEventsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    handlerType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    let events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_startTime', (q) => q.gte('startTime', args.startDate))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by end date
    events = events.filter((event) => event.startTime <= args.endDate);

    // Filter by current user
    events = events.filter(
      (event) =>
        event.organizerId === user._id ||
        event.attendees?.some((a) => a.userId === user._id)
    );

    // Filter by handler if provided
    if (args.handlerType) {
      events = events.filter((event) => event.handlerType === args.handlerType);
    }

    return events;
  },
});

/**
 * Get events that need processing (for cron)
 */
export const getEventsPendingProcessing = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all pending events that should be processed
    const events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_processingStatus', (q) => q.eq('processingStatus', 'pending'))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter for auto-process events that are due
    return events.filter((event) => needsProcessing(event, now));
  },
});

/**
 * Get failed events that can be retried
 */
export const getFailedEvents = query({
  args: {
    handlerType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_processingStatus', (q) => q.eq('processingStatus', 'failed'))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter by handler if provided
    if (args.handlerType) {
      events = events.filter((event) => event.handlerType === args.handlerType);
    }

    return events;
  },
});

/**
 * Check for conflicts with existing events for current user
 */
export const checkEventConflicts = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    excludeEventId: v.optional(v.id('scheduledEvents')),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Get user's events in the time range
    const events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_organizer', (q) => q.eq('organizerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter for overlapping events
    const conflicts = events.filter((event) => {
      // Skip the event being updated
      if (args.excludeEventId && event._id === args.excludeEventId) {
        return false;
      }

      // Skip cancelled/completed events
      if (event.status === 'cancelled' || event.status === 'completed') {
        return false;
      }

      // Check for overlap
      return (
        (args.startTime >= event.startTime && args.startTime < event.endTime) ||
        (args.endTime > event.startTime && args.endTime <= event.endTime) ||
        (args.startTime <= event.startTime && args.endTime >= event.endTime)
      );
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  },
});

/**
 * Check if current user is available in a time range
 */
export const checkAvailability = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Check for conflicting events
    const events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_organizer', (q) => q.eq('organizerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Filter for overlapping events
    const conflicts = events.filter((event) => {
      // Skip cancelled/completed events
      if (event.status === 'cancelled' || event.status === 'completed') {
        return false;
      }

      // Check for overlap
      return (
        (args.startTime >= event.startTime && args.startTime < event.endTime) ||
        (args.endTime > event.startTime && args.endTime <= event.endTime) ||
        (args.startTime <= event.startTime && args.endTime >= event.endTime)
      );
    });

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: 'conflict' as const,
        conflicts,
      };
    }

    // Get user's availability preferences
    const preferences = await ctx.db
      .query('availabilityPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!preferences) {
      // No preferences set, assume available
      return {
        available: true,
        reason: 'no_preferences' as const,
      };
    }

    // Check working hours
    const startDate = new Date(args.startTime);
    const endDate = new Date(args.endTime);
    const dayOfWeek = startDate.getDay();

    const workingHoursForDay = preferences.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek
    );

    if (!workingHoursForDay || !workingHoursForDay.isAvailable) {
      return {
        available: false,
        reason: 'outside_working_hours' as const,
        workingHours: preferences.workingHours,
      };
    }

    // Parse time strings (HH:mm format)
    const [startHour, startMin] = workingHoursForDay.startTime.split(':').map(Number);
    const [endHour, endMin] = workingHoursForDay.endTime.split(':').map(Number);

    const workingStart = startHour * 60 + startMin;
    const workingEnd = endHour * 60 + endMin;

    const requestedStart = startDate.getHours() * 60 + startDate.getMinutes();
    const requestedEnd = endDate.getHours() * 60 + endDate.getMinutes();

    if (requestedStart < workingStart || requestedEnd > workingEnd) {
      return {
        available: false,
        reason: 'outside_working_hours' as const,
        workingHours: preferences.workingHours,
      };
    }

    return {
      available: true,
      reason: 'within_working_hours' as const,
    };
  },
});

/**
 * Get current user's availability preferences
 */
export const getAvailabilityPreferences = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const preferences = await ctx.db
      .query('availabilityPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    return preferences;
  },
});

/**
 * Find available time slots for current user
 */
export const findAvailableSlots = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    duration: v.number(), // Duration in minutes
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Get user's availability preferences
    const preferences = await ctx.db
      .query('availabilityPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.field('deletedAt') === undefined)
      .first();

    if (!preferences) {
      return {
        slots: [],
        message: 'No availability preferences set',
      };
    }

    // Get user's events in the date range
    const events = await ctx.db
      .query('scheduledEvents')
      .withIndex('by_organizer', (q) => q.eq('organizerId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const busySlots = events
      .filter((event) =>
        event.status !== 'cancelled' &&
        event.status !== 'completed' &&
        event.startTime >= args.startDate &&
        event.startTime <= args.endDate
      )
      .map((event) => ({
        start: event.startTime,
        end: event.endTime,
      }));

    // Generate available slots based on working hours
    const availableSlots: Array<{ start: number; end: number }> = [];
    const currentDate = new Date(args.startDate);
    const endDateTime = new Date(args.endDate);
    const bufferTime = preferences.bufferTime || 0;

    while (currentDate <= endDateTime) {
      const dayOfWeek = currentDate.getDay();
      const workingHoursForDay = preferences.workingHours.find(
        (wh) => wh.dayOfWeek === dayOfWeek
      );

      if (workingHoursForDay && workingHoursForDay.isAvailable) {
        const [startHour, startMin] = workingHoursForDay.startTime.split(':').map(Number);
        const [endHour, endMin] = workingHoursForDay.endTime.split(':').map(Number);

        let slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        // Generate slots for this day
        while (slotStart.getTime() + args.duration * 60 * 1000 <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + args.duration * 60 * 1000);

          // Check if slot overlaps with busy times
          const hasConflict = busySlots.some(
            (busy) =>
              (slotStart.getTime() >= busy.start && slotStart.getTime() < busy.end) ||
              (slotEnd.getTime() > busy.start && slotEnd.getTime() <= busy.end) ||
              (slotStart.getTime() <= busy.start && slotEnd.getTime() >= busy.end)
          );

          if (!hasConflict) {
            availableSlots.push({
              start: slotStart.getTime(),
              end: slotEnd.getTime(),
            });
          }

          // Move to next slot (with buffer time if not allowing back-to-back)
          const increment = preferences.allowBackToBack
            ? args.duration
            : args.duration + bufferTime;
          slotStart = new Date(slotStart.getTime() + increment * 60 * 1000);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return {
      slots: availableSlots,
      message: `Found ${availableSlots.length} available slots`,
    };
  },
});


/**
 * Get scheduled event by public ID
 */
export const getEventByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('scheduledEvents')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first();
  },
});
