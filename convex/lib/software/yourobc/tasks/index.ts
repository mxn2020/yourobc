// convex/lib/software/yourobc/tasks/index.ts
/**
 * Tasks Library Module
 *
 * Barrel export for the tasks library module.
 * Provides a single entry point for importing all task-related
 * business logic, utilities, and types.
 *
 * @module convex/lib/software/yourobc/tasks
 */

// ============================================================================
// Constants
// ============================================================================

export {
  TASK_PUBLIC_ID_PREFIX,
  TASK_DISPLAY_FIELD,
  TASK_FALLBACK_DISPLAY_FIELD,
  TASK_DEFAULTS,
  TASK_STATUS_TRANSITIONS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_WEIGHTS,
  TASK_PRIORITY_COLORS,
  TASK_LIMITS,
  TASK_TIME_LIMITS,
  DEFAULT_QUERY_LIMIT,
  MAX_QUERY_LIMIT,
  COMMON_TASK_CATEGORIES,
  TASK_PERMISSIONS,
} from './constants'

// ============================================================================
// Types
// ============================================================================

export type {
  Task,
  TaskId,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  PaginationOptions,
  SearchTasksOptions,
  TaskAssignment,
  TaskReassignment,
  TaskCompletion,
  TaskCancellation,
  TaskStats,
  TaskPerformanceMetrics,
  PermissionCheckResult,
  PermissionContext,
  TaskValidationResult,
  StatusTransitionValidation,
} from './types'

// ============================================================================
// Utilities
// ============================================================================

export {
  generateTaskPublicId,
  isValidTaskPublicId,
  getTaskDisplayValue,
  formatTaskForDisplay,
  isValidStatusTransition,
  getNextAllowedStatuses,
  isTerminalStatus,
  getPriorityWeight,
  comparePriority,
  isTaskOverdue,
  getDaysUntilDue,
  getTaskCompletionTime,
  validateTaskData,
  calculateTaskStats,
  sortTasksByPriorityAndDueDate,
  filterTasksByStatus,
  getActiveTasks,
  getTaskDefaults,
} from './utils'

// ============================================================================
// Permissions
// ============================================================================

export {
  canReadTask,
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canAssignTask,
  canCompleteTask,
  canCancelTask,
  checkPermission,
  getUserPermissionLevel,
} from './permissions'

// ============================================================================
// Queries
// ============================================================================

export {
  getTaskById,
  getTaskByPublicId,
  listTasksByOwner,
  listTasksByShipment,
  listTasksByAssignee,
  listTasksByStatus,
  listTasksByPriority,
  listTasksWithFilters,
  getOverdueTasks,
  getActiveTasks as getActiveTasksQuery,
  getUpcomingTasks,
  searchTasks,
} from './queries'

// ============================================================================
// Mutations
// ============================================================================

export {
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  unassignTask,
  completeTask,
  cancelTask,
  deleteTask,
  restoreTask,
  permanentlyDeleteTask,
} from './mutations'
