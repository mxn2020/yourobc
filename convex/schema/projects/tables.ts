// convex/schema/projects/tables.ts
// Table definitions for projects module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import {
  projectsValidators,
  projectsFields,
  projectMembersValidators,
  projectMembersFields,
  projectMilestonesValidators,
  projectMilestonesFields,
  projectTasksValidators,
  projectTasksFields,
} from './validators';

export const projectsTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Project information
  description: v.optional(v.string()),
  status: projectsValidators.status,
  priority: projectsValidators.priority,
  visibility: projectsValidators.visibility,

  // Project organization
  tags: v.array(v.string()),
  category: v.optional(v.string()),

  // Progress tracking
  progress: projectsFields.progress,

  // Timeline
  startDate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Project settings
  settings: projectsFields.settings,

  // Extended metadata
  extendedMetadata: v.optional(projectsFields.extendedMetadata),

  // Standard metadata and audit fields
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
  .index('by_visibility', ['visibility'])
  .index('by_category', ['category'])
  .index('by_due_date', ['dueDate'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);

export const projectMembersTable = defineTable({
  projectId: v.id('projects'),
  userId: v.id('userProfiles'),
  role: projectMembersValidators.role,
  status: projectMembersValidators.status,

  // Timestamps
  joinedAt: v.number(),
  lastActiveAt: v.optional(v.number()),
  invitedAt: v.number(),
  invitedBy: v.id('userProfiles'),
  invitationAcceptedAt: v.optional(v.number()),

  // Member-specific settings
  permissions: v.optional(v.array(v.string())),
  settings: v.optional(projectMembersFields.settings),

  // Additional member information
  department: v.optional(v.string()),
  jobTitle: v.optional(v.string()),

  // Extended metadata
  extendedMetadata: v.optional(projectMembersFields.extendedMetadata),

  // Standard fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_project_id', ['projectId'])
  .index('by_user', ['userId'])
  .index('by_project_and_user', ['projectId', 'userId'])
  .index('by_user_and_project', ['userId', 'projectId'])
  .index('by_project_role', ['projectId', 'role'])
  .index('by_deleted_at', ['deletedAt']);

export const projectMilestonesTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  projectId: v.id('projects'),

  // Milestone information
  description: v.optional(v.string()),
  status: projectMilestonesValidators.status,
  priority: projectMilestonesValidators.priority,

  // Timeline
  startDate: v.number(),
  dueDate: v.number(),
  completedDate: v.optional(v.number()),

  // Progress tracking
  progress: v.number(), // 0-100
  tasksTotal: v.optional(v.number()),
  tasksCompleted: v.optional(v.number()),

  // Assignment
  assignedTo: v.optional(v.id('userProfiles')),

  // Organization
  order: v.optional(v.number()),
  color: v.optional(v.string()),

  // Dependencies
  dependencies: v.optional(v.array(v.id('projectMilestones'))),

  // Deliverables
  deliverables: v.optional(v.array(projectMilestonesFields.deliverable)),

  // Extended metadata
  metadata: v.optional(projectMilestonesFields.metadata),

  // Standard metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_project_id', ['projectId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_due_date', ['dueDate'])
  .index('by_start_date', ['startDate'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_project_and_status', ['projectId', 'status'])
  .index('by_project_and_priority', ['projectId', 'priority'])
  .index('by_project_and_due_date', ['projectId', 'dueDate'])
  .index('by_order', ['order'])
  .index('by_created_at', ['createdAt']);

export const projectTasksTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  projectId: v.id('projects'),

  // Task information
  description: v.optional(v.string()),
  status: projectTasksValidators.status,
  priority: projectTasksValidators.priority,

  // Assignment & organization
  assignedTo: v.optional(v.id('userProfiles')),
  tags: v.optional(v.array(v.string())),
  order: v.optional(v.number()),

  // Timeline
  startDate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Time tracking
  estimatedHours: v.optional(v.number()),
  actualHours: v.optional(v.number()),

  // Dependencies
  blockedBy: v.optional(v.array(v.id('projectTasks'))),
  dependsOn: v.optional(v.array(v.id('projectTasks'))),

  // Extended metadata
  metadata: v.optional(projectTasksFields.metadata),

  // Standard metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_project_id', ['projectId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_due_date', ['dueDate'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_project_and_status', ['projectId', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_order', ['order']);
