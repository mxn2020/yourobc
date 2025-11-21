// convex/schema/yourobc/dashboard/validators.ts
/**
 * Dashboard Validators
 *
 * Convex validators for dashboard-related data structures.
 * These validators define the shape and validation rules for dashboard data.
 */

import { v } from 'convex/values';

/**
 * Dashboard Alert Acknowledgment Validator
 *
 * Tracks which dashboard alerts have been acknowledged by users.
 * Since alerts are dynamically generated based on business conditions,
 * this stores user acknowledgment state to prevent showing the same
 * alert repeatedly until conditions change.
 */
export const dashboardAlertAcknowledgmentValidator = v.object({
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
});

/**
 * Input validator for creating a dashboard alert acknowledgment
 */
export const createDashboardAlertAcknowledgmentValidator = v.object({
  userId: v.string(),
  alertId: v.string(),
});

/**
 * Input validator for updating a dashboard alert acknowledgment
 */
export const updateDashboardAlertAcknowledgmentValidator = v.object({
  publicId: v.string(),
  acknowledgedAt: v.optional(v.number()),
});
