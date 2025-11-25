// convex/lib/yourobc/dashboard/utils.ts
/**
 * Dashboard Utility Functions
 *
 * Helper functions for dashboard-related operations.
 */

import { DashboardAlertAcknowledgmentDoc } from './types';
import { ALERT_ID_PATTERN, DASHBOARD_ERROR_MESSAGES } from './constants';

// ============================================================================
// Validation and Normalization Functions
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique public ID for a dashboard alert acknowledgment
 */
export function generateDashboardAlertAcknowledgmentPublicId(
  userId: string,
  alertId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ack_${userId.substring(0, 8)}_${normalizeAlertId(alertId)}_${timestamp}_${random}`;
}

/**
 * Check if a dashboard alert acknowledgment is active (not soft-deleted)
 */
export function isDashboardAlertAcknowledgmentActive(
  acknowledgment: DashboardAlertAcknowledgmentDoc | null
): boolean {
  return acknowledgment !== null && acknowledgment.deletedAt === undefined;
}

/**
 * Check if an alert has been acknowledged by a user
 */
export function isAlertAcknowledgedByUser(
  acknowledgment: DashboardAlertAcknowledgmentDoc | null
): boolean {
  return isDashboardAlertAcknowledgmentActive(acknowledgment);
}

/**
 * Format acknowledgment timestamp for display
 */
export function formatAcknowledgmentTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Get acknowledgment age in milliseconds
 */
export function getAcknowledgmentAge(acknowledgment: DashboardAlertAcknowledgmentDoc): number {
  return Date.now() - acknowledgment.acknowledgedAt;
}

/**
 * Check if acknowledgment is recent (within last 24 hours)
 */
export function isRecentAcknowledgment(
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  thresholdMs: number = 24 * 60 * 60 * 1000 // 24 hours
): boolean {
  return getAcknowledgmentAge(acknowledgment) < thresholdMs;
}
