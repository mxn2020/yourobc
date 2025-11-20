// convex/schema/software/yourobc/tasks/schemas.ts
/**
 * Tasks Schemas Export
 *
 * Exports the tasks table schema for inclusion in the main database schema.
 * This file serves as the single source of truth for all task schemas.
 *
 * @module convex/schema/software/yourobc/tasks/schemas
 */

import { tasksTable } from './tasks'

// ============================================================================
// Schema Export
// ============================================================================

/**
 * Tasks schemas
 * Exports all table definitions for the tasks entity
 */
export const tasksSchemas = {
  yourobcTasks: tasksTable,
} as const

export default tasksSchemas
