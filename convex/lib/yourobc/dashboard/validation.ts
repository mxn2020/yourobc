// convex/lib/yourobc/dashboard/validation.ts
/**
 * Dashboard Validation Helpers
 *
 * Input normalization and validation utilities for dashboard operations.
 */

import { ALERT_ID_PATTERN, DASHBOARD_ERROR_MESSAGES } from './constants';

/**
 * Normalize alert identifiers for consistent storage and comparison.
 */
export function normalizeAlertId(alertId: string): string {
  return alertId.trim().toLowerCase();
}

/**
 * Ensure an alert identifier matches the expected pattern.
 */
export function assertValidAlertId(alertId: string): string {
  const normalized = normalizeAlertId(alertId);

  if (!ALERT_ID_PATTERN.test(normalized)) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.INVALID_ALERT_ID);
  }

  return normalized;
}
