// convex/lib/boilerplate/blog/types.ts
/**
 * Blog Type Definitions
 *
 * Core types and interfaces for blog functionality
 */

import { v } from 'convex/values';
import { Id } from '@/generated/dataModel';

/**
 * Post Status Types
 */
export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS];

/**
 * Post Visibility Types
 */
export const POST_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PASSWORD: 'password',
  MEMBERS_ONLY: 'members_only',
  UNLISTED: 'unlisted',
} as const;

export type PostVisibility = typeof POST_VISIBILITY[keyof typeof POST_VISIBILITY];

/**
 * Sync Direction Types
 */
export const SYNC_DIRECTION = {
  IMPORT: 'import',
  EXPORT: 'export',
  BIDIRECTIONAL: 'bidirectional',
} as const;

export type SyncDirection = typeof SYNC_DIRECTION[keyof typeof SYNC_DIRECTION];

/**
 * Sync Status Types
 */
export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING: 'pending',
  ERROR: 'error',
} as const;

export type SyncStatus = typeof SYNC_STATUS[keyof typeof SYNC_STATUS];

/**
 * Provider Types
 */
export const BLOG_PROVIDERS = {
  INTERNAL: 'internal',
  GHOST: 'ghost',
  CONTENTFUL: 'contentful',
  SANITY: 'sanity',
  STRAPI: 'strapi',
  WORDPRESS: 'wordpress',
  MEDIUM: 'medium',
} as const;

export type BlogProviderType = typeof BLOG_PROVIDERS[keyof typeof BLOG_PROVIDERS];

/**
 * Post Filters
 */
export interface PostFilters {
  status?: PostStatus;
  authorId?: string;
  categoryId?: string;
  tag?: string;
  featured?: boolean;
  visibility?: PostVisibility;
  series?: string;
  search?: string;
}

/**
 * Post List Options
 */
export interface PostListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'createdAt' | 'updatedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  filters?: PostFilters;
}

/**
 * Create Post Input
 */
export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  featuredImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  allowComments?: boolean;
  visibility?: PostVisibility;
  metadata?: Record<string, any>;
}

/**
 * Update Post Input
 */
export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  coAuthors?: string[];
  featuredImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  focusKeyword?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  allowComments?: boolean;
  featured?: boolean;
  isPinned?: boolean;
  visibility?: PostVisibility;
  password?: string;
  series?: string;
  seriesOrder?: number;
  metadata?: Record<string, any>;
}

/**
 * Schedule Post Input
 */
export interface SchedulePostInput {
  scheduledFor: number;
  createReminder?: boolean;
  reminderMinutesBefore?: number;
  emailReminder?: boolean;
}

/**
 * Create Category Input
 */
export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Update Category Input
 */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  order?: number;
  color?: string;
  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Create Tag Input
 */
export interface CreateTagInput {
  name: string;
  description?: string;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Update Tag Input
 */
export interface UpdateTagInput {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Create Author Input
 */
export interface CreateAuthorInput {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  userId?: Id<'userProfiles'>;
}

/**
 * Update Author Input
 */
export interface UpdateAuthorInput {
  name?: string;
  slug?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  isActive?: boolean;
  notificationEnabled?: boolean;
}

/**
 * SEO Metadata
 */
export interface SEOMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  focusKeyword?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

/**
 * Provider Configuration
 */
export interface ProviderConfig {
  provider: BlogProviderType;
  enabled: boolean;
  autoSync?: boolean;
  syncDirection?: SyncDirection;
  syncInterval?: number;
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  contentApiKey?: string;
  adminApiKey?: string;
  additionalConfig?: Record<string, any>;
}

/**
 * Sync Result
 */
export interface SyncResult {
  success: boolean;
  postsSynced: number;
  postsSkipped: number;
  postsErrored: number;
  errors?: string[];
  timestamp: number;
}

/**
 * Post Statistics
 */
export interface PostStatistics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
}

/**
 * Category Statistics
 */
export interface CategoryStatistics {
  categoryId: string;
  categoryName: string;
  postCount: number;
  totalViews: number;
}

/**
 * Author Statistics
 */
export interface AuthorStatistics {
  authorId: string;
  authorName: string;
  postCount: number;
  totalViews: number;
  totalComments: number;
}

/**
 * Related Post
 */
export interface RelatedPost {
  postId: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: number;
  relevanceScore: number;
}
