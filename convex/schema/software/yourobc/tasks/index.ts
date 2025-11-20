// convex/schema/software/yourobc/tasks/index.ts
/**
 * Tasks Schema Module
 *
 * Barrel export for the tasks schema module.
 * Provides a single entry point for importing all task-related schemas,
 * validators, and types.
 *
 * @module convex/schema/software/yourobc/tasks
 */

// Schema exports
export { tasksSchemas, default as defaultSchemas } from './schemas'
export { default as tasksTable } from './tasks'

// Validator exports
export {
  taskStatusValidator,
  taskTypeValidator,
  taskPriorityValidator,
  taskVisibilityValidator,
  tasksValidators,
} from './validators'

// Type exports
export type {
  TaskStatus,
  TaskType,
  TaskPriority,
  TaskVisibility,
} from './types'

export { tasksTypes } from './types'
