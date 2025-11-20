// convex/lib/yourobc/tasks/constants.ts
/**
 * Task Module Constants
 *
 * This file contains business constants for the tasks module.
 * No validators are defined here - they are imported from schema/yourobc/base.
 *
 * @module convex/lib/yourobc/tasks/constants
 */

/**
 * Task-related constants for business logic, limits, and permissions
 */
export const TASK_CONSTANTS = {
  /**
   * Task status constants (for reference only - validators in schema/yourobc/base)
   */
  STATUS: {
    /** Task is pending and not yet started */
    PENDING: 'pending' as const,
    /** Task is currently being worked on */
    IN_PROGRESS: 'in_progress' as const,
    /** Task has been completed */
    COMPLETED: 'completed' as const,
    /** Task has been cancelled */
    CANCELLED: 'cancelled' as const,
  },

  /**
   * Task priority constants (for reference only - validators in schema/yourobc/base)
   */
  PRIORITY: {
    /** Low priority task */
    LOW: 'low' as const,
    /** Medium priority task */
    MEDIUM: 'medium' as const,
    /** High priority task */
    HIGH: 'high' as const,
    /** Critical priority task - requires immediate attention */
    CRITICAL: 'critical' as const,
  },

  /**
   * Field length and validation limits
   */
  LIMITS: {
    /** Maximum length for task titles */
    MAX_TITLE_LENGTH: 200,
    /** Maximum length for task descriptions and notes */
    MAX_DESCRIPTION_LENGTH: 2000,
  },

  /**
   * Permission strings for task operations
   */
  PERMISSIONS: {
    /** Permission to view tasks */
    VIEW: 'tasks.view',
    /** Permission to create new tasks */
    CREATE: 'tasks.create',
    /** Permission to edit existing tasks */
    EDIT: 'tasks.edit',
    /** Permission to delete tasks */
    DELETE: 'tasks.delete',
    /** Permission to assign tasks to users */
    ASSIGN: 'tasks.assign',
  },
} as const;
