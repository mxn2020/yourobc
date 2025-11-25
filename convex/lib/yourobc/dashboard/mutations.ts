// convex/lib/yourobc/dashboard/mutations.ts
/**
 * Dashboard Mutation Functions
 *
 * Database mutation operations for dashboard alert acknowledgments following
 * the standardized Convex template.
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';

import { userProfileIdSchema } from '@/schema/base';
import { dashboardValidators } from '@/schema/yourobc/dashboard/validators';
import { DASHBOARD_ERROR_MESSAGES, DASHBOARD_TABLES } from './constants';
import {
  DashboardAlertAcknowledgmentDoc,
  DashboardAlertAcknowledgmentId,
  DashboardAlertAcknowledgmentUserId,
  CreateDashboardAlertAcknowledgmentInput,
  UpdateDashboardAlertAcknowledgmentInput,
} from './types';
import {
  assertCanCreateDashboardAlertAcknowledgment,
  assertCanDeleteDashboardAlertAcknowledgment,
  assertCanUpdateDashboardAlertAcknowledgment,
} from './permissions';
import {
  findActiveAcknowledgmentByUserAndAlert,
  findDashboardAlertAcknowledgmentForMutation,
} from './queries';
import { generateDashboardAlertAcknowledgmentPublicId, assertValidAlertId } from './utils';

function buildUpdatePayload(
  acknowledgment: DashboardAlertAcknowledgmentDoc,
  updates: Partial<DashboardAlertAcknowledgmentDoc>
): Partial<DashboardAlertAcknowledgmentDoc> {
  return {
    ...updates,
    updatedAt: Date.now(),
    createdAt: acknowledgment.createdAt,
  };
}

async function acknowledgeAlertForUser(
  ctx: any,
  userId: DashboardAlertAcknowledgmentUserId,
  alertId: string
) {
  const validatedUserId = await assertCanCreateDashboardAlertAcknowledgment(ctx, userId);
  const normalizedAlertId = assertValidAlertId(alertId);

  const existingAcknowledgment = await findActiveAcknowledgmentByUserAndAlert(
    ctx,
    validatedUserId,
    normalizedAlertId
  );

  if (existingAcknowledgment) {
    await ctx.db.patch(
      existingAcknowledgment._id,
      buildUpdatePayload(existingAcknowledgment, { acknowledgedAt: Date.now() })
    );
    return existingAcknowledgment._id;
  }

  const publicId = generateDashboardAlertAcknowledgmentPublicId(
    validatedUserId,
    normalizedAlertId
  );
  const now = Date.now();

  return ctx.db.insert(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS, {
    publicId,
    ownerId: validatedUserId,
    userId: validatedUserId,
    alertId: normalizedAlertId,
    acknowledgedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

async function unacknowledgeAlertForUser(
  ctx: any,
  userId: DashboardAlertAcknowledgmentUserId,
  alertId: string
) {
  const normalizedAlertId = assertValidAlertId(alertId);
  const validatedUserId = await assertCanCreateDashboardAlertAcknowledgment(ctx, userId);
  const acknowledgment = await findActiveAcknowledgmentByUserAndAlert(
    ctx,
    validatedUserId,
    normalizedAlertId
  );

  if (!acknowledgment) {
    return;
  }

  await assertCanDeleteDashboardAlertAcknowledgment(ctx, acknowledgment);

  await ctx.db.patch(
    acknowledgment._id,
    buildUpdatePayload(acknowledgment, { deletedAt: Date.now() })
  );
}

export const createDashboardAlertAcknowledgment = mutation({
  args: { input: dashboardValidators.createAlertAcknowledgmentInput },
  handler: async (ctx, { input }): Promise<DashboardAlertAcknowledgmentId> => {
    const validatedUserId = await assertCanCreateDashboardAlertAcknowledgment(
      ctx,
      input.userId
    );
    const normalizedAlertId = assertValidAlertId(input.alertId);

    const existingAcknowledgment = await findActiveAcknowledgmentByUserAndAlert(
      ctx,
      validatedUserId,
      normalizedAlertId
    );

    if (existingAcknowledgment) {
      throw new Error(DASHBOARD_ERROR_MESSAGES.ACKNOWLEDGMENT_ALREADY_EXISTS);
    }

    const publicId = generateDashboardAlertAcknowledgmentPublicId(
      validatedUserId,
      normalizedAlertId
    );
    const now = Date.now();

    return ctx.db.insert(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS, {
      publicId,
      ownerId: validatedUserId,
      userId: validatedUserId,
      alertId: normalizedAlertId,
      acknowledgedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDashboardAlertAcknowledgment = mutation({
  args: { input: dashboardValidators.updateAlertAcknowledgmentInput },
  handler: async (ctx, { input }): Promise<void> => {
    const acknowledgment = await findDashboardAlertAcknowledgmentForMutation(ctx, input.publicId);
    await assertCanUpdateDashboardAlertAcknowledgment(ctx, acknowledgment);

    const updates: Partial<DashboardAlertAcknowledgmentDoc> = {};

    if (input.acknowledgedAt !== undefined) {
      updates.acknowledgedAt = input.acknowledgedAt;
    }

    await ctx.db.patch(
      acknowledgment._id,
      buildUpdatePayload(acknowledgment, updates)
    );
  },
});

export const deleteDashboardAlertAcknowledgment = mutation({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }): Promise<void> => {
    const acknowledgment = await findDashboardAlertAcknowledgmentForMutation(ctx, publicId);
    await assertCanDeleteDashboardAlertAcknowledgment(ctx, acknowledgment);

    await ctx.db.patch(
      acknowledgment._id,
      buildUpdatePayload(acknowledgment, { deletedAt: Date.now() })
    );
  },
});

export const restoreDashboardAlertAcknowledgment = mutation({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }): Promise<void> => {
    const acknowledgment = await findDashboardAlertAcknowledgmentForMutation(ctx, publicId);
    await assertCanUpdateDashboardAlertAcknowledgment(ctx, acknowledgment);

    await ctx.db.patch(
      acknowledgment._id,
      buildUpdatePayload(acknowledgment, { deletedAt: undefined })
    );
  },
});

export const acknowledgeAlert = mutation({
  args: {
    userId: userProfileIdSchema,
    alertId: v.string(),
  },
  handler: async (ctx, { userId, alertId }): Promise<DashboardAlertAcknowledgmentId> => {
    const normalizedAlertId = assertValidAlertId(alertId);
    const validatedUserId = await assertCanCreateDashboardAlertAcknowledgment(ctx, userId);

    const existingAcknowledgment = await findActiveAcknowledgmentByUserAndAlert(
      ctx,
      validatedUserId,
      normalizedAlertId
    );

    if (existingAcknowledgment) {
      await ctx.db.patch(
        existingAcknowledgment._id,
        buildUpdatePayload(existingAcknowledgment, { acknowledgedAt: Date.now() })
      );
      return existingAcknowledgment._id;
    }

    const publicId = generateDashboardAlertAcknowledgmentPublicId(
      validatedUserId,
      normalizedAlertId
    );
    const now = Date.now();

    return ctx.db.insert(DASHBOARD_TABLES.ALERT_ACKNOWLEDGMENTS, {
      publicId,
      ownerId: validatedUserId,
      userId: validatedUserId,
      alertId: normalizedAlertId,
      acknowledgedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const unacknowledgeAlert = mutation({
  args: {
    userId: userProfileIdSchema,
    alertId: v.string(),
  },
  handler: async (ctx, { userId, alertId }): Promise<void> => {
    const normalizedAlertId = assertValidAlertId(alertId);
    const validatedUserId = await assertCanCreateDashboardAlertAcknowledgment(ctx, userId);
    const acknowledgment = await findActiveAcknowledgmentByUserAndAlert(
      ctx,
      validatedUserId,
      normalizedAlertId
    );

    if (!acknowledgment) {
      return;
    }

    await assertCanDeleteDashboardAlertAcknowledgment(ctx, acknowledgment);

    await ctx.db.patch(
      acknowledgment._id,
      buildUpdatePayload(acknowledgment, { deletedAt: Date.now() })
    );
  },
});

export const acknowledgeAlerts = mutation({
  args: {
    userId: userProfileIdSchema,
    alertIds: v.array(v.string()),
  },
  handler: async (ctx, { userId, alertIds }) => {
    const acknowledgmentIds: DashboardAlertAcknowledgmentId[] = [];

    for (const alertId of alertIds) {
      const acknowledgmentId = await acknowledgeAlertForUser(ctx, userId, alertId);
      acknowledgmentIds.push(acknowledgmentId);
    }

    return acknowledgmentIds;
  },
});

export const unacknowledgeAlerts = mutation({
  args: {
    userId: userProfileIdSchema,
    alertIds: v.array(v.string()),
  },
  handler: async (ctx, { userId, alertIds }) => {
    for (const alertId of alertIds) {
      await unacknowledgeAlertForUser(ctx, userId, alertId);
    }
  },
});
