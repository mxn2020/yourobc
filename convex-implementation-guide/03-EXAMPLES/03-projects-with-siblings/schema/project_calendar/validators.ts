// convex/schema/software/freelancer_dashboard/projects/project_calendar/validators.ts
// Project calendar sibling module validators

import { v } from 'convex/values';

/**
 * Validators for project_calendar sibling module
 * Independent module that CAN reference projects but doesn't require it
 */
export const projectCalendarValidators = {
  /**
   * Event type
   */
  eventType: v.union(
    v.literal('meeting'),
    v.literal('deadline'),
    v.literal('milestone'),
    v.literal('review'),
    v.literal('other')
  ),

  /**
   * Event status
   */
  status: v.union(
    v.literal('scheduled'),
    v.literal('in_progress'),
    v.literal('completed'),
    v.literal('cancelled')
  ),

  /**
   * Reminder timing
   */
  reminderTiming: v.union(
    v.literal('5_minutes'),
    v.literal('15_minutes'),
    v.literal('1_hour'),
    v.literal('1_day'),
    v.literal('1_week')
  ),
} as const;

export const projectCalendarFields = {
  /**
   * Recurrence pattern
   */
  recurrence: v.object({
    frequency: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    interval: v.number(),
    endDate: v.optional(v.number()),
  }),

  /**
   * Attendees
   */
  attendee: v.object({
    userId: v.id('userProfiles'),
    response: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('tentative')
    ),
  }),
} as const;
