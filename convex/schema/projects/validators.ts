// convex/schema/projects/validators.ts
// Grouped validators for projects module

import { v } from 'convex/values';
import { statusTypes } from '@/schema/base';

// Projects validators
export const projectsValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('archived'),
    v.literal('completed'),
    v.literal('on_hold'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  riskLevel: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('critical')
  ),
} as const;

// Projects complex field definitions
export const projectsFields = {
  progress: v.object({
    completedTasks: v.number(),
    totalTasks: v.number(),
    percentage: v.number(),
  }),

  settings: v.object({
    allowComments: v.optional(v.boolean()),
    requireApproval: v.optional(v.boolean()),
    autoArchive: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
  }),

  extendedMetadata: v.object({
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    budget: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    riskLevel: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical')
      )
    ),
    client: v.optional(v.string()),
    color: v.optional(v.string()),
  }),
};

// Project members validators
export const projectMembersValidators = {
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
} as const;

// Project members complex field definitions
export const projectMembersFields = {
  settings: v.object({
    emailNotifications: v.optional(v.boolean()),
    canManageTasks: v.optional(v.boolean()),
    canInviteMembers: v.optional(v.boolean()),
    canEditProject: v.optional(v.boolean()),
  }),
};

// Project milestones validators
export const projectMilestonesValidators = {
  status: v.union(
    v.literal('upcoming'),
    v.literal('in_progress'),
    v.literal('completed'),
    v.literal('delayed'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),
} as const;

// Project milestones complex field definitions
export const projectMilestonesFields = {
  deliverable: v.object({
    title: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }),

  metadata: v.object({
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    budget: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    notes: v.optional(v.string()),
  }),
};

// Project tasks validators
export const projectTasksValidators = {
  status: statusTypes.task,
  priority: statusTypes.priority,
} as const;

// Project tasks complex field definitions
export const projectTasksFields = {
  metadata: v.object({
    attachments: v.optional(v.array(v.string())),
    externalLinks: v.optional(v.array(v.string())),
    customFields: v.optional(v.any()),
  }),
};
