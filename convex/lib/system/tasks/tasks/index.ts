// convex/lib/system/tasks/tasks/index.ts
// Public API exports for tasks module

// Constants
export { TASKS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateTaskData,
  formatTaskDisplayName,
  isTaskEditable,
  isTaskOverdue,
  calculateTaskProgress,
  sortTasksByPriority,
} from './utils';

// Permissions
export {
  canViewTask,
  canEditTask,
  canDeleteTask,
  canAssignTask,
  requireViewTaskAccess,
  requireEditTaskAccess,
  requireDeleteTaskAccess,
  requireAssignTaskAccess,
  filterTasksByAccess,
} from './permissions';

// Queries
export {
  getTasks,
  getTask,
  getTaskByPublicId,
  getTasksByProject,
  getTaskStats,
  getMyTasks,
} from './queries';

// Mutations
export {
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  completeTask,
  assignTask,
  bulkUpdateTasks,
  bulkDeleteTasks,
} from './mutations';
