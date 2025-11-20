// convex/lib/yourobc/dashboard/mutations.ts
/**
 * Dashboard Mutations
 *
 * This module contains mutation functions for managing dashboard interactions,
 * particularly alert acknowledgments.
 *
 * @module convex/lib/yourobc/dashboard/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';

/**
 * Acknowledges a dashboard alert for the current user.
 *
 * Alerts in the YourOBC dashboard are dynamically generated based on business
 * conditions (e.g., overdue shipments, expired quotes). This mutation tracks
 * which alerts have been acknowledged by users, preventing them from showing
 * repeatedly until the underlying condition changes.
 *
 * @param authUserId - The ID of the authenticated user
 * @param alertId - The unique identifier of the alert to acknowledge
 * @returns The ID of the acknowledgment record
 *
 * @example
 * ```typescript
 * await acknowledgeAlert({
 *   authUserId: ctx.auth.userId,
 *   alertId: 'alert-overdue-shipments'
 * })
 * ```
 */
export const acknowledgeAlert = mutation({
  args: {
    authUserId: v.string(),
    alertId: v.string(),
  },
  handler: async (ctx, { authUserId, alertId }) => {
    const user = await requireCurrentUser(ctx, authUserId);

    // Check if this alert has already been acknowledged by this user
    const existingAcknowledgment = await ctx.db
      .query('yourobcDashboardAlertAcknowledgments')
      .withIndex('by_user_and_alert', (q) =>
        q.eq('userId', authUserId).eq('alertId', alertId)
      )
      .first();

    if (existingAcknowledgment) {
      // Update the existing acknowledgment timestamp
      await ctx.db.patch(existingAcknowledgment._id, {
        acknowledgedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existingAcknowledgment._id;
    }

    // Create a new acknowledgment record
    const acknowledgmentId = await ctx.db.insert('yourobcDashboardAlertAcknowledgments', {
      userId: authUserId,
      alertId,
      acknowledgedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return acknowledgmentId;
  },
});

/**
 * Clears (un-acknowledges) a dashboard alert for the current user.
 *
 * This allows users to restore an alert they previously acknowledged,
 * useful when they want to track it again.
 *
 * @param authUserId - The ID of the authenticated user
 * @param alertId - The unique identifier of the alert to clear
 * @returns True if the acknowledgment was cleared, false if it didn't exist
 */
export const clearAlertAcknowledgment = mutation({
  args: {
    authUserId: v.string(),
    alertId: v.string(),
  },
  handler: async (ctx, { authUserId, alertId }) => {
    await requireCurrentUser(ctx, authUserId);

    const acknowledgment = await ctx.db
      .query('yourobcDashboardAlertAcknowledgments')
      .withIndex('by_user_and_alert', (q) =>
        q.eq('userId', authUserId).eq('alertId', alertId)
      )
      .first();

    if (acknowledgment) {
      await ctx.db.delete(acknowledgment._id);
      return true;
    }

    return false;
  },
});

/**
 * Clears all alert acknowledgments for the current user.
 *
 * Useful for 'reset all' functionality or when a user wants to
 * see all alerts again.
 *
 * @param authUserId - The ID of the authenticated user
 * @returns The number of acknowledgments cleared
 */
export const clearAllAlertAcknowledgments = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const acknowledgments = await ctx.db
      .query('yourobcDashboardAlertAcknowledgments')
      .withIndex('by_user', (q) => q.eq('userId', authUserId))
      .collect();

    let count = 0;
    for (const ack of acknowledgments) {
      await ctx.db.delete(ack._id);
      count++;
    }

    return count;
  },
});
