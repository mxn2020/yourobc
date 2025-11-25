// convex/schema/software/freelancer_dashboard/projects/projects/project_members.ts
// Project members table (part of projects sibling module)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators } from './validators';

/**
 * Project Members table
 * Manages team membership for projects
 */
export const projectMembersTable = defineTable({
  projectId: v.id('freelancerProjects'),
  userId: v.id('userProfiles'),

  role: projectsValidators.memberRole,
  status: projectsValidators.memberStatus,

  invitedBy: v.id('userProfiles'),
  invitedAt: v.number(),
  joinedAt: v.optional(v.number()),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_deleted_at', ['deletedAt'])
  .index('by_project_id', ['projectId'])
  .index('by_user', ['userId'])
  .index('by_project_and_user', ['projectId', 'userId'])
  .index('by_project_and_status', ['projectId', 'status']);
