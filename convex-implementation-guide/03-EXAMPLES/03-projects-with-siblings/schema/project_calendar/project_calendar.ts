// convex/schema/software/freelancer_dashboard/projects/project_calendar/project_calendar.ts
// Project calendar table (sibling module 2 - independent)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectCalendarValidators, projectCalendarFields } from './validators';

/**
 * Project Calendar table (Sibling module)
 * Independent module that OPTIONALLY references projects
 * Can be used with or without projects module
 */
export const projectCalendarTable = defineTable({
  title: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  description: v.optional(v.string()),
  eventType: projectCalendarValidators.eventType,
  status: projectCalendarValidators.status,

  // OPTIONAL reference to project (sibling module can work standalone)
  projectId: v.optional(v.id('freelancerProjects')),

  // Event timing
  startTime: v.number(),
  endTime: v.number(),
  allDay: v.optional(v.boolean()),
  timezone: v.optional(v.string()),

  // Recurrence (optional)
  recurrence: v.optional(projectCalendarFields.recurrence),

  // Location
  location: v.optional(v.string()),
  virtualMeetingUrl: v.optional(v.string()),

  // Attendees
  attendees: v.optional(v.array(projectCalendarFields.attendee)),

  // Reminders
  reminders: v.optional(v.array(projectCalendarValidators.reminderTiming)),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Optional project relationship
  .index('by_project_id', ['projectId'])

  // Time-based queries
  .index('by_start_time', ['startTime'])
  .index('by_end_time', ['endTime'])
  .index('by_owner_and_start', ['ownerId', 'startTime'])

  // Event type queries
  .index('by_event_type', ['eventType'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt']);
