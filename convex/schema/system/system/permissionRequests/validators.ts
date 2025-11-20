// convex/schema/boilerplate/system/permissionRequests/validators.ts
// Grouped validators for permissionRequests module

import { v } from 'convex/values';
import { metadataSchema } from '../../../base';

export const permissionRequestsValidators = {
  // User information
  userId: v.id('userProfiles'),
  userName: v.string(),
  userEmail: v.optional(v.string()),

  // Permission details
  permission: v.string(),
  module: v.string(),

  // Request details
  message: v.optional(v.string()),
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('denied')
  ),

  // Review details
  reviewedBy: v.optional(v.id('userProfiles')),
  reviewedByName: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),
  reviewNotes: v.optional(v.string()),

  // Standard metadata
  metadata: metadataSchema,
} as const;
