// convex/lib/system/supporting/counters/mutations.ts
// Write operations for system counters

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { countersValidators } from '@/schema/system/supporting/counters/validators';
import { SYSTEM_COUNTERS_CONSTANTS } from './constants';
import {
  trimSystemCounterData,
  validateSystemCounterData,
  formatSystemCounterNumber,
} from './utils';
import { requireEditSystemCounterAccess } from './permissions';

export const createSystemCounter = mutation({
  args: {
    data: v.object({
      name: v.string(),
      type: countersValidators.counterType,
      prefix: v.optional(v.string()),
      suffix: v.optional(v.string()),
      currentValue: v.number(),
      step: v.optional(v.number()),
      minValue: v.optional(v.number()),
      maxValue: v.optional(v.number()),
      padLength: v.optional(v.number()),
      format: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemCounterData(data);
    const errors = validateSystemCounterData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'counters');

    const id = await ctx.db.insert('counters', {
      ...trimmed,
      step: trimmed.step ?? SYSTEM_COUNTERS_CONSTANTS.DEFAULTS.STEP,
      padLength: trimmed.padLength ?? SYSTEM_COUNTERS_CONSTANTS.DEFAULTS.PAD_LENGTH,
      publicId,
      ownerId: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.counters.created',
      entityType: 'counters',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: 'Created counter',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemCounter = mutation({
  args: {
    id: v.id('counters'),
    updates: v.object({
      name: v.optional(v.string()),
      currentValue: v.optional(v.number()),
      step: v.optional(v.number()),
      minValue: v.optional(v.number()),
      maxValue: v.optional(v.number()),
      padLength: v.optional(v.number()),
      format: v.optional(v.string()),
      prefix: v.optional(v.string()),
      suffix: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Counter not found');
    }

    await requireEditSystemCounterAccess(ctx, existing, user);

    const trimmed = trimSystemCounterData(updates);
    const errors = validateSystemCounterData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.counters.updated',
      entityType: 'counters',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: 'Updated counter',
      metadata: { updates: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const getNextSystemCounterValue = mutation({
  args: { id: v.id('counters'), year: v.optional(v.number()) },
  handler: async (ctx, { id, year }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Counter not found');
    }

    await requireEditSystemCounterAccess(ctx, existing, user);

    const nextValue = existing.currentValue + (existing.step ?? SYSTEM_COUNTERS_CONSTANTS.DEFAULTS.STEP);
    const now = Date.now();

    await ctx.db.patch(id, {
      currentValue: nextValue,
      updatedAt: now,
      updatedBy: user._id,
    });

    const formatted = formatSystemCounterNumber(
      existing.prefix,
      nextValue,
      year,
      existing.padLength ?? SYSTEM_COUNTERS_CONSTANTS.DEFAULTS.PAD_LENGTH,
      existing.suffix
    );

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.counters.incremented',
      entityType: 'counters',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Incremented counter',
      metadata: { nextValue, formatted },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { value: nextValue, formatted };
  },
});
