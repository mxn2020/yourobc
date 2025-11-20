// convex/schema/system/projects/projects/validators.ts
// Grouped validators for projects module

import { v } from 'convex/values';

export const projectsValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('archived'),
    v.literal('completed'),
    v.literal('on_hold'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent'),
    v.literal('critical')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  riskLevel: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('critical')
  ),
} as const;
