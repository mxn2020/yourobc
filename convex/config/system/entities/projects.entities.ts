// convex/config/system/entities/projects.entities.ts
// ⚠️ SYSTEM FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Project management entity types
 * These entities support project, task, milestone, and team management
 */
export const PROJECTS_ENTITY_TYPES = [
  'system_project',
  'system_task',
  'system_milestone',
  'system_project_member',
] as const;

export type ProjectsEntityType = typeof PROJECTS_ENTITY_TYPES[number];
