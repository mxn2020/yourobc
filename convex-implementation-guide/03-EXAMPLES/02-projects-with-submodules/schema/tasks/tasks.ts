// convex/schema/software/freelancer_dashboard/projects/tasks/tasks.ts
// Child tasks table (belongs to projects)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { tasksValidators } from './validators';
import { sharedProjectFields } from '../_shared/validators';

/**
 * Tasks table (Child of Projects)
 * Every task must belong to a project (projectId is required)
 */
export const tasksTable = defineTable({
  title: v.string(),
  publicId: v.string(),

  // REQUIRED parent reference
  projectId: v.id('freelancerProjects'),

  description: v.optional(v.string()),
  status: tasksValidators.status,
  priority: v.optional(tasksValidators.priority),
  progressStatus: tasksValidators.progressStatus,

  // Optional assignment
  assignedTo: v.optional(v.id('userProfiles')),

  // Time tracking
  timeEstimate: v.optional(sharedProjectFields.timeEstimate),

  dueDate: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  tags: v.optional(v.array(v.string())),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_deleted_at', ['deletedAt'])

  // Parent relationship indexes
  .index('by_project', ['projectId'])
  .index('by_project_and_status', ['projectId', 'status'])
  .index('by_project_and_assigned', ['projectId', 'assignedTo'])

  // Query optimization
  .index('by_assigned_to', ['assignedTo'])
  .index('by_due_date', ['dueDate'])
  .index('by_created_at', ['createdAt']);
