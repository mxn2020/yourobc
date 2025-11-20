// convex/schema/yourobc/dashboard.ts
/**
 * Dashboard Schema Definitions
 *
 * Defines database tables for YourOBC dashboard functionality,
 * including alert acknowledgments and dashboard preferences.
 */

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Alert Acknowledgments Table
 *
 * Tracks which dashboard alerts have been acknowledged by users.
 * Since alerts are dynamically generated based on business conditions,
 * this table stores user acknowledgment state to prevent showing
 * the same alert repeatedly until conditions change.
 */
export const dashboardAlertAcknowledgmentsTable = defineTable({
  userId: v.string(),
  alertId: v.string(), // e.g., 'alert-overdue-shipments', 'alert-overdue-invoices'
  acknowledgedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_user_and_alert', ['userId', 'alertId'])
  .index('by_alert', ['alertId']);
