// convex/schema/software/yourobc/tasks/validators.ts
// Grouped validators for tasks module

import { v } from 'convex/values';

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
