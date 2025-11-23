// convex/schema/yourobc/dashboard/validators.ts
/**
 * Dashboard Validators
 *
 * Convex validators for dashboard-related data structures following
 * the standardized template in `convex/_templates`.
 */

import { v } from 'convex/values';

import { userProfileIdSchema } from '@/schema/base';

/**
 * Core field definitions for dashboard tables
 */
export const dashboardFields = {
  alertAcknowledgment: v.object({
    publicId: v.string(),
    ownerId: userProfileIdSchema,
    userId: userProfileIdSchema,
    alertId: v.string(),
    acknowledgedAt: v.number(),
  }),
} as const;

/**
 * Operation-level validators for dashboard alert acknowledgments
 */
export const dashboardValidators = {
  createAlertAcknowledgmentInput: v.object({
    userId: userProfileIdSchema,
    alertId: v.string(),
  }),

  updateAlertAcknowledgmentInput: v.object({
    publicId: v.string(),
    acknowledgedAt: v.optional(v.number()),
  }),
} as const;
