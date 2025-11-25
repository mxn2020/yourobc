// convex/schema/software/freelancer_dashboard/projects/projects/projects.ts
// Parent projects table (has child tasks and milestones)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators } from './validators';
import { sharedProjectFields } from '../_shared/validators';

/**
 * Projects table (Parent)
 * Has child relations: tasks and milestones
 */
export const projectsTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  description: v.optional(v.string()),
  status: projectsValidators.status,
  priority: v.optional(projectsValidators.priority),
  visibility: projectsValidators.visibility,
  projectType: v.optional(projectsValidators.projectType),

  clientId: v.optional(v.id('clients')),
  budget: v.optional(sharedProjectFields.budget),

  startDate: v.optional(v.number()),
  deadline: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  tags: v.optional(v.array(v.string())),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);
