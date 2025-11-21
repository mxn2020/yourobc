// convex/schema/software/yourobc/employeeSessions/validators.ts
// Grouped validators for employeeSessions module

import { v } from 'convex/values';

export const employeeSessionsValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('paused'),
    v.literal('completed')
  ),
} as const;
