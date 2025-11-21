// convex/schema/yourobc/tasks/tasks.ts
// Table definitions for tasks module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields } from '@/schema/base';
import { tasksValidators, tasksFields } from './validators';

export const tasksTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Task details
  description: v.optional(v.string()),
  status: tasksValidators.status,
  priority: v.optional(tasksValidators.priority),
  taskType: v.optional(tasksValidators.taskType),

  // Assignment
  assignedTo: v.optional(v.id('userProfiles')),
  assignedBy: v.optional(v.id('userProfiles')),
  assignedAt: v.optional(v.number()),

  // Timing
  dueDate: v.optional(v.number()),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Completion info
  completedBy: v.optional(v.id('userProfiles')),
  completionNotes: v.optional(v.string()),

  // Cancellation info
  cancelledAt: v.optional(v.number()),
  cancelledBy: v.optional(v.id('userProfiles')),
  cancellationReason: v.optional(v.string()),

  // Related entity references
  relatedShipmentId: v.optional(v.id('yourobcShipments')),
  relatedQuoteId: v.optional(v.id('yourobcQuotes')),
  relatedCustomerId: v.optional(v.id('yourobcCustomers')),
  relatedPartnerId: v.optional(v.id('yourobcPartners')),

  // Checklist items
  checklist: v.optional(v.array(tasksFields.checklistItem)),

  // Classification
  ...classificationFields,

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_due_date', ['dueDate'])
  .index('by_priority', ['priority'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_assigned_and_status', ['assignedTo', 'status'])
  .index('by_related_shipment', ['relatedShipmentId'])
  .index('by_related_quote', ['relatedQuoteId'])
  .index('by_related_customer', ['relatedCustomerId'])
  .index('by_created_at', ['createdAt']);
