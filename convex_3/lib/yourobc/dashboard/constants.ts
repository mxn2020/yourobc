// convex/lib/yourobc/dashboard/constants.ts
/**
 * Dashboard Constants
 *
 * Constant values used throughout the dashboard module.
 */

/**
 * Dashboard table names
 */
export const DASHBOARD_TABLES = {
  ALERT_ACKNOWLEDGMENTS: 'dashboardAlertAcknowledgments',
} as const;

/**
 * Common alert IDs used in the system
 */
export const ALERT_IDS = {
 OVERDUE_SHIPMENTS: 'alert-overdue-shipments',
  OVERDUE_INVOICES: 'alert-overdue-invoices',
  LOW_INVENTORY: 'alert-low-inventory',
  PENDING_APPROVALS: 'alert-pending-approvals',
} as const;

/**
 * Regex for validating dashboard alert identifiers
 */
export const ALERT_ID_PATTERN = /^alert-[a-z0-9-]+$/;

/**
 * Error messages
 */
export const DASHBOARD_ERROR_MESSAGES = {
  ACKNOWLEDGMENT_NOT_FOUND: 'Dashboard alert acknowledgment not found',
  ACKNOWLEDGMENT_ALREADY_EXISTS: 'Alert already acknowledged by this user',
  INVALID_ALERT_ID: 'Invalid alert ID',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to dashboard alert acknowledgment',
} as const;
