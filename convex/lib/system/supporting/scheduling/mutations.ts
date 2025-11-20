// convex/lib/boilerplate/supporting/scheduling/mutations.ts

import { v } from 'convex/values';
import { mutation, internalMutation } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type { CreateScheduledEventData, UpdateScheduledEventData } from './types';
import { validateCreateEventData, validateUpdateEventData } from './utils';
import { getHandler } from './handlers/registry';
import { SCHEDULING_CONSTANTS } from './constants';
import { calculateNextOccurrence } from '../shared';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create a scheduled event
 */
export const createEvent = mutation({
  args: {
    
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      type: v.union(
        v.literal('meeting'),
        v.literal('appointment'),
        v.literal('event'),
        v.literal('task'),
        v.literal('reminder'),
        v.literal('block'),
        v.literal('other')
      ),
      entityType: v.string(),
      entityId: v.string(),
      handlerType: v.string(),
      handlerData: v.optional(v.any()),
      autoProcess: v.optional(v.boolean()),
      startTime: v.number(),
      endTime: v.number(),
      timezone: v.optional(v.string()),
      allDay: v.optional(v.boolean()),
      isRecurring: v.optional(v.boolean()),
      recurrencePattern: v.optional(v.any()),
      organizerId: v.id('userProfiles'),
      attendees: v.optional(v.any()),
      location: v.optional(v.any()),
      visibility: v.optional(v.union(v.literal('public'), v.literal('private'), v.literal('internal'))),
      priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
      reminders: v.optional(v.any()),
      color: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const data = args.data as CreateScheduledEventData;

    // Validate
    const errors = validateCreateEventData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    // Get handler to determine autoProcess default
    const handler = getHandler(data.handlerType);
    if (!handler) {
      throw new Error(`Handler not found: ${data.handlerType}`);
    }

    // Validate handler-specific data if handler has validator
    if (handler.validateHandlerData && data.handlerData) {
      const isValid = await handler.validateHandlerData(data.handlerData);
      if (!isValid) {
        throw new Error('Invalid handler data');
      }
    }

    const autoProcess = data.autoProcess !== undefined ? data.autoProcess : handler.autoProcess;
    const publicId = await generateUniquePublicId(ctx, 'scheduledEvents');

    // Create the event
    const eventId = await ctx.db.insert('scheduledEvents', {
      publicId,
      title: data.title,
      description: data.description,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      handlerType: data.handlerType,
      handlerData: data.handlerData,
      autoProcess,
      processingStatus: 'pending',
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone,
      allDay: data.allDay || false,
      isRecurring: data.isRecurring || false,
      recurrencePattern: data.recurrencePattern,
      organizerId: data.organizerId,
      attendees: data.attendees?.map((a) => ({ ...a, status: 'pending', sent: false })),
      location: data.location,
      status: 'scheduled',
      visibility: data.visibility || 'internal',
      priority: data.priority || 'medium',
      reminders: data.reminders?.map((r) => ({ ...r, sent: false })),
      color: data.color,
      tags: data.tags,
      metadata: data.metadata,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return eventId;
  },
});

/**
 * Update a scheduled event
 */
export const updateEvent = mutation({
  args: {
    
    eventId: v.id('scheduledEvents'),
    data: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(v.union(
        v.literal('meeting'),
        v.literal('appointment'),
        v.literal('event'),
        v.literal('task'),
        v.literal('reminder'),
        v.literal('block'),
        v.literal('other')
      )),
      handlerData: v.optional(v.any()),
      processingStatus: v.optional(v.union(
        v.literal('pending'),
        v.literal('processing'),
        v.literal('completed'),
        v.literal('failed'),
        v.literal('cancelled')
      )),
      startTime: v.optional(v.number()),
      endTime: v.optional(v.number()),
      timezone: v.optional(v.string()),
      allDay: v.optional(v.boolean()),
      attendees: v.optional(v.any()),
      location: v.optional(v.any()),
      visibility: v.optional(v.union(v.literal('public'), v.literal('private'), v.literal('internal'))),
      priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
      status: v.optional(v.union(
        v.literal('scheduled'),
        v.literal('confirmed'),
        v.literal('cancelled'),
        v.literal('completed'),
        v.literal('no_show')
      )),
      reminders: v.optional(v.any()),
      color: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.deletedAt) {
      throw new Error('Cannot update deleted event');
    }

    const data = args.data as UpdateScheduledEventData;

    // Validate
    const errors = validateUpdateEventData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    // Update the event
    await ctx.db.patch(args.eventId, {
      ...data,
      updatedBy: user._id,
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Cancel a scheduled event
 */
export const cancelEvent = mutation({
  args: {
    
    eventId: v.id('scheduledEvents'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.deletedAt) {
      throw new Error('Cannot cancel deleted event');
    }

    await ctx.db.patch(args.eventId, {
      status: 'cancelled',
      processingStatus: 'cancelled',
      cancelledBy: user._id,
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
      updatedBy: user._id,
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Mark event as completed
 */
export const completeEvent = mutation({
  args: {
    
    eventId: v.id('scheduledEvents'),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.deletedAt) {
      throw new Error('Cannot complete deleted event');
    }

    // Get the handler to call its process method
    const handler = getHandler(event.handlerType);
    if (!handler) {
      throw new Error(`Handler not found: ${event.handlerType}`);
    }

    try {
      // Call handler's processScheduled method
      const success = await handler.processScheduled(ctx, args.eventId);

      if (success) {
        // Handler already updated the event, just return
        return args.eventId;
      } else {
        throw new Error('Handler processing failed');
      }
    } catch (error) {
      // Update event with error
      await ctx.db.patch(args.eventId, {
        processingStatus: 'failed',
        processingError: error instanceof Error ? error.message : 'Unknown error',
        processingRetryCount: (event.processingRetryCount || 0) + 1,
        updatedBy: user._id,
        updatedAt: Date.now(),
      });

      throw error;
    }
  },
});

/**
 * Delete a scheduled event (soft delete)
 */
export const deleteEvent = mutation({
  args: {
    
    eventId: v.id('scheduledEvents'),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await ctx.db.patch(args.eventId, {
      deletedAt: Date.now(),
      deletedBy: user._id,
    });

    return args.eventId;
  },
});

/**
 * RSVP to an event
 */
export const respondToEvent = mutation({
  args: {
    eventId: v.id('scheduledEvents'),
    status: v.union(v.literal('accepted'), v.literal('declined'), v.literal('tentative')),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.attendees) {
      throw new Error('Event has no attendees');
    }

    // Find the attendee
    const attendeeIndex = event.attendees.findIndex((a) => a.userId === user._id);
    if (attendeeIndex === -1) {
      throw new Error('User is not an attendee');
    }

    // Update attendee status
    const updatedAttendees = [...event.attendees];
    updatedAttendees[attendeeIndex] = {
      ...updatedAttendees[attendeeIndex],
      status: args.status,
      responseAt: Date.now(),
    };

    await ctx.db.patch(args.eventId, {
      attendees: updatedAttendees,
      updatedAt: Date.now(),
    });

    return args.eventId;
  },
});

/**
 * Process scheduled events (called by cron)
 * This is an internal mutation that processes all pending events
 */
export const processScheduledEvents = internalMutation({
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
    const dueEvents = events.filter(
      (event) =>
        event.autoProcess &&
        event.startTime <= now &&
        event.status === 'scheduled'
    );

    const results = {
      total: dueEvents.length,
      succeeded: 0,
      failed: 0,
    };

    // Process each event
    for (const event of dueEvents) {
      try {
        // Mark as processing
        await ctx.db.patch(event._id, {
          processingStatus: 'processing',
        });

        // Get the handler
        const handler = getHandler(event.handlerType);
        if (!handler) {
          throw new Error(`Handler not found: ${event.handlerType}`);
        }

        // Call beforeProcess if exists
        if (handler.beforeProcess) {
          await handler.beforeProcess(ctx, event._id);
        }

        // Process the event
        const success = await handler.processScheduled(ctx, event._id);

        if (success) {
          results.succeeded++;

          // Call afterProcess if exists
          if (handler.afterProcess) {
            await handler.afterProcess(ctx, event._id);
          }

          // Create next occurrence if recurring
          if (event.isRecurring && event.recurrencePattern) {
            const nextOccurrence = calculateNextOccurrence(event);
            if (nextOccurrence) {
              const duration = event.endTime - event.startTime;
              const recurringPublicId = await generateUniquePublicId(ctx, 'scheduledEvents');
              await ctx.db.insert('scheduledEvents', {
                ...event,
                publicId: recurringPublicId,
                startTime: nextOccurrence,
                endTime: nextOccurrence + duration,
                parentEventId: event._id,
                processingStatus: 'pending',
                processedAt: undefined,
                processingError: undefined,
                processingRetryCount: undefined,
                status: 'scheduled',
                createdAt: Date.now(),
              });
            }
          }
        } else {
          throw new Error('Handler returned false');
        }
      } catch (error) {
        results.failed++;

        const retryCount = (event.processingRetryCount || 0) + 1;
        const canRetry = retryCount < SCHEDULING_CONSTANTS.MAX_RETRY_ATTEMPTS;

        await ctx.db.patch(event._id, {
          processingStatus: canRetry ? 'pending' : 'failed',
          processingError: error instanceof Error ? error.message : 'Unknown error',
          processingRetryCount: retryCount,
        });

        // Call onProcessError if exists
        const handler = getHandler(event.handlerType);
        if (handler?.onProcessError) {
          await handler.onProcessError(
            ctx,
            event._id,
            error instanceof Error ? error : new Error('Unknown error')
          );
        }
      }
    }

    return results;
  },
});

/**
 * Reschedule an event to a new time
 */
export const rescheduleEvent = mutation({
  args: {
    
    eventId: v.id('scheduledEvents'),
    newStartTime: v.number(),
    newEndTime: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.deletedAt) {
      throw new Error('Cannot reschedule deleted event');
    }

    // Validate new time range
    if (args.newStartTime >= args.newEndTime) {
      throw new Error('Start time must be before end time');
    }

    // Update the event with new times
    await ctx.db.patch(args.eventId, {
      startTime: args.newStartTime,
      endTime: args.newEndTime,
      updatedBy: user._id,
      updatedAt: Date.now(),
      metadata: {
        ...(event.metadata || {}),
        rescheduleReason: args.reason ?? '',
        originalStartTime: event.startTime,
        originalEndTime: event.endTime,
        rescheduledAt: Date.now(),
        rescheduledBy: user._id,
      },
    });

    return args.eventId;
  },
});

/**
 * Create or update user availability preferences
 */
export const updateAvailabilityPreferences = mutation({
  args: {
    
    timezone: v.string(),
    workingHours: v.array(v.object({
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      isAvailable: v.boolean(),
    })),
    bufferTime: v.optional(v.number()),
    allowBackToBack: v.optional(v.boolean()),
    autoAccept: v.optional(v.boolean()),
    defaultEventDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Validate working hours
    for (const wh of args.workingHours) {
      if (wh.dayOfWeek < 0 || wh.dayOfWeek > 6) {
        throw new Error('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
      }

      // Validate time format (HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(wh.startTime) || !timeRegex.test(wh.endTime)) {
        throw new Error('Time must be in HH:mm format');
      }
    }

    // Check if preferences already exist
    const existing = await ctx.db
      .query('availabilityPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existing) {
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        timezone: args.timezone,
        workingHours: args.workingHours,
        bufferTime: args.bufferTime,
        allowBackToBack: args.allowBackToBack,
        autoAccept: args.autoAccept,
        defaultEventDuration: args.defaultEventDuration,
        updatedBy: user._id,
        updatedAt: Date.now(),
      });

      return existing._id;
    } else {
      // Create new preferences
      const preferencesId = await ctx.db.insert('availabilityPreferences', {
        userId: user._id,
        timezone: args.timezone,
        workingHours: args.workingHours,
        bufferTime: args.bufferTime,
        allowBackToBack: args.allowBackToBack,
        autoAccept: args.autoAccept,
        defaultEventDuration: args.defaultEventDuration,
        createdBy: user._id,
        createdAt: Date.now(),
      });

      return preferencesId;
    }
  },
});
