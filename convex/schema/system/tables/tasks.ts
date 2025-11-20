// convex/schema/boilerplate/tables/tasks.ts
// Schema for project members and milestones
// NOTE: Tasks table has been moved to convex/schema/boilerplate/tasks/tasks/

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statusTypes, auditFields, softDeleteFields, metadataSchema } from '@/schema/base'

// ============================================================================
// Tasks Table
// ============================================================================
// DEPRECATED: This table definition has been moved to convex/schema/boilerplate/tasks/tasks/
// The projectTasks table is now managed through the GUIDE pattern structure

// ============================================================================
// Project Members Table
// ============================================================================

export const projectMembersTable = defineTable({
  // Core Membership Data
  projectId: v.id('projects'),
  userId: v.id('userProfiles'),
  role: statusTypes.memberRole,

  // Member Information
  department: v.optional(v.string()),
  jobTitle: v.optional(v.string()),

  // Status & Activity
  status: statusTypes.memberStatus,
  joinedAt: v.number(),
  lastActiveAt: v.optional(v.number()),

  // Invitation
  invitedBy: v.id('userProfiles'),
  invitedAt: v.number(),
  invitationAcceptedAt: v.optional(v.number()),

  // Permissions
  permissions: v.optional(v.array(v.string())), // custom permissions

  // Settings
  settings: v.optional(v.object({
    emailNotifications: v.optional(v.boolean()),
    canManageTasks: v.optional(v.boolean()),
    canInviteMembers: v.optional(v.boolean()),
    canEditProject: v.optional(v.boolean()),
  })),

  // Extended metadata
  extendedMetadata: v.optional(v.object({
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  })),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_project', ['projectId'])
  .index('by_user', ['userId'])
  .index('by_role', ['role'])
  .index('by_status', ['status'])
  .index('by_joined_at', ['joinedAt'])
  .index('by_project_status', ['projectId', 'status'])
  .index('by_user_status', ['userId', 'status'])
  .index('by_project_role', ['projectId', 'role'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt'])

// ============================================================================
// Milestones Table
// ============================================================================

export const projectMilestonesTable = defineTable({
  // Public ID
  publicId: v.string(),

  // Core Milestone Data
  title: v.string(),
  description: v.optional(v.string()),
  status: statusTypes.milestone,
  priority: statusTypes.priority,

  // Project Association
  projectId: v.id('projects'),

  // Timeline
  startDate: v.number(),
  dueDate: v.number(),
  completedDate: v.optional(v.number()),

  // Progress Tracking
  progress: v.number(), // 0-100
  tasksTotal: v.optional(v.number()),
  tasksCompleted: v.optional(v.number()),

  // Dependencies
  dependencies: v.optional(v.array(v.id('projectMilestones'))), // prerequisite milestones

  // Organization
  order: v.number(), // for custom ordering in timeline
  color: v.optional(v.string()), // hex color for timeline visualization

  // Ownership
  assignedTo: v.optional(v.id('userProfiles')), // user responsible for milestone

  // Deliverables
  deliverables: v.optional(v.array(v.object({
    title: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),

  // Extended metadata
  extendedMetadata: v.optional(v.object({
    budget: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    riskLevel: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical'))),
    attachments: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_project', ['projectId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_start_date', ['startDate'])
  .index('by_due_date', ['dueDate'])
  .index('by_created_by', ['createdBy'])
  .index('by_assigned_to', ['assignedTo'])
  .index('by_order', ['order'])
  .index('by_project_status', ['projectId', 'status'])
  .index('by_project_due_date', ['projectId', 'dueDate'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt'])
