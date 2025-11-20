// convex/schema/boilerplate/blog/blog/validators.ts
// Grouped validators for blog module

import { v } from 'convex/values';

/**
 * Blog Validators
 *
 * Centralized validation schemas for all blog entities
 */
export const blogValidators = {
  // Post Status
  postStatus: v.union(
    v.literal('draft'),
    v.literal('scheduled'),
    v.literal('published'),
    v.literal('archived')
  ),

  // Post Visibility
  postVisibility: v.union(
    v.literal('public'),
    v.literal('private'),
    v.literal('password'),
    v.literal('members_only'),
    v.literal('unlisted')
  ),

  // Sync Status
  syncStatus: v.union(
    v.literal('synced'),
    v.literal('pending'),
    v.literal('error')
  ),

  // Sync Direction
  syncDirection: v.union(
    v.literal('import'),
    v.literal('export'),
    v.literal('bidirectional')
  ),

  // Last Sync Status
  lastSyncStatus: v.union(
    v.literal('success'),
    v.literal('partial'),
    v.literal('error')
  ),

  // Featured Image
  featuredImage: v.object({
    url: v.string(),
    alt: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    caption: v.optional(v.string()),
  }),
} as const;
