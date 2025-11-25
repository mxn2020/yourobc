// convex/schema/software/freelancer_dashboard/projects/schemas.ts
// Schema exports for projects module

import { projectsTable } from './projects';
import { projectMembersTable } from './project_members';

/**
 * Projects module schemas
 * Exports both projects and project_members tables
 */
export const softwareFreelancerDashboardProjectsSchemas = {
  freelancerProjects: projectsTable,
  freelancerProjectMembers: projectMembersTable,
};
