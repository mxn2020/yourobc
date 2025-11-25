// convex/lib/projects/index.ts
// Public API exports for projects module

// Constants
export { PROJECTS_CONSTANTS, PROJECTS_VALUES, PRIORITY_WEIGHTS } from './constants';

// Types
export type * from './types';
export type * from './milestones/types';
export type * from './team/types';

// Utilities
export {
  validateProjectData,
  calculateProgress,
  isProjectOverdue,
  isProjectAtRisk,
  getProjectPriorityWeight,
  getProjectStatusColor,
  getProjectPriorityColor,
  calculateProjectHealth,
  formatProjectProgress,
  getProjectTimeRemaining,
  formatTimeRemaining,
  shouldAutoArchive,
  getProjectAge,
  formatProjectAge,
  compareProjectPriority,
  compareProjectDueDate,
  compareProjectProgress,
  isProjectEditable,
  trimProjectData,
  buildSearchableText,
} from './utils';

// Permissions
export {
  canViewProject,
  canEditProject,
  canDeleteProject,
  canManageTeam,
  requireViewProjectAccess,
  requireEditProjectAccess,
  requireDeleteProjectAccess,
  requireTeamManagementAccess,
  filterProjectsByAccess,
} from './permissions';

// Queries
export {
  getProjects,
  getProject,
  getProjectByPublicId,
  getUserProjects,
  getProjectStats,
  getDashboardStats,
  getProjectMembers,
} from './queries';

// Mutations
export {
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  archiveProject,
  updateProjectProgress,
  bulkUpdateProjects,
  bulkDeleteProjects,
} from './mutations';

// Sub-modules (milestones and team)
export * as milestones from './milestones';
export * as team from './team';
