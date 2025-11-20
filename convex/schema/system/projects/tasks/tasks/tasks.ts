// convex/schema/system/tasks/tasks/tasks.ts
// Table definitions for tasks module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { tasksValidators } from './validators';

export const tasksTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Core Task Data
  description: v.optional(v.string()),
  status: tasksValidators.status,
  priority: tasksValidators.priority,

  // Assignment & Project Association
  projectId: v.optional(v.id('projects')),
  assignedTo: v.optional(v.id('userProfiles')),

  // Timeline
  startDate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Time Tracking
  estimatedHours: v.optional(v.number()),
  actualHours: v.optional(v.number()),

  // Organization
  tags: v.array(v.string()),
  order: v.number(), // for custom ordering

  // Dependencies
  blockedBy: v.optional(v.array(v.id('projectTasks'))), // tasks blocking this one
  dependsOn: v.optional(v.array(v.id('projectTasks'))), // tasks this depends on

  // Extended metadata
  extendedMetadata: v.optional(v.object({
    attachments: v.optional(v.array(v.string())),
    externalLinks: v.optional(v.array(v.string())),
    customFields: v.optional(v.record(v.string(), v.any())),
  })),

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
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_project', ['projectId'])
  .index('by_assignee', ['assignedTo'])
  .index('by_created_by', ['createdBy'])
  .index('by_due_date', ['dueDate'])
  .index('by_start_date', ['startDate'])
  .index('by_order', ['order'])
  .index('by_created_at', ['createdAt'])

  // Compound indexes
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_project_status', ['projectId', 'status'])
  .index('by_assignee_status', ['assignedTo', 'status']);
