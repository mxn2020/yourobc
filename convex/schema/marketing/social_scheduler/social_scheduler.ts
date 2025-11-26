// convex/schema/marketing/social_scheduler/social_scheduler.ts
// Table definitions for social_scheduler module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, statusTypes } from '@/schema/base';
import { socialSchedulerValidators } from './validators';

export const socialAccountsTable = defineTable({
  // Core fields
  userId: v.id('userProfiles'),
  platform: socialSchedulerValidators.platform,

  // Account details
  accountName: v.string(),
  accountId: v.string(), // Platform-specific ID
  username: v.optional(v.string()),
  profileImageUrl: v.optional(v.string()),

  // Authentication
  accessToken: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  tokenExpiresAt: v.optional(v.number()),

  // Status
  isActive: v.boolean(),
  lastSyncedAt: v.optional(v.number()),

  // Metadata
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_user_id', ['userId'])
  .index('by_platform', ['platform'])
  .index('by_active', ['isActive'])
  .index('by_account_name', ['accountName'])
  .index('by_deleted_at', ['deletedAt']);

export const socialPostsTable = defineTable({
  // Required: Main display field
  title: v.string(), // Post title/description

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  accountId: v.id('marketingSocialAccounts'),

  // Description
  description: v.optional(v.string()),

  // Status & Priority
  status: socialSchedulerValidators.postStatus,
  priority: statusTypes.priority,

  // Ownership & Access
  visibility: socialSchedulerValidators.visibility,

  // Post content
  content: v.string(),
  mediaUrls: v.optional(v.array(v.string())),
  mediaType: v.optional(socialSchedulerValidators.mediaType),

  // Platform-specific
  platform: socialSchedulerValidators.platform,
  platformPostId: v.optional(v.string()), // ID from the platform after publishing

  // Hashtags and mentions
  hashtags: v.optional(v.array(v.string())),
  mentions: v.optional(v.array(v.string())),

  // Scheduling
  scheduledAt: v.optional(v.number()),
  publishedAt: v.optional(v.number()),

  // Optimal timing
  suggestedTime: v.optional(v.number()),

  // First comment (for Instagram)
  firstComment: v.optional(v.string()),

  // Thread/carousel
  isThread: v.optional(v.boolean()),
  threadPosts: v.optional(v.array(v.string())),

  // Analytics
  likes: v.optional(v.number()),
  comments: v.optional(v.number()),
  shares: v.optional(v.number()),
  impressions: v.optional(v.number()),
  engagementRate: v.optional(v.number()),

  // Error handling
  errorMessage: v.optional(v.string()),
  retryCount: v.optional(v.number()),

  // Metadata
  tags: v.array(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_account', ['accountId'])
  .index('by_platform', ['platform'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_scheduled_at', ['scheduledAt'])
  .index('by_published_at', ['publishedAt'])
  .index('by_created_at', ['createdAt']);

export const contentCalendarTable = defineTable({
  // Core fields
  userId: v.id('userProfiles'),

  // Calendar entry
  date: v.number(),
  title: v.string(),

  // Associated posts
  postIds: v.array(v.id('marketingSocialPosts')),

  // Campaign/category
  campaign: v.optional(v.string()),
  category: v.optional(v.string()),

  // Notes
  notes: v.optional(v.string()),

  // Metadata
  ...auditFields,
})
  .index('by_user_id', ['userId'])
  .index('by_date', ['date'])
  .index('by_title', ['title']);
