// convex/schema/system/user_profiles/user_profiles/validators.ts
// Grouped validators for user_profiles module

import { v } from 'convex/values';
import { statusTypes, userStatsSchema } from '../../../base';

export const userProfilesValidators = {
  // User role validator
  role: statusTypes.role,

  // User stats schema
  userStats: userStatsSchema,

  // Extended metadata structure
  extendedMetadata: v.optional(v.object({
    recoveredAt: v.optional(v.number()),
    recoveredFrom: v.optional(v.string()),
    syncSource: v.optional(v.string()),
    migrationVersion: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })),

} as const;
