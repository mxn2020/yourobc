// convex/lib/yourobc/supporting/counters/mutations.ts
// Write operations for counters module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { countersValidators } from '@/schema/yourobc/supporting/counters/validators';
import { COUNTERS_CONSTANTS } from './constants';
import { trimCounterData, validateCounterData, getNextCounterValue } from './utils';
import { requireEditCountersAccess, requireDeleteCountersAccess } from './permissions';

/**
 * Create a new counter
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have CREATE permission
 */
export const createCounter = mutation({
  args: {
    data: v.object({
      type: countersValidators.counterType,
      prefix: v.string(),
      year: v.number(),
      lastNumber: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, COUNTERS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Trim and validate
    const trimmed = trimCounterData(data);
    const errors = validateCounterData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Insert record
    const id = await ctx.db.insert('yourobcCounters', {
      ...trimmed,
      lastNumber: trimmed.lastNumber ?? COUNTERS_CONSTANTS.DEFAULTS.LAST_NUMBER,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'counters.created',
      entityType: 'yourobcCounters',
      entityId: trimmed.type,
      entityTitle: `${trimmed.prefix} (${trimmed.year})`,
      description: `Created counter: ${trimmed.prefix} for ${trimmed.year}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Increment counter and get next value
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const incrementCounter = mutation({
  args: { id: v.id('yourobcCounters') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Counter not found');
    }

    // Check permissions
    await requireEditCountersAccess(ctx, existing, user);

    const now = Date.now();
    const nextValue = getNextCounterValue(existing.lastNumber);

    // Update record
    await ctx.db.patch(id, {
      lastNumber: nextValue,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'counters.incremented',
      entityType: 'yourobcCounters',
      entityId: existing.type,
      entityTitle: `${existing.prefix} (${existing.year})`,
      description: `Incremented counter to ${nextValue}`,
      metadata: { previousValue: existing.lastNumber, nextValue },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return nextValue;
  },
});

/**
 * Update an existing counter
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const updateCounter = mutation({
  args: {
    id: v.id('yourobcCounters'),
    updates: v.object({
      lastNumber: v.optional(v.number()),
      year: v.optional(v.number()),
      prefix: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Counter not found');
    }

    // Check permissions
    await requireEditCountersAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimCounterData(updates);
    const errors = validateCounterData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'counters.updated',
      entityType: 'yourobcCounters',
      entityId: existing.type,
      entityTitle: `${trimmed.prefix ?? existing.prefix} (${trimmed.year ?? existing.year})`,
      description: `Updated counter: ${existing.prefix}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete a counter
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const deleteCounter = mutation({
  args: { id: v.id('yourobcCounters') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Counter not found');
    }

    // Check permissions
    await requireDeleteCountersAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'counters.deleted',
      entityType: 'yourobcCounters',
      entityId: existing.type,
      entityTitle: `${existing.prefix} (${existing.year})`,
      description: `Deleted counter: ${existing.prefix}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
