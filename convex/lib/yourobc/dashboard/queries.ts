// convex/lib/yourobc/dashboard/queries.ts
/**
 * Dashboard Query Functions
 *
 * Database query operations for dashboard alert acknowledgments following the
 * standardized Convex template.
 */

import { query } from '@/generated/server';
import { v } from 'convex/values';

import { userProfileIdSchema } from '@/schema/base';
import { DASHBOARD_ERROR_MESSAGES, DASHBOARD_TABLES } from './constants';
import {
  DashboardAlertAcknowledgmentDoc,
  DashboardAlertAcknowledgmentId,
  DashboardAlertAcknowledgmentQueryOptions,
  DashboardAlertAcknowledgmentUserId,
  DashboardAlertStatus,
} from './types';
import { assertCanReadDashboardAlertAcknowledgment, requireDashboardUser } from './permissions';

async function fetchAcknowledgmentById(
  ctx: any,
  id: DashboardAlertAcknowledgmentId
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  return ctx.db.get(id);
}

async function fetchAcknowledgmentByPublicId(
  ctx: any,
  publicId: string
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  return ctx.db
    .query(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS)
    .withIndex('by_publicId', (q: any) => q.eq('publicId', publicId))
    .first();
}

async function fetchAcknowledgmentByUserAndAlert(
  ctx: any,
  userId: DashboardAlertAcknowledgmentUserId,
  alertId: string
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  return ctx.db
    .query(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS)
    .withIndex('by_userId_and_alertId', (q: any) =>
      q.eq('userId', userId).eq('alertId', alertId)
    )
    .first();
}

function applySoftDeleteFilter(queryBuilder: any, includeDeleted?: boolean) {
  if (includeDeleted) {
    return queryBuilder;
  }

  return queryBuilder.filter((q: any) => q.eq(q.field('deletedAt'), undefined));
}

export const getDashboardAlertAcknowledgmentById = query({
  args: { id: v.id(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS) },
  handler: async (ctx, { id }) => {
    const acknowledgment = await fetchAcknowledgmentById(ctx, id);
    return acknowledgment && acknowledgment.deletedAt === undefined ? acknowledgment : null;
  },
});

export const getDashboardAlertAcknowledgmentByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const acknowledgment = await fetchAcknowledgmentByPublicId(ctx, publicId);
    return acknowledgment && acknowledgment.deletedAt === undefined ? acknowledgment : null;
  },
});

export const getDashboardAlertAcknowledgmentByUserAndAlert = query({
  args: {
    userId: userProfileIdSchema,
    alertId: v.string(),
  },
  handler: async (ctx, { userId, alertId }) => {
    await requireDashboardUser(ctx, userId);
    const acknowledgment = await fetchAcknowledgmentByUserAndAlert(ctx, userId, alertId);

    if (!acknowledgment || acknowledgment.deletedAt !== undefined) {
      return null;
    }

    await assertCanReadDashboardAlertAcknowledgment(ctx, acknowledgment);
    return acknowledgment;
  },
});

export const listDashboardAlertAcknowledgments = query({
  args: {
    userId: v.optional(userProfileIdSchema),
    alertId: v.optional(v.string()),
    ownerId: v.optional(userProfileIdSchema),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<DashboardAlertAcknowledgmentDoc[]> => {
    const { userId, alertId, ownerId, includeDeleted = false } =
      args satisfies DashboardAlertAcknowledgmentQueryOptions;

    let queryBuilder: any = ctx.db.query(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS);

    if (userId) {
      await requireDashboardUser(ctx, userId);
      queryBuilder = queryBuilder.withIndex('by_userId_and_deletedAt', (q: any) =>
        q.eq('userId', userId)
      );
    } else if (ownerId) {
      await requireDashboardUser(ctx, ownerId);
      queryBuilder = queryBuilder.withIndex('by_ownerId_and_deletedAt', (q: any) =>
        q.eq('ownerId', ownerId)
      );
    } else if (alertId) {
      queryBuilder = queryBuilder.withIndex('by_alertId', (q: any) => q.eq('alertId', alertId));
    }

    const acknowledgments = await applySoftDeleteFilter(queryBuilder, includeDeleted).collect();
    return acknowledgments;
  },
});

export const getAlertStatus = query({
  args: {
    userId: userProfileIdSchema,
    alertId: v.string(),
  },
  handler: async (ctx, { userId, alertId }): Promise<DashboardAlertStatus> => {
    await requireDashboardUser(ctx, userId);
    const acknowledgment = await fetchAcknowledgmentByUserAndAlert(ctx, userId, alertId);

    return {
      alertId,
      isAcknowledged: acknowledgment !== null && acknowledgment.deletedAt === undefined,
      acknowledgedAt: acknowledgment?.acknowledgedAt,
    } satisfies DashboardAlertStatus;
  },
});

export const getAlertStatuses = query({
  args: {
    userId: userProfileIdSchema,
    alertIds: v.array(v.string()),
  },
  handler: async (ctx, { userId, alertIds }) => {
    await requireDashboardUser(ctx, userId);

    const statuses = await Promise.all(
      alertIds.map(async (alertId) => {
        const acknowledgment = await fetchAcknowledgmentByUserAndAlert(ctx, userId, alertId);
        return {
          alertId,
          isAcknowledged: acknowledgment !== null && acknowledgment.deletedAt === undefined,
          acknowledgedAt: acknowledgment?.acknowledgedAt,
        } satisfies DashboardAlertStatus;
      })
    );

    return statuses;
  },
});

export async function findDashboardAlertAcknowledgmentForMutation(
  ctx: any,
  publicId: string
): Promise<DashboardAlertAcknowledgmentDoc> {
  const acknowledgment = await fetchAcknowledgmentByPublicId(ctx, publicId);

  if (!acknowledgment || acknowledgment.deletedAt !== undefined) {
    throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_NOT_FOUND);
  }

  return acknowledgment;
}

export async function findActiveAcknowledgmentByUserAndAlert(
  ctx: any,
  userId: DashboardAlertAcknowledgmentUserId,
  alertId: string
): Promise<DashboardAlertAcknowledgmentDoc | null> {
  const acknowledgment = await fetchAcknowledgmentByUserAndAlert(ctx, userId, alertId);
  return acknowledgment && acknowledgment.deletedAt === undefined ? acknowledgment : null;
}
