// convex/lib/yourobc/statistics/operating_costs/constants.ts
/**
 * Operating Costs Module Constants
 *
 * This file contains business constants for the operating costs module.
 *
 * @module convex/lib/yourobc/statistics/operating_costs/constants
 */

/**
 * Operating costs-related constants for business logic, limits, and permissions
 */
export const OPERATING_COSTS_CONSTANTS = {
  /**
   * Permission strings for operating costs operations
   */
  PERMISSIONS: {
    /** Permission to view operating costs */
    VIEW: 'statistics.costs.view',
    /** Permission to manage operating costs (create/update) */
    MANAGE: 'statistics.costs.manage',
    /** Permission to delete operating costs */
    DELETE: 'statistics.costs.delete',
    /** Permission to approve expenses */
    APPROVE: 'statistics.costs.approve',
  },
} as const;
