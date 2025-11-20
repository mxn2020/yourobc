// convex/schema/system/blog/blog/blog.ts
// Table definitions for blog module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { blogValidators } from './validators';

/**
 * Blog Posts Table
 *
 * Stores all blog posts with support for:
 * - Draft, scheduled, published, and archived states
 * - SEO optimization fields
 * - Multi-author support
 * - External provider synchronization
 * - Engagement metrics
 */
export const blogPostsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: blogValidators.postStatus,

  // Core Content
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),

  // Publishing Status
  publishedAt: v.optional(v.number()),
  scheduledFor: v.optional(v.number()),

  // Author Information
  authorId: v.id('blogAuthors'),
  authorName: v.string(),
  authorEmail: v.optional(v.string()),
  authorAvatar: v.optional(v.string()),
  coAuthors: v.optional(v.array(v.id('blogAuthors'))),

  // Organization
  categoryId: v.optional(v.id('blogCategories')),
  categoryName: v.optional(v.string()),
  tags: v.array(v.string()),
  series: v.optional(v.string()),
  seriesOrder: v.optional(v.number()),

  // Featured Media
  featuredImage: v.optional(blogValidators.featuredImage),

  // SEO Fields
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  seoKeywords: v.optional(v.array(v.string())),
  focusKeyword: v.optional(v.string()),
  ogImage: v.optional(v.string()),
  ogTitle: v.optional(v.string()),
  ogDescription: v.optional(v.string()),
  twitterCard: v.optional(v.string()),
  canonicalUrl: v.optional(v.string()),
  noIndex: v.optional(v.boolean()),

  // Content Metadata
  readTime: v.optional(v.number()),
  wordCount: v.optional(v.number()),
  language: v.optional(v.string()),

  // Engagement Metrics
  viewCount: v.optional(v.number()),
  likeCount: v.optional(v.number()),
  commentCount: v.optional(v.number()),
  shareCount: v.optional(v.number()),

  // Display Options
  featured: v.optional(v.boolean()),
  allowComments: v.optional(v.boolean()),
  isPinned: v.optional(v.boolean()),
  visibility: v.optional(blogValidators.postVisibility),
  password: v.optional(v.string()),

  // External Provider Sync
  provider: v.optional(v.string()),
  externalId: v.optional(v.string()),
  externalUrl: v.optional(v.string()),
  lastSyncedAt: v.optional(v.number()),
  syncStatus: v.optional(blogValidators.syncStatus),
  syncError: v.optional(v.string()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_author', ['authorId'])
  .index('by_category', ['categoryId'])
  .index('by_status', ['status'])
  .index('by_published_date', ['publishedAt'])
  .index('by_created_date', ['createdAt'])
  .index('by_provider', ['provider', 'externalId'])
  .index('by_featured', ['featured', 'publishedAt'])
  .index('by_series', ['series', 'seriesOrder'])
  .searchIndex('search_posts', {
    searchField: 'title',
    filterFields: ['status', 'categoryId', 'authorId'],
  });

/**
 * Blog Categories Table
 *
 * Hierarchical category system for organizing posts
 */
export const blogCategoriesTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: v.optional(v.literal('active')),

  // Category Details
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),

  // Hierarchy Support
  parentId: v.optional(v.id('blogCategories')),
  order: v.optional(v.number()),
  depth: v.optional(v.number()),
  path: v.optional(v.string()),

  // Display
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
  coverImage: v.optional(v.string()),

  // SEO
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),

  // Metadata
  postCount: v.optional(v.number()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_parent', ['parentId'])
  .index('by_order', ['order'])
  .index('by_created', ['createdAt']);

/**
 * Blog Tags Table
 *
 * Flexible tagging system for posts
 */
export const blogTagsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: v.optional(v.literal('active')),

  // Tag Details
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),

  // Display
  color: v.optional(v.string()),

  // SEO
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),

  // Metadata
  postCount: v.optional(v.number()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_post_count', ['postCount'])
  .index('by_created', ['createdAt']);

/**
 * Blog Authors Table
 *
 * Extended author profiles (can be linked to users or standalone)
 */
export const blogAuthorsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: v.optional(v.union(v.literal('active'), v.literal('inactive'))),

  // Author Details
  name: v.string(),
  slug: v.string(),
  email: v.string(),
  bio: v.optional(v.string()),
  avatar: v.optional(v.string()),
  coverImage: v.optional(v.string()),

  // Social Links
  website: v.optional(v.string()),
  twitter: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  facebook: v.optional(v.string()),
  instagram: v.optional(v.string()),

  // Link to User Account (if applicable)
  userId: v.optional(v.id('userProfiles')),

  // Author Stats
  postCount: v.optional(v.number()),
  followerCount: v.optional(v.number()),

  // Settings
  isActive: v.optional(v.boolean()),
  notificationEnabled: v.optional(v.boolean()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_email', ['email'])
  .index('by_user', ['userId'])
  .index('by_active', ['isActive'])
  .index('by_created', ['createdAt']);

/**
 * Blog Provider Sync Table
 *
 * Tracks synchronization with external blogging platforms
 */
export const blogProviderSyncTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: v.optional(v.union(v.literal('enabled'), v.literal('disabled'))),

  // Provider Configuration
  provider: v.string(),
  enabled: v.boolean(),
  autoSync: v.optional(v.boolean()),
  syncDirection: v.optional(blogValidators.syncDirection),
  syncInterval: v.optional(v.number()),

  // API Configuration (encrypted in production)
  apiUrl: v.optional(v.string()),
  apiKey: v.optional(v.string()),
  apiSecret: v.optional(v.string()),
  contentApiKey: v.optional(v.string()),
  adminApiKey: v.optional(v.string()),
  additionalConfig: v.optional(v.any()),

  // Sync Status
  lastSyncedAt: v.optional(v.number()),
  lastSyncStatus: v.optional(blogValidators.lastSyncStatus),
  lastSyncError: v.optional(v.string()),
  postsSynced: v.optional(v.number()),
  postsSkipped: v.optional(v.number()),
  postsErrored: v.optional(v.number()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_provider', ['provider'])
  .index('by_enabled', ['enabled'])
  .index('by_created', ['createdAt']);

/**
 * Blog Media Library Table
 *
 * Track uploaded media assets for blog posts
 */
export const blogMediaTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  title: v.string(),
  status: v.optional(v.literal('active')),

  // File Details
  filename: v.string(),
  url: v.string(),
  storageId: v.optional(v.string()),

  // File Info
  mimeType: v.string(),
  size: v.number(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),

  // Metadata
  alt: v.optional(v.string()),
  caption: v.optional(v.string()),

  // Organization
  folder: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),

  // Usage Tracking
  usedInPosts: v.optional(v.array(v.id('blogPosts'))),
  usageCount: v.optional(v.number()),

  // Special audit fields
  uploadedAt: v.number(),
  uploadedBy: v.id('userProfiles'),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_uploaded_at', ['uploadedAt'])
  .index('by_uploader', ['uploadedBy'])
  .index('by_folder', ['folder'])
  .index('by_created', ['createdAt']);
