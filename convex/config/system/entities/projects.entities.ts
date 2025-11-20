// convex/config/boilerplate/entities/projects.entities.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Project management entity types
 * These entities support project, task, milestone, and team management
 */
export const PROJECTS_ENTITY_TYPES = [
  'boilerplate_project',
  'boilerplate_task',
  'boilerplate_milestone',
  'boilerplate_project_member',
] as const;

export type ProjectsEntityType = typeof PROJECTS_ENTITY_TYPES[number];
