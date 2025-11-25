// convex/schema/software/freelancer_dashboard/projects/projects/schemas.ts

import { projectsTable } from './projects';
import { projectMembersTable } from './project_members';

export const softwareFreelancerDashboardProjectsSchemas = {
  freelancerProjects: projectsTable,
  freelancerProjectMembers: projectMembersTable,
};
