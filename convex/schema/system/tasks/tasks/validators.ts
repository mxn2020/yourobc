// convex/schema/boilerplate/tasks/tasks/validators.ts
// Grouped validators for tasks module

import { v } from 'convex/values';

export const tasksValidators = {
  status: v.union(
    v.literal('todo'),
    v.literal('in_progress'),
    v.literal('in_review'),
    v.literal('completed'),
    v.literal('blocked'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),
} as const;
