// convex/schema/software/freelancer_dashboard/projects/project_members.ts
// Project members table definition (related to projects)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators } from './validators';

/**
 * Project Members table
 * Manages team membership for projects
 */
export const projectMembersTable = defineTable({
  // Relationships
  projectId: v.id('freelancerProjects'),
  userId: v.id('userProfiles'),

  // Member details
  role: projectsValidators.memberRole,
  status: projectsValidators.memberStatus,

  // Invitation tracking
  invitedBy: v.id('userProfiles'),
  invitedAt: v.number(),
  joinedAt: v.optional(v.number()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Relationship indexes
  .index('by_project', ['projectId'])
  .index('by_user', ['userId'])
  .index('by_project_and_user', ['projectId', 'userId'])
  .index('by_project_and_status', ['projectId', 'status'])
  .index('by_user_and_status', ['userId', 'status'])
  .index('by_invited_by', ['invitedBy']);
