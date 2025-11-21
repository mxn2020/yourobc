// convex/schema/yourobc/employeeCommissions/validators.ts
// Grouped validators for employeeCommissions module

import { v } from 'convex/values';

export const employeeCommissionsValidators = {
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('paid'),
    v.literal('cancelled')
  ),
} as const;
