// convex/schema/yourobc/tasks/validators.ts
/**
 * Tasks Validators
 *
 * Convex validators for tasks-related data structures.
 * These validators define the shape and validation rules for tasks data.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for tasks module
 */
export const tasksValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('active'),
    v.literal('completed'),
    v.literal('cancelled'),
    v.literal('archived')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('critical')
  ),

  taskType: v.union(
    v.literal('general'),
    v.literal('shipment'),
    v.literal('quote'),
    v.literal('customer'),
    v.literal('partner'),
    v.literal('followup')
  ),
} as const;

/**
 * Complex object schemas for tasks module
 */
export const tasksFields = {
  checklistItem: v.object({
    id: v.string(),
    text: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id('userProfiles')),
  }),
} as const;
