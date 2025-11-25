// convex/schema/projects/schemas.ts
// Schema exports for projects module

import { v } from 'convex/values';
import { projectsTable, projectMembersTable, projectMilestonesTable } from './tables';

// ID schema definitions
export const projectIdSchema = v.id('projects');
export const projectMemberIdSchema = v.id('projectMembers');
export const projectMilestoneIdSchema = v.id('projectMilestones');

// Schema aggregation object
export const projectsSchemas = {
  projects: projectsTable,
  projectMembers: projectMembersTable,
  projectMilestones: projectMilestonesTable,
};
