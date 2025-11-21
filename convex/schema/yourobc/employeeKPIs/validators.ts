// convex/schema/yourobc/employeeKPIs/validators.ts
// Grouped validators for employeeKPIs module

import { v } from 'convex/values';

export const employeeKPIsValidators = {
  status: v.union(
    v.literal('on_track'),
    v.literal('at_risk'),
    v.literal('behind'),
    v.literal('achieved')
  ),

  period: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('quarterly'),
    v.literal('yearly')
  ),
} as const;
