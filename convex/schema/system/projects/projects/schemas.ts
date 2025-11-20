// convex/schema/system/projects/projects/schemas.ts
// Schema exports for projects module

import { projectsTable, projectMembersTable } from './projects';

export const systemProjectsProjectsSchemas = {
  projects: projectsTable,
  projectMembers: projectMembersTable,
};
