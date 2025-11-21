// convex/schema/software/yourobc/employeeSessions/index.ts
/**
 * Employee Sessions Schema Module
 *
 * Barrel export for the employee sessions schema module.
 * Provides a single entry point for importing all employee session-related schemas,
 * validators, and types including both sessions and work hours summary tables.
 *
 * @module convex/schema/software/yourobc/employeeSessions
 */

// Schema exports
export { employeeSessionsSchemas, default as defaultSchemas } from './schemas'
export { default as employeeSessionsTable } from './employeeSessions'
export { default as workHoursSummaryTable } from './workHoursSummary'

// Validator exports
export {
  sessionTypeValidator,
  breakTypeValidator,
  deviceSchema,
  breakSchema,
  employeeSessionsValidators,
} from './validators'

// Type exports
export type {
  SessionType,
  BreakType,
  DeviceInfo,
  BreakEntry,
} from './types'

export { employeeSessionsTypes } from './types'
