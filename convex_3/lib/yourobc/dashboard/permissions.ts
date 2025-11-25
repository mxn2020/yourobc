// convex/lib/yourobc/dashboard/permissions.ts
/**
 * Dashboard Permissions
 *
 * Permission checking and authorization logic for dashboard operations.
 */

import { MutationCtx, QueryCtx } from '../../../_generated/server';

import { DASHBOARD_ERROR_MESSAGES } from './constants';
import { DashboardAlertAcknowledgmentDoc, DashboardAlertAcknowledgmentUserId } from './types';

/**
 * Check if user can create a dashboard alert acknowledgment
 */
export async function requireDashboardUser(
  ctx: QueryCtx | MutationCtx,
  expectedUserId?: DashboardAlertAcknowledgmentUserId
): Promise<DashboardAlertAcknowledgmentUserId> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }

  const authenticatedUserId = identity.subject as DashboardAlertAcknowledgmentUserId;

  if (expectedUserId && authenticatedUserId !== expectedUserId) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }

  return authenticatedUserId;
}

/**
 * Check if user can read a dashboard alert acknowledgment
 */
function canAccessAcknowledgment(
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  userId: DashboardAlertAcknowledgmentUserId
): boolean {
  return acknowledgment.userId === userId || acknowledgment.ownerId === userId;
}

export async function assertCanCreateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  userId: DashboardAlertAcknowledgmentUserId
): Promise<DashboardAlertAcknowledgmentUserId> {
  return requireDashboardUser(ctx, userId);
}

export async function assertCanReadDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc
): Promise<DashboardAlertAcknowledgmentUserId> {
  const userId = await requireDashboardUser(ctx);

  if (!canAccessAcknowledgment(acknowledgment, userId)) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }

  return userId;
}

export async function assertCanUpdateDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc
): Promise<void> {
  await assertCanReadDashboardAlertAcknowledgment(ctx, acknowledgment);
}

export async function assertCanDeleteDashboardAlertAcknowledgment(
  ctx: QueryCtx | MutationCtx,
  acknowledgment: DashboardAlertAcknowledgmentDoc
): Promise<void> {
  await assertCanReadDashboardAlertAcknowledgment(ctx, acknowledgment);
}
