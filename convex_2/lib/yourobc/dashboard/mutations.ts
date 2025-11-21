// convex/lib/yourobc/dashboard/mutations.ts
/**
 * Dashboard Mutation Functions
 *
 * Database mutation operations for dashboard alert acknowledgments.
 */

import { MutationCtx } from '../../../_generated/server';
import {
  DashboardAlertAcknowledgmentDoc,
  DashboardAlertAcknowledgmentId,
  CreateDashboardAlertAcknowledgmentInput,
  UpdateDashboardAlertAcknowledgmentInput,
} from './types';
import { DASHBOARD_ERROR_MESSAGES } from './constants';
import {
  getDashboardAlertAcknowledgmentByPublicId,
  getDashboardAlertAcknowledgmentByUserAndAlert,
} from './queries';
import {
  generateDashboardAlertAcknowledgmentPublicId,
  isValidAlertId,
} from './utils';
import {
  assertCanCreateDashboardAlertAcknowledgment,
  assertCanUpdateDashboardAlertAcknowledgment,
  assertCanDeleteDashboardAlertAcknowledgment,
} from './permissions';

/**
 * Create a new dashboard alert acknowledgment
 */
export async function createDashboardAlertAcknowledgment(
  ctx: MutationCtx,
  input: CreateDashboardAlertAcknowledgmentInput
): Promise<DashboardAlertAcknowledgmentId> {
  const { userId, alertId } = input;

  // Validate alert ID format
  if (!isValidAlertId(alertId)) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.INVALID_ALERT_ID);
  }

  // Check permissions
  await assertCanCreateDashboardAlertAcknowledgment(ctx, userId);

  // Check if acknowledgment already exists
  const existingAcknowledgment = await getDashboardAlertAcknowledgmentByUserAndAlert(
    ctx,
    userId,
    alertId
  );

  if (existingAcknowledgment) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_ALREADY_EXISTS);
  }

  // Generate public ID
  const publicId = generateDashboardAlertAcknowledgmentPublicId(userId, alertId);

  // Get current timestamp
  const now = Date.now();

  // Create the acknowledgment
  const acknowledgmentId = await ctx.db.insert('dashboardAlertAcknowledgments', {
    publicId,
    ownerId: userId, // Owner is the user who acknowledged
    userId,
    alertId,
    acknowledgedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return acknowledgmentId;
}

/**
 * Update an existing dashboard alert acknowledgment
 */
export async function updateDashboardAlertAcknowledgment(
  ctx: MutationCtx,
  input: UpdateDashboardAlertAcknowledgmentInput
): Promise<void> {
  const { publicId, acknowledgedAt } = input;

  // Get the acknowledgment
  const acknowledgment = await getDashboardAlertAcknowledgmentByPublicId(ctx, publicId);

  if (!acknowledgment || acknowledgment.deletedAt !== undefined) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_NOT_FOUND);
  }

  // Check permissions
  await assertCanUpdateDashboardAlertAcknowledgment(ctx, acknowledgment);

  // Prepare update data
  const updates: Partial<DashboardAlertAcknowledgmentDoc> = {
    updatedAt: Date.now(),
  };

  if (acknowledgedAt !== undefined) {
    updates.acknowledgedAt = acknowledgedAt;
  }

  // Update the acknowledgment
  await ctx.db.patch(acknowledgment._id, updates);
}

/**
 * Soft delete a dashboard alert acknowledgment
 */
export async function deleteDashboardAlertAcknowledgment(
  ctx: MutationCtx,
  publicId: string
): Promise<void> {
  // Get the acknowledgment
  const acknowledgment = await getDashboardAlertAcknowledgmentByPublicId(ctx, publicId);

  if (!acknowledgment || acknowledgment.deletedAt !== undefined) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_NOT_FOUND);
  }

  // Check permissions
  await assertCanDeleteDashboardAlertAcknowledgment(ctx, acknowledgment);

  // Soft delete the acknowledgment
  await ctx.db.patch(acknowledgment._id, {
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Hard delete a dashboard alert acknowledgment (permanent)
 */
export async function hardDeleteDashboardAlertAcknowledgment(
  ctx: MutationCtx,
  publicId: string
): Promise<void> {
  // Get the acknowledgment
  const acknowledgment = await getDashboardAlertAcknowledgmentByPublicId(ctx, publicId);

  if (!acknowledgment) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_NOT_FOUND);
  }

  // Check permissions
  await assertCanDeleteDashboardAlertAcknowledgment(ctx, acknowledgment);

  // Permanently delete the acknowledgment
  await ctx.db.delete(acknowledgment._id);
}

/**
 * Restore a soft-deleted dashboard alert acknowledgment
 */
export async function restoreDashboardAlertAcknowledgment(
  ctx: MutationCtx,
  publicId: string
): Promise<void> {
  // Get the acknowledgment
  const acknowledgment = await getDashboardAlertAcknowledgmentByPublicId(ctx, publicId);

  if (!acknowledgment) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_NOT_FOUND);
  }

  if (acknowledgment.deletedAt === undefined) {
    // Already active, nothing to do
    return;
  }

  // Check permissions
  await assertCanUpdateDashboardAlertAcknowledgment(ctx, acknowledgment);

  // Restore the acknowledgment
  await ctx.db.patch(acknowledgment._id, {
    deletedAt: undefined,
    updatedAt: Date.now(),
  });
}

/**
 * Acknowledge an alert (create or update acknowledgment)
 */
export async function acknowledgeAlert(
  ctx: MutationCtx,
  userId: string,
  alertId: string
): Promise<DashboardAlertAcknowledgmentId> {
  // Check if acknowledgment already exists
  const existingAcknowledgment = await getDashboardAlertAcknowledgmentByUserAndAlert(
    ctx,
    userId,
    alertId
  );

  if (existingAcknowledgment) {
    // Update the acknowledgment timestamp
    await updateDashboardAlertAcknowledgment(ctx, {
      publicId: existingAcknowledgment.publicId,
      acknowledgedAt: Date.now(),
    });
    return existingAcknowledgment._id;
  }

  // Create new acknowledgment
  return await createDashboardAlertAcknowledgment(ctx, {
    userId,
    alertId,
  });
}

/**
 * Unacknowledge an alert (soft delete acknowledgment)
 */
export async function unacknowledgeAlert(
  ctx: MutationCtx,
  userId: string,
  alertId: string
): Promise<void> {
  // Get the acknowledgment
  const acknowledgment = await getDashboardAlertAcknowledgmentByUserAndAlert(
    ctx,
    userId,
    alertId
  );

  if (!acknowledgment) {
    // Nothing to unacknowledge
    return;
  }

  // Soft delete the acknowledgment
  await deleteDashboardAlertAcknowledgment(ctx, acknowledgment.publicId);
}

/**
 * Bulk acknowledge multiple alerts for a user
 */
export async function acknowledgeAlerts(
  ctx: MutationCtx,
  userId: string,
  alertIds: string[]
): Promise<DashboardAlertAcknowledgmentId[]> {
  const acknowledgmentIds: DashboardAlertAcknowledgmentId[] = [];

  for (const alertId of alertIds) {
    const acknowledgmentId = await acknowledgeAlert(ctx, userId, alertId);
    acknowledgmentIds.push(acknowledgmentId);
  }

  return acknowledgmentIds;
}

/**
 * Bulk unacknowledge multiple alerts for a user
 */
export async function unacknowledgeAlerts(
  ctx: MutationCtx,
  userId: string,
  alertIds: string[]
): Promise<void> {
  for (const alertId of alertIds) {
    await unacknowledgeAlert(ctx, userId, alertId);
  }
}
