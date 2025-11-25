// convex/schema/projects/schemas.ts
// Schema exports for projects module

import { v } from 'convex/values';
import { projectsTable, projectMembersTable, projectMilestonesTable, projectTasksTable } from './tables';

// ID schema definitions
export const projectIdSchema = v.id('projects');
export const projectMemberIdSchema = v.id('projectMembers');
export const projectMilestoneIdSchema = v.id('projectMilestones');
export const projectTaskIdSchema = v.id('projectTasks');

// Schema aggregation object
export const projectsSchemas = {
  projects: projectsTable,
  projectMembers: projectMembersTable,
  projectMilestones: projectMilestonesTable,
  projectTasks: projectTasksTable,
};
