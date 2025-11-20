// convex/lib/yourobc/tasks/types.ts
/**
 * Task Module Types
 *
 * This file defines TypeScript interfaces and types for the tasks module.
 * Validators are imported from schema/yourobc/base following the template pattern.
 *
 * @module convex/lib/yourobc/tasks/types
 */

import type { Doc, Id } from '../../../_generated/dataModel';
import type {
  TaskType,
  TaskStatus,
  TaskPriority
} from '../../../schema/yourobc/base';

/**
 * Task document type from the database
 */
export type Task = Doc<'yourobcTasks'>;

/**
 * Task ID type
 */
export type TaskId = Id<'yourobcTasks'>;

// Re-export types from schema for convenience
export type { TaskType, TaskStatus, TaskPriority };

/**
 * Data structure for creating a new task
 */
export interface CreateTaskData {
  /** The shipment this task is associated with */
  shipmentId: Id<'yourobcShipments'>;
  /** Task title */
  title: string;
  /** Detailed task description (optional) */
  description?: string;
  /** Type of task - manual or automatic */
  type: TaskType;
  /** Priority level of the task */
  priority: TaskPriority;
  /** User profile ID this task is assigned to (optional) */
  assignedTo?: Id<'userProfiles'>;
  /** Unix timestamp when task is due (optional) */
  dueDate?: number;
  /** Additional metadata for the task (optional) */
  metadata?: Record<string, any>;
}

/**
 * Data structure for updating an existing task
 */
export interface UpdateTaskData {
  /** Updated task title (optional) */
  title?: string;
  /** Updated task description (optional) */
  description?: string;
  /** Updated task status (optional) */
  status?: TaskStatus;
  /** Updated task priority (optional) */
  priority?: TaskPriority;
  /** Updated assigned user (optional) */
  assignedTo?: Id<'userProfiles'>;
  /** Updated due date (optional) */
  dueDate?: number;
  /** Updated metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Data structure for completing a task
 */
export interface CompleteTaskData {
  /** The task ID to complete */
  taskId: TaskId;
  /** Completion notes (optional) */
  notes?: string;
  /** Additional completion metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Template definition for automatic task generation
 */
export interface TaskTemplate {
  /** Shipment status that triggers this task */
  shipmentStatus: string;
  /** Service type this template applies to */
  serviceType: 'OBC' | 'NFO' | 'both';
  /** Title of the generated task */
  taskTitle: string;
  /** Description of the generated task */
  taskDescription: string;
  /** Priority level for the generated task */
  priority: TaskPriority;
  /** Minutes after status change when task is due (optional) */
  dueAfterMinutes?: number;
  /** Whether to auto-assign to shipment creator (optional) */
  autoAssign?: boolean;
  /** Required documents for this task (optional) */
  requiredDocuments?: string[];
  /** Additional metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Filter criteria for querying tasks
 */
export interface TaskFilters {
  /** Filter by task statuses */
  status?: TaskStatus[];
  /** Filter by task priorities */
  priority?: TaskPriority[];
  /** Filter by assigned users */
  assignedTo?: Id<'userProfiles'>[];
  /** Filter by shipments */
  shipmentId?: Id<'yourobcShipments'>[];
  /** Filter by task types */
  type?: TaskType[];
  /** Filter to show only overdue tasks */
  overdue?: boolean;
  /** Filter to show only tasks due today */
  dueToday?: boolean;
  /** Filter by date range */
  dateRange?: {
    /** Start of date range (Unix timestamp) */
    start: number;
    /** End of date range (Unix timestamp) */
    end: number;
  };
}

/**
 * Options for listing tasks with pagination and sorting
 */
export interface TaskListOptions {
  /** Maximum number of tasks to return */
  limit?: number;
  /** Number of tasks to skip (for pagination) */
  offset?: number;
  /** Field to sort by */
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'status';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Filter criteria */
  filters?: TaskFilters;
}

/**
 * Aggregated statistics about tasks
 */
export interface TaskStats {
  /** Total number of tasks */
  totalTasks: number;
  /** Number of pending tasks */
  pendingTasks: number;
  /** Number of in-progress tasks */
  inProgressTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Number of overdue tasks */
  overdueTasks: number;
  /** Number of tasks due today */
  dueTodayTasks: number;
  /** Task counts by priority level */
  tasksByPriority: Record<TaskPriority, number>;
  /** Task counts by status */
  tasksByStatus: Record<TaskStatus, number>;
  /** Average completion time in hours */
  avgCompletionTime: number;
}
