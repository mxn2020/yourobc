// convex/schema/system/core/permission_requests/validators.ts
// Grouped validators and fields for permission requests module

import { v } from 'convex/values';

export const permissionRequestsValidators = {
  status: v.union(v.literal('pending'), v.literal('approved'), v.literal('denied')),
} as const;

export const permissionRequestsFields = {
  requester: v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
    userEmail: v.optional(v.string()),
  }),
  request: v.object({
    permission: v.string(),
    module: v.string(),
    message: v.optional(v.string()),
  }),
  review: v.object({
    reviewedBy: v.optional(v.id('userProfiles')),
    reviewedByName: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
  }),
} as const;
