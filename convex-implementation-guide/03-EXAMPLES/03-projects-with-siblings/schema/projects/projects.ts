// convex/schema/software/freelancer_dashboard/projects/projects/projects.ts
// Projects table (sibling module 1)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators, projectsFields } from './validators';

/**
 * Projects table (Sibling module)
 * Independent from project_calendar but can reference each other
 */
export const projectsTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  description: v.optional(v.string()),
  status: projectsValidators.status,
  priority: v.optional(projectsValidators.priority),
  visibility: projectsValidators.visibility,

  clientId: v.optional(v.id('clients')),
  budget: v.optional(projectsFields.budget),

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
