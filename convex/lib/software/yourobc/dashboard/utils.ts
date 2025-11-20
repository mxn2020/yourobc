// convex/lib/software/yourobc/dashboard/utils.ts
/**
 * Dashboard Utility Functions
 *
 * Helper functions for dashboard-related operations.
 */

import { v } from 'convex/values';
import { DashboardAlertAcknowledgmentDoc } from './types';

/**
 * Generate a unique public ID for a dashboard alert acknowledgment
 */
export function generateDashboardAlertAcknowledgmentPublicId(
  userId: string,
  alertId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ack_${userId.substring(0, 8)}_${alertId}_${timestamp}_${random}`;
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
 * Validate alert ID format
 */
export function isValidAlertId(alertId: string): boolean {
  // Alert IDs should follow the pattern: alert-{category}-{description}
  const alertIdPattern = /^alert-[a-z0-9-]+$/;
  return alertIdPattern.test(alertId);
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
