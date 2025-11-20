// convex/schema/software/yourobc/tasks/tasks.ts
/**
 * Tasks Table Definition
 *
 * Defines the schema for task management in the YouROBC system.
 * Tasks are work items associated with shipments that need to be completed.
 * This table supports both manual and automated task creation with comprehensive
 * tracking of assignment, completion, and cancellation workflows.
 *
 * @module convex/schema/software/yourobc/tasks/tasks
 */

import { v } from 'convex/values'
import { defineTable } from 'convex/server'
import {
  auditFields,
  softDeleteFields,
} from '../../../yourobc/base'
import {
  taskStatusValidator,
  taskTypeValidator,
  taskPriorityValidator,
  taskVisibilityValidator,
} from './validators'

// ============================================================================
// Tasks Table
// ============================================================================

/**
 * Tasks table
 * Manages work items and action items associated with shipments.
 * Each task can be assigned to users, tracked through various states,
 * and includes comprehensive metadata for workflow management.
 *
 * Key Features:
 * - Multi-state workflow (pending, in_progress, completed, archived)
 * - Priority-based organization (low, medium, high, critical)
 * - Assignment tracking with timestamps
 * - Completion and cancellation workflows
 * - Flexible metadata and categorization
 * - Soft delete support
 *
 * Display Field: title (primary task identifier)
 */
export const tasksTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier (e.g., 'task_abc123')

  // Core Identity
  title: v.string(), // Task title (main display field)
  description: v.optional(v.string()),

  // Entity Reference
  shipmentId: v.id('yourobcShipments'),

  // Task Management
  type: taskTypeValidator, // manual, automatic
  status: taskStatusValidator, // pending, in_progress, completed, archived
  priority: taskPriorityValidator, // low, medium, high, critical
  visibility: v.optional(taskVisibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - task creator/owner

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
  ...auditFields, // createdAt, createdBy, updatedAt, updatedBy
  ...softDeleteFields, // deletedAt, deletedBy
})
  // Core indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created', ['createdAt'])

  // Status and priority indexes
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])

  // Feature indexes
  .index('by_shipment', ['shipmentId'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_due_date', ['dueDate'])
  .index('by_category', ['category'])
  .index('by_creator', ['createdBy'])

  // Composite indexes for common queries
  .index('by_shipment_and_status', ['shipmentId', 'status'])
  .index('by_assigned_and_status', ['assignedTo', 'status'])
  .index('by_creator_and_status', ['createdBy', 'status'])
  .index('by_owner_deleted', ['ownerId', 'deletedAt'])
  .index('by_status_deleted', ['status', 'deletedAt'])
  .index('by_priority_deleted', ['priority', 'deletedAt'])

// ============================================================================
// Export
// ============================================================================

export default tasksTable
