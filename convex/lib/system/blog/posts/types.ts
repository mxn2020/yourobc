// convex/lib/system/blog/posts/types.ts
// TypeScript type definitions for blog posts module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  BlogPostStatus,
  BlogPostVisibility,
  BlogSyncStatus,
  BlogFeaturedImage,
} from '@/schema/system/blog/blog/types';

// Entity types
export type BlogPost = Doc<'blogPosts'>;
export type BlogPostId = Id<'blogPosts'>;

// Data interfaces
export interface CreateBlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status?: BlogPostStatus;
  visibility?: BlogPostVisibility;
  authorId: Id<'blogAuthors'>;
  categoryId?: Id<'blogCategories'>;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  featuredImage?: BlogFeaturedImage;
  publishedAt?: number;
  scheduledFor?: number;

  // SEO fields
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

  // Display options
  featured?: boolean;
  allowComments?: boolean;
  isPinned?: boolean;
  password?: string;
}

export interface UpdateBlogPostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: BlogPostStatus;
  visibility?: BlogPostVisibility;
  authorId?: Id<'blogAuthors'>;
  categoryId?: Id<'blogCategories'>;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  featuredImage?: BlogFeaturedImage;
  publishedAt?: number;
  scheduledFor?: number;

  // SEO fields
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

  // Display options
  featured?: boolean;
  allowComments?: boolean;
  isPinned?: boolean;
  password?: string;
}

// Response types
export interface BlogPostWithRelations extends BlogPost {
  author?: Doc<'blogAuthors'> | null;
  category?: Doc<'blogCategories'> | null;
  coAuthorsData?: Doc<'blogAuthors'>[];
}

export interface BlogPostListResponse {
  items: BlogPost[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface BlogPostFilters {
  status?: BlogPostStatus[];
  visibility?: BlogPostVisibility[];
  categoryId?: Id<'blogCategories'>;
  authorId?: Id<'blogAuthors'>;
  search?: string;
  featured?: boolean;
  isPinned?: boolean;
  tags?: string[];
  series?: string;
  publishedAfter?: number;
  publishedBefore?: number;
}

// Sync types
export interface SyncPostToProviderData {
  postId: BlogPostId;
  providerId: Id<'blogProviderSync'>;
  forceSync?: boolean;
}

export interface SyncPostResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  syncedAt: number;
  error?: string;
}
