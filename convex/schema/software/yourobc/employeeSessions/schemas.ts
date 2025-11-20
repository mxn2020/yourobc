// convex/schema/software/yourobc/employeeSessions/schemas.ts
/**
 * Employee Sessions Schemas Export
 *
 * Exports both employee sessions and work hours summary table schemas
 * for inclusion in the main database schema.
 * This file serves as the single source of truth for all employee session schemas.
 *
 * @module convex/schema/software/yourobc/employeeSessions/schemas
 */

import { employeeSessionsTable } from './employeeSessions'
import { workHoursSummaryTable } from './workHoursSummary'

// ============================================================================
// Schema Export
// ============================================================================

/**
 * Employee Sessions schemas
 * Exports all table definitions for the employee sessions entity
 */
export const employeeSessionsSchemas = {
  yourobcEmployeeSessions: employeeSessionsTable,
  yourobcWorkHoursSummary: workHoursSummaryTable,
} as const

export default employeeSessionsSchemas
