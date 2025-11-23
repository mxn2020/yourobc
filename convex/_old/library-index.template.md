// convex/lib/boilerplate/[module_name]/index.ts

// IMPORTANT: Every entity needs a main display field (name/title/displayName)
// for UI display and auditLogs. See schema-patterns.template.md for details.

// Export constants and types
export { [MODULE]_CONSTANTS, PRIORITY_WEIGHTS } from './constants'
export * from './types'

// Export all queries
export {
  get[Entity]s,
  get[Entity],
  get[Entity]ByPublicId,
  getUser[Entity]s,
  get[Entity]Stats,
  getDashboardStats,
  get[Entity]Members,
} from './queries'

// Export all mutations
export {
  create[Entity],
  update[Entity],
  update[Entity]Progress,
  delete[Entity],
} from './mutations'

// Export utilities
export {
  calculateProgress,
  is[Entity]Overdue,
  is[Entity]AtRisk,
  get[Entity]PriorityWeight,
  validate[Entity]Data,
  get[Entity]StatusColor,
  get[Entity]PriorityColor,
  calculate[Entity]Health,
  format[Entity]Progress,
  get[Entity]TimeRemaining,
  formatTimeRemaining,
  shouldAutoArchive,
  get[Entity]Age,
  format[Entity]Age,
  compare[Entity]Priority,
  compare[Entity]DueDate,
  compare[Entity]Progress
} from './utils'

// Export permissions (if applicable)
export {
  canView[Entity],
  canEdit[Entity],
  canDelete[Entity],
  canManageTeam,
  requireViewAccess,
  requireEditAccess,
  requireDeleteAccess,
  requireTeamManagementAccess,
  filter[Entity]sByAccess,
} from './permissions'

// Export sub-modules (if applicable)
// export * as team from './team'
// export * as tasks from './tasks'

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * This index file serves as the public API for the [module_name] module.
 *
 * IMPORT PATTERN:
 *
 * For consumers of this module, import everything through this index:
 *
 * ```typescript
 * // ✅ DO: Import from module index
 * import {
 *   [MODULE]_CONSTANTS,
 *   create[Entity],
 *   get[Entity]s,
 *   type [Entity],
 *   type Create[Entity]Data
 * } from 'convex/lib/boilerplate/[module_name]'
 *
 * // ❌ DON'T: Import from individual files unless necessary
 * import { create[Entity] } from 'convex/lib/boilerplate/[module_name]/mutations'
 * ```
 *
 * MODULE STRUCTURE:
 *
 * - constants.ts: Business constants, permissions, limits
 * - types.ts: TypeScript type definitions
 * - queries.ts: Convex query functions
 * - mutations.ts: Convex mutation functions
 * - utils.ts: Helper/utility functions
 * - permissions.ts: Authorization logic (optional)
 *
 * BENEFITS:
 *
 * - One import location for consumers
 * - Clear module boundaries
 * - Easy to refactor internal structure
 * - Centralized exports show the public API
 */
