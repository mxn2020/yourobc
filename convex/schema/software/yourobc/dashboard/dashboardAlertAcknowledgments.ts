// convex/schema/software/yourobc/dashboard/dashboardAlertAcknowledgments.ts
/**
 * Dashboard Alert Acknowledgments Table Definition
 *
 * Tracks which dashboard alerts have been acknowledged by users.
 * Since alerts are dynamically generated based on business conditions,
 * this table stores user acknowledgment state to prevent showing
 * the same alert repeatedly until conditions change.
 */

import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Dashboard Alert Acknowledgments Table
 *
 * This table stores acknowledgment records for dashboard alerts.
 * Each record indicates that a specific user has acknowledged a specific alert.
 */
export const dashboardAlertAcknowledgmentsTable = defineTable({
  // Unique public identifier for this acknowledgment
  publicId: v.string(),

  // Owner of this acknowledgment (user who acknowledged)
  ownerId: v.string(),

  // User who acknowledged the alert (same as ownerId for this entity)
  userId: v.string(),

  // Alert identifier (e.g., 'alert-overdue-shipments', 'alert-overdue-invoices')
  alertId: v.string(),

  // Timestamp when the alert was acknowledged
  acknowledgedAt: v.number(),

  // Audit fields
  createdAt: v.number(),
  updatedAt: v.number(),

  // Soft delete support
  deletedAt: v.optional(v.number()),
})
  // Primary lookup by publicId
  .index('by_publicId', ['publicId'])

  // Lookup by owner
  .index('by_ownerId', ['ownerId'])

  // Lookup by user
  .index('by_userId', ['userId'])

  // Lookup by user and alert (for checking if a specific alert has been acknowledged)
  .index('by_userId_and_alertId', ['userId', 'alertId'])

  // Lookup by alert (for finding all users who acknowledged a specific alert)
  .index('by_alertId', ['alertId'])

  // Soft delete queries
  .index('by_deletedAt', ['deletedAt'])

  // Active records by user
  .index('by_userId_and_deletedAt', ['userId', 'deletedAt'])

  // Active records by owner
  .index('by_ownerId_and_deletedAt', ['ownerId', 'deletedAt']);
