// convex/schema/system/user_profiles/user_profiles/validators.ts
// Grouped validators and complex fields for user profiles module

import { v } from 'convex/values';
import { statusTypes, userStatsSchema } from '@/schema/base';

export const userProfilesValidators = {
  role: statusTypes.role,
} as const;

export const userProfilesFields = {
  stats: userStatsSchema,
  extendedMetadata: v.object({
    recoveredAt: v.optional(v.number()),
    recoveredFrom: v.optional(v.string()),
    syncSource: v.optional(v.string()),
    migrationVersion: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  }),
} as const;
