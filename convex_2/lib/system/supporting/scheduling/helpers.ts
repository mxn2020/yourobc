// convex/lib/system/supporting/scheduling/helpers.ts

/**
 * Scheduling Module Helper Functions
 * Plain TypeScript functions that can be called directly from mutations/queries
 */

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import type { Doc } from '@/generated/dataModel';
import { validateUpdateEventData } from './utils';
import type { UpdateScheduledEventData } from './types';
import { requireCurrentUser } from '@/shared/auth.helper';

/**
 * Get scheduled events by entity (helper version)
 * Can be called directly from any mutation or query
 */
export async function getEventsByEntityHelper(
  ctx: QueryCtx | MutationCtx,
  args: {
    entityType: string;
    entityId: string;
    includeDeleted?: boolean;
  }
): Promise<Doc<'scheduledEvents'>[]> {
  const query = ctx.db
    .query('scheduledEvents')
    .withIndex('by_entity', (q) =>
      q.eq('entityType', args.entityType).eq('entityId', args.entityId)
    );

  const events = await query.collect();

  // Filter out deleted unless requested
  if (!args.includeDeleted) {
    return events.filter((event) => !event.deletedAt);
  }

  return events;
}

/**
 * Update a scheduled event (helper version)
 * Can be called directly from any mutation
 */
export async function updateEventHelper(
  ctx: MutationCtx,
  args: {
    eventId: Id<'scheduledEvents'>;
    data: Partial<UpdateScheduledEventData>;
  }
): Promise<Id<'scheduledEvents'>> {
  // Get user from context
  const user = await requireCurrentUser(ctx);

  const event = await ctx.db.get(args.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.deletedAt) {
    throw new Error('Cannot update deleted event');
  }

  const data = args.data as UpdateScheduledEventData;

  // Validate
  const errors = validateUpdateEventData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Update the event
  await ctx.db.patch(args.eventId, {
    ...data,
    updatedBy: user._id,
    updatedAt: Date.now(),
  });

  return args.eventId;
}

/**
 * Cancel a scheduled event (helper version)
 * Can be called directly from any mutation
 */
export async function cancelEventHelper(
  ctx: MutationCtx,
  args: {
    eventId: Id<'scheduledEvents'>;
    reason?: string;
  }
): Promise<Id<'scheduledEvents'>> {
  // Get user from context
  const user = await requireCurrentUser(ctx);

  const event = await ctx.db.get(args.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.deletedAt) {
    throw new Error('Cannot cancel deleted event');
  }

  await ctx.db.patch(args.eventId, {
    status: 'cancelled',
    processingStatus: 'cancelled',
    cancelledBy: user._id,
    cancelledAt: Date.now(),
    cancellationReason: args.reason,
    updatedBy: user._id,
    updatedAt: Date.now(),
  });

  return args.eventId;
}
