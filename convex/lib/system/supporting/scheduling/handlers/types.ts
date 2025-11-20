// convex/lib/system/supporting/scheduling/handlers/types.ts

import type { MutationCtx, QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';

/**
 * Handler Interface
 * Each scheduling handler must implement this interface
 */
export interface SchedulingHandler {
  /**
   * Unique identifier for this handler (e.g., 'blog_post', 'social_media', 'event')
   */
  type: string;

  /**
   * Display name for UI
   */
  name: string;

  /**
   * Description of what this handler does
   */
  description: string;

  /**
   * Can this handler auto-process scheduled items?
   * If true, the cron job will automatically call processScheduled
   */
  autoProcess: boolean;

  /**
   * Optional icon for UI display
   */
  icon?: string;

  /**
   * Optional color for UI display
   */
  color?: string;

  /**
   * Validate handler-specific data before creating/updating a scheduled event
   */
  validateHandlerData?: (data: Record<string, unknown>) => Promise<boolean> | boolean;

  /**
   * Process a scheduled event when it's due
   * This is called by the cron job for auto-processable events
   * or can be called manually for manual events
   *
   * @param ctx - Mutation context
   * @param scheduledEventId - ID of the scheduled event to process
   * @returns true if successful, false if failed (will be retried)
   */
  processScheduled: (
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ) => Promise<boolean>;

  /**
   * Optional: Called before processing starts
   * Can be used for pre-processing checks or setup
   */
  beforeProcess?: (
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ) => Promise<void>;

  /**
   * Optional: Called after successful processing
   * Can be used for cleanup, notifications, etc.
   */
  afterProcess?: (
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ) => Promise<void>;

  /**
   * Optional: Called when processing fails
   * Can be used for error handling, notifications, etc.
   */
  onProcessError?: (
    ctx: MutationCtx,
    scheduledEventId: Id<'scheduledEvents'>,
    error: Error
  ) => Promise<void>;

  /**
   * Optional: Get additional query data for the scheduled event
   * Useful for enriching the scheduled event with handler-specific data
   */
  getEventData?: (
    ctx: QueryCtx,
    scheduledEventId: Id<'scheduledEvents'>
  ) => Promise<Record<string, unknown>>;
}

/**
 * Handler Registration Entry
 */
export interface HandlerRegistration {
  handler: SchedulingHandler;
  enabled: boolean;
}
