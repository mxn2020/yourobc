// convex/schema/yourobc/tasks.ts
/**
 * YourOBC Tasks Schema
 *
 * Defines schemas for task management in the YourOBC system.
 * Tasks are work items associated with shipments that need to be completed.
 * Follows the template pattern with full compliance for maintainability.
 *
 * @module convex/schema/yourobc/tasks
 */

import { v } from 'convex/values'
import { defineTable } from 'convex/server'
import {
  taskTypeValidator,
  taskStatusValidator,
  taskPriorityValidator,
  auditFields,
  softDeleteFields,
} from './base'

// ============================================================================
// Tasks Table Schema
// ============================================================================

/**
 * Tasks table
 * Manages work items and action items associated with shipments
 */
export const tasksTable = defineTable({
  // Core Identity
  title: v.string(), // Task title
  description: v.optional(v.string()),

  // Entity Reference
  shipmentId: v.id('yourobcShipments'),

  // Task Management
  type: taskTypeValidator, // manual, automatic
  status: taskStatusValidator, // pending, in_progress, completed, cancelled
  priority: taskPriorityValidator, // low, medium, high, critical

  // Assignment
  assignedTo: v.optional(v.id('userProfiles')),
  assignedBy: v.optional(v.id('userProfiles')),
  assignedAt: v.optional(v.number()),

  // Timing
  dueDate: v.optional(v.number()),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Completion Info
  completedBy: v.optional(v.id('userProfiles')),
  completionNotes: v.optional(v.string()),

  // Cancellation Info
  cancelledAt: v.optional(v.number()),
  cancelledBy: v.optional(v.id('userProfiles')),
  cancellationReason: v.optional(v.string()),

  // Classification & Metadata
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  metadata: v.optional(v.any()), // Flexible metadata for automation-specific data

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_shipment', ['shipmentId'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_status', ['status'])
  .index('by_due_date', ['dueDate'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
  .index('by_shipment_and_status', ['shipmentId', 'status'])
  .index('by_assigned_and_status', ['assignedTo', 'status'])
  .index('by_creator', ['createdBy'])
  .index('by_creator_and_status', ['createdBy', 'status'])
