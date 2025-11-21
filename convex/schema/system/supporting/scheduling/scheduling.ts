// convex/schema/system/supporting/scheduling/scheduling.ts
// Table definitions for scheduling module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';
import { schedulingValidators } from './validators';

export const scheduledEventsTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  status: schedulingValidators.status,

  // Basic info
  description: v.optional(v.string()),
  type: schedulingValidators.type,

  // Linked entity (what this event is for)
  entityType: entityTypes.all,
  entityId: v.string(),

  // Handler configuration (for modular system)
  handlerType: v.string(),
  handlerData: v.optional(v.any()),
  autoProcess: v.boolean(),
  processingStatus: schedulingValidators.processingStatus,
  processedAt: v.optional(v.number()),
  processingError: v.optional(v.string()),
  processingRetryCount: v.optional(v.number()),

  // Time
  startTime: v.number(),
  endTime: v.number(),
  timezone: v.optional(v.string()),
  allDay: v.boolean(),

  // Recurrence
  isRecurring: v.boolean(),
  recurrencePattern: v.optional(v.object({
    frequency: schedulingValidators.recurrenceFrequency,
    interval: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
    dayOfMonth: v.optional(v.number()),
    monthOfYear: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxOccurrences: v.optional(v.number()),
  })),
  parentEventId: v.optional(v.id('scheduledEvents')),

  // Participants
  organizerId: v.id('userProfiles'),
  attendees: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
    email: v.optional(v.string()),
    status: schedulingValidators.attendeeStatus,
    responseAt: v.optional(v.number()),
  }))),

  // Location
  location: v.optional(v.object({
    type: schedulingValidators.locationType,
    address: v.optional(v.string()),
    roomNumber: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    instructions: v.optional(v.string()),
  })),

  // Status and visibility
  visibility: v.optional(schedulingValidators.visibility),
  priority: v.optional(schedulingValidators.priority),

  // Reminders
  reminders: v.optional(v.array(v.object({
    type: schedulingValidators.reminderType,
    minutesBefore: v.number(),
    sent: v.boolean(),
    sentAt: v.optional(v.number()),
  }))),

  // Additional info
  color: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }))),

  // Cancellation info
  cancelledBy: v.optional(v.id('userProfiles')),
  cancelledAt: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_handler_type', ['handlerType'])
  .index('by_auto_process', ['autoProcess'])
  .index('by_processing_status', ['processingStatus'])
  .index('by_start_time', ['startTime'])
  .index('by_end_time', ['endTime'])
  .index('by_organizer', ['organizerId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_handler_autoprocess', ['handlerType', 'autoProcess'])
  .index('by_handler_status', ['handlerType', 'processingStatus'])
  .index('by_starttime_status', ['startTime', 'status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);
