// convex/schema/yourobc/dashboard/validators.ts
/**
 * Dashboard Validators
 *
 * Convex validators for dashboard-related data structures.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for dashboard module
 */
export const dashboardValidators = {
  createAlertAcknowledgment: v.object({
    userId: v.string(),
    alertId: v.string(),
  }),

  updateAlertAcknowledgment: v.object({
    publicId: v.string(),
    acknowledgedAt: v.optional(v.number()),
  }),
} as const;

/**
 * Complex object schemas for dashboard module
 */
export const dashboardFields = {
  alertAcknowledgment: v.object({
    publicId: v.string(),
    ownerId: v.string(),
    userId: v.string(),
    alertId: v.string(),
    acknowledgedAt: v.number(),
  }),
} as const;
