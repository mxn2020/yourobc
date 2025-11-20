// convex/lib/system/supporting/scheduling/handlers/event.ts

import type { SchedulingHandler } from './types';
import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';

/**
 * Event Handler
 * Default handler for calendar events, meetings, appointments, etc.
 *
 * This handler does NOT auto-process - events are manually tracked by users.
 * Processing an event simply marks it as completed and can trigger notifications.
 */
export const eventHandler: SchedulingHandler = {
  type: 'event',
  name: 'Calendar Event',
  description: 'Standard calendar events, meetings, and appointments',
  autoProcess: false, // Manual events are not auto-processed
  icon: 'Calendar',
  color: '#3B82F6', // Blue

  /**
   * Process a calendar event
   * For manual events, this is typically called when user marks event as completed
   */
  async processScheduled(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ): Promise<boolean> {
    try {
      // Get the scheduled event
      const event = await ctx.db.get(scheduledEventId);
      if (!event) {
        console.error('Event not found:', scheduledEventId);
        return false;
      }

      // Update event status to completed
      await ctx.db.patch(scheduledEventId, {
        status: 'completed',
        processingStatus: 'completed',
        processedAt: Date.now(),
      });

      // TODO: Send notifications to attendees that event is completed
      // This can be implemented when notification system is integrated

      return true;
    } catch (error) {
      console.error('Error processing event:', error);
      return false;
    }
  },

  /**
   * Validate event-specific handler data
   */
  validateHandlerData(data: Record<string, unknown>): boolean {
    // Event handler doesn't require special validation
    // All validation is done via the standard event fields
    return true;
  },

  /**
   * Called after successful processing
   */
  async afterProcess(
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ): Promise<void> {
    // Get the event
    const event = await ctx.db.get(scheduledEventId);
    if (!event) return;

    // If this is a recurring event, create the next occurrence
    if (event.isRecurring && event.recurrencePattern) {
      // TODO: Implement recurring event creation
      // This will be handled in the mutations file
      console.log('Creating next occurrence for recurring event');
    }
  },
};
