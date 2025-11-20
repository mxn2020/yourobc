// convex/schema/boilerplate/projects/projects/schemas.ts
// Schema exports for projects module

import { projectsTable, projectMembersTable } from './projects';

export const boilerplateProjectsProjectsSchemas = {
  projects: projectsTable,
  projectMembers: projectMembersTable,
};
