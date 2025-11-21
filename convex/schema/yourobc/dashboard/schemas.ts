// convex/schema/yourobc/dashboard/schemas.ts
/**
 * Dashboard Schema Exports
 *
 * Consolidated export of all dashboard-related database table schemas.
 */

import { dashboardAlertAcknowledgmentsTable } from './dashboardAlertAcknowledgments';

/**
 * Dashboard Schemas
 *
 * Complete set of table definitions for the dashboard module.
 */
export const yourobcDashboardSchemas = {
  dashboardAlertAcknowledgments: dashboardAlertAcknowledgmentsTable,
};
