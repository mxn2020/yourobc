// convex/lib/yourobc/statistics/employee_kpis/constants.ts
/**
 * Employee KPI Module Constants
 *
 * This file contains business constants for the employee KPIs module.
 *
 * @module convex/lib/yourobc/statistics/employee_kpis/constants
 */

/**
 * Employee KPI-related constants for business logic, limits, and permissions
 */
export const EMPLOYEE_KPI_CONSTANTS = {
  /**
   * Permission strings for employee KPI operations
   */
  PERMISSIONS: {
    /** Permission to view employee KPIs */
    VIEW: 'statistics.kpis.view',
    /** Permission to manage KPI targets (set/update) */
    MANAGE: 'statistics.kpis.manage',
    /** Permission to delete KPI targets */
    DELETE: 'statistics.kpis.delete',
    /** Permission to cache/calculate KPIs */
    CACHE: 'statistics.kpis.cache',
  },
} as const;
