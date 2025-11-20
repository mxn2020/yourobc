// convex/schema/boilerplate/email/templates/validators.ts
// Grouped validators for email templates module

import { v } from 'convex/values';

export const emailTemplatesValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('archived')
  ),

  variableType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('date')
  ),
} as const;
