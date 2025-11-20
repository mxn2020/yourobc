// convex/schema/system/projects/projects/projects.ts
// Table definitions for projects module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { projectsValidators } from './validators';

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
  progress: v.object({
    completedTasks: v.number(),
    totalTasks: v.number(),
    percentage: v.number(),
  }),

  // Timeline
  startDate: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Project settings
  settings: v.object({
    allowComments: v.optional(v.boolean()),
    requireApproval: v.optional(v.boolean()),
    autoArchive: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
  }),

  // Extended metadata
  extendedMetadata: v.optional(v.object({
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    budget: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    riskLevel: v.optional(projectsValidators.riskLevel),
    client: v.optional(v.string()),
    color: v.optional(v.string()),
  })),

  // Activity tracking
  lastActivityAt: v.number(),

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
  .index('by_visibility', ['visibility'])
  .index('by_category', ['category'])
  .index('by_due_date', ['dueDate'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_created_at', ['createdAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);

export const projectMembersTable = defineTable({
  projectId: v.id('projects'),
  userId: v.id('userProfiles'),
  role: v.union(
    v.literal('owner'),
    v.literal('admin'),
    v.literal('member'),
    v.literal('viewer')
  ),
  status: v.union(
    v.literal('active'),
    v.literal('invited'),
    v.literal('removed')
  ),

  // Timestamps
  joinedAt: v.number(),
  lastActiveAt: v.optional(v.number()),
  invitedAt: v.number(),
  invitedBy: v.id('userProfiles'),
  invitationAcceptedAt: v.optional(v.number()),

  // Member-specific settings
  settings: v.optional(v.object({
    emailNotifications: v.optional(v.boolean()),
    canManageTasks: v.optional(v.boolean()),
    canInviteMembers: v.optional(v.boolean()),
    canEditProject: v.optional(v.boolean()),
  })),

  // Additional member information
  department: v.optional(v.string()),
  jobTitle: v.optional(v.string()),

  // Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_project', ['projectId'])
  .index('by_user', ['userId'])
  .index('by_project_and_user', ['projectId', 'userId'])
  .index('by_user_and_project', ['userId', 'projectId'])
  .index('by_project_role', ['projectId', 'role'])
  .index('by_deleted_at', ['deletedAt']);
