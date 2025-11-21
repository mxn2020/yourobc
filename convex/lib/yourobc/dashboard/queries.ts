// convex/lib/yourobc/dashboard/queries.ts
/**
 * Dashboard Query Functions
 *
 * Database query operations for dashboard alert acknowledgments.
 */

import { QueryCtx } from '../../../_generated/server';
import {
  DashboardAlertAcknowledgmentDoc,
  DashboardAlertAcknowledgmentId,
  DashboardAlertAcknowledgmentQueryOptions,
  DashboardAlertStatus,
} from './types';
import { DASHBOARD_ERROR_MESSAGES } from './constants';

/**
 * Get a dashboard alert acknowledgment by its internal ID
 */
export async function getDashboardAlertAcknowledgmentById(
  ctx: QueryCtx,
  id: DashboardAlertAcknowledgmentId
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  return await ctx.db.get(id);
}

/**
 * Get a dashboard alert acknowledgment by its public ID
 */
export async function getDashboardAlertAcknowledgmentByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  const acknowledgment = await ctx.db
    .query('dashboardAlertAcknowledgments')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .first();

  return acknowledgment;
}

/**
 * Get a dashboard alert acknowledgment by user and alert ID
 */
export async function getDashboardAlertAcknowledgmentByUserAndAlert(
  ctx: QueryCtx,
  userId: string,
  alertId: string
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  const acknowledgment = await ctx.db
    .query('dashboardAlertAcknowledgments')
    .withIndex('by_userId_and_alertId', (q) =>
      q.eq('userId', userId).eq('alertId', alertId)
    )
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  return acknowledgment;
}

/**
 * List dashboard alert acknowledgments by user
 */
export async function listDashboardAlertAcknowledgmentsByUser(
  ctx: QueryCtx,
  userId: string,
  includeDeleted: boolean = false
): Promise<DashboardAlertAcknowledgmentDoc[]> {
  let query = ctx.db
    .query('dashboardAlertAcknowledgments')
    .withIndex('by_userId_and_deletedAt', (q) => q.eq('userId', userId));

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined));
  }

  return await query.collect();
}

/**
 * List dashboard alert acknowledgments by alert ID
 */
export async function listDashboardAlertAcknowledgmentsByAlert(
  ctx: QueryCtx,
  alertId: string,
  includeDeleted: boolean = false
): Promise<DashboardAlertAcknowledgmentDoc[]> {
  let query = ctx.db
    .query('dashboardAlertAcknowledgments')
    .withIndex('by_alertId', (q) => q.eq('alertId', alertId));

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined));
  }

  return await query.collect();
}

/**
 * List dashboard alert acknowledgments by owner
 */
export async function listDashboardAlertAcknowledgmentsByOwner(
  ctx: QueryCtx,
  ownerId: string,
  includeDeleted: boolean = false
): Promise<DashboardAlertAcknowledgmentDoc[]> {
  let query = ctx.db
    .query('dashboardAlertAcknowledgments')
    .withIndex('by_ownerId_and_deletedAt', (q) => q.eq('ownerId', ownerId));

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined));
  }

  return await query.collect();
}

/**
 * List all dashboard alert acknowledgments with optional filters
 */
export async function listDashboardAlertAcknowledgments(
  ctx: QueryCtx,
  options: DashboardAlertAcknowledgmentQueryOptions = {}
): Promise<DashboardAlertAcknowledgmentDoc[]> {
  const { userId, alertId, ownerId, includeDeleted = false } = options;

  // Use the most specific index available
  if (userId && alertId) {
    return await getDashboardAlertAcknowledgmentByUserAndAlert(ctx, userId, alertId).then(
      (ack) => (ack ? [ack] : [])
    );
  }

  if (userId) {
    return await listDashboardAlertAcknowledgmentsByUser(ctx, userId, includeDeleted);
  }

  if (ownerId) {
    return await listDashboardAlertAcknowledgmentsByOwner(ctx, ownerId, includeDeleted);
  }

  if (alertId) {
    return await listDashboardAlertAcknowledgmentsByAlert(ctx, alertId, includeDeleted);
  }

  // No filters - return all active acknowledgments
  let query = ctx.db.query('dashboardAlertAcknowledgments');

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined));
  }

  return await query.collect();
}

/**
 * Check if an alert has been acknowledged by a user
 */
export async function isAlertAcknowledged(
  ctx: QueryCtx,
  userId: string,
  alertId: string
): Promise<boolean> {
  const acknowledgment = await getDashboardAlertAcknowledgmentByUserAndAlert(
    ctx,
    userId,
    alertId
  );
  return acknowledgment !== null && acknowledgment.deletedAt === undefined;
}

/**
 * Get alert acknowledgment status for a user
 */
export async function getAlertStatus(
  ctx: QueryCtx,
  userId: string,
  alertId: string
): Promise<DashboardAlertStatus> {
  const acknowledgment = await getDashboardAlertAcknowledgmentByUserAndAlert(
    ctx,
    userId,
    alertId
  );

  return {
    alertId,
    isAcknowledged: acknowledgment !== null && acknowledgment.deletedAt === undefined,
    acknowledgedAt: acknowledgment?.acknowledgedAt,
  };
}

/**
 * Get alert statuses for multiple alerts for a user
 */
export async function getAlertStatuses(
  ctx: QueryCtx,
  userId: string,
  alertIds: string[]
): Promise<DashboardAlertStatus[]> {
  const statuses = await Promise.all(
    alertIds.map((alertId) => getAlertStatus(ctx, userId, alertId))
  );
  return statuses;
}

/**
 * Count dashboard alert acknowledgments by user
 */
export async function countDashboardAlertAcknowledgmentsByUser(
  ctx: QueryCtx,
  userId: string
): Promise<number> {
  const acknowledgments = await listDashboardAlertAcknowledgmentsByUser(ctx, userId, false);
  return acknowledgments.length;
}

/**
 * Count dashboard alert acknowledgments by alert
 */
export async function countDashboardAlertAcknowledgmentsByAlert(
  ctx: QueryCtx,
  alertId: string
): Promise<number> {
  const acknowledgments = await listDashboardAlertAcknowledgmentsByAlert(ctx, alertId, false);
  return acknowledgments.length;
}
