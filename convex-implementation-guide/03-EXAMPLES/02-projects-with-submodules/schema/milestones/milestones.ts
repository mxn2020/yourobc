// convex/schema/software/freelancer_dashboard/projects/milestones/milestones.ts
// Child milestones table (belongs to projects)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { milestonesValidators } from './validators';
import { sharedProjectFields } from '../_shared/validators';

/**
 * Milestones table (Child of Projects)
 * Key project checkpoints with dates and deliverables
 */
export const milestonesTable = defineTable({
  title: v.string(),
  publicId: v.string(),

  // REQUIRED parent reference
  projectId: v.id('freelancerProjects'),

  description: v.optional(v.string()),
  status: milestonesValidators.status,
  priority: v.optional(milestonesValidators.priority),
  milestoneType: milestonesValidators.milestoneType,

  // Milestone specifics
  targetDate: v.number(),
  completedAt: v.optional(v.number()),

  // Optional budget allocation for this milestone
  budget: v.optional(sharedProjectFields.budget),

  // Deliverables
  deliverables: v.optional(v.array(v.string())),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_deleted_at', ['deletedAt'])

  // Parent relationship indexes
  .index('by_project_id', ['projectId'])
  .index('by_project_and_status', ['projectId', 'status'])
  .index('by_project_and_date', ['projectId', 'targetDate'])

  // Query optimization
  .index('by_target_date', ['targetDate'])
  .index('by_milestone_type', ['milestoneType'])
  .index('by_created_at', ['createdAt']);
