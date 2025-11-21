// convex/lib/software/yourobc/dashboard/permissions.ts
/**
 * Dashboard Permissions
 *
 * Permission checking and authorization logic for dashboard operations.
 */

import { QueryCtx, MutationCtx } from '../../../../_generated/server';
import { DashboardAlertAcknowledgmentDoc } from './types';
import { DASHBOARD_ERROR_MESSAGES } from './constants';

/**
 * Check if user can create a dashboard alert acknowledgment
 */
export async function canCreateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<boolean> {
  // Users can only create acknowledgments for themselves
  // In a real implementation, you would check the authenticated user
  return true;
}

/**
 * Check if user can read a dashboard alert acknowledgment
 */
export async function canReadDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<boolean> {
  // Users can only read their own acknowledgments
  if (userId && acknowledgment.userId !== userId && acknowledgment.ownerId !== userId) {
    return false;
  }
  return true;
}

/**
 * Check if user can update a dashboard alert acknowledgment
 */
export async function canUpdateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<boolean> {
  // Users can only update their own acknowledgments
  if (userId && acknowledgment.userId !== userId && acknowledgment.ownerId !== userId) {
    return false;
  }
  return true;
}

/**
 * Check if user can delete a dashboard alert acknowledgment
 */
export async function canDeleteDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<boolean> {
  // Users can only delete their own acknowledgments
  if (userId && acknowledgment.userId !== userId && acknowledgment.ownerId !== userId) {
    return false;
  }
  return true;
}

/**
 * Assert user can create a dashboard alert acknowledgment
 */
export async function assertCanCreateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<void> {
  const canCreate = await canCreateDashboardAlertAcknowledgment(ctx, userId);
  if (!canCreate) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}

/**
 * Assert user can read a dashboard alert acknowledgment
 */
export async function assertCanReadDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<void> {
  const canRead = await canReadDashboardAlertAcknowledgment(ctx, acknowledgment, userId);
  if (!canRead) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}

/**
 * Assert user can update a dashboard alert acknowledgment
 */
export async function assertCanUpdateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<void> {
  const canUpdate = await canUpdateDashboardAlertAcknowledgment(ctx, acknowledgment, userId);
  if (!canUpdate) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}

/**
 * Assert user can delete a dashboard alert acknowledgment
 */
export async function assertCanDeleteDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId?: string
): Promise<void> {
  const canDelete = await canDeleteDashboardAlertAcknowledgment(ctx, acknowledgment, userId);
  if (!canDelete) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
}
