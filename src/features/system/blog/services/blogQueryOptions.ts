// src/features/boilerplate/blog/services/blogQueryOptions.ts
/**
 * Blog Query Options
 *
 * Provides query option factories for blog-related queries.
 * These ensure consistent query keys between SSR (server loaders) and CSR (client hooks).
 *
 * Used in route loaders for SSR prefetching and in hooks for client-side data fetching.
 */

import { convexQuery } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { PostFilters, PostListOptions } from '../types';

/**
 * Query options factory for fetching all categories
 */
export function getCategoriesQueryOptions() {
  return convexQuery(api.lib.boilerplate.blog.queries.getCategories, {});
}

/**
 * Query options factory for fetching a single category
 */
export function getCategoryQueryOptions(categoryId: Id<'blogCategories'>) {
  return convexQuery(api.lib.boilerplate.blog.queries.getCategory, {
    categoryId,
  });
}

/**
 * Query options factory for fetching all tags
 */
export function getTagsQueryOptions() {
  return convexQuery(api.lib.boilerplate.blog.queries.getTags, {});
}

/**
 * Query options factory for fetching a single tag
 */
export function getTagQueryOptions(tagId: Id<'blogTags'>) {
  return convexQuery(api.lib.boilerplate.blog.queries.getTag, {
    tagId,
  });
}

/**
 * Query options factory for fetching all posts (with optional filters)
 */
export function getPostsQueryOptions(options?: PostListOptions) {
  return convexQuery(api.lib.boilerplate.blog.queries.getPosts, {
    status: options?.filters?.status,
    authorId: options?.filters?.authorId,
    categoryId: options?.filters?.categoryId,
    tag: options?.filters?.tag,
    featured: options?.filters?.featured,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Query options factory for fetching a single post by ID
 */
export function getPostQueryOptions(postId: Id<'blogPosts'>) {
  return convexQuery(api.lib.boilerplate.blog.queries.getPost, {
    postId,
  });
}

/**
 * Query options factory for fetching a post by slug
 */
export function getPostBySlugQueryOptions(slug: string) {
  return convexQuery(api.lib.boilerplate.blog.queries.getPostBySlug, {
    slug,
  });
}

/**
 * Query options factory for fetching blog statistics
 */
export function getBlogStatsQueryOptions(authorId?: Id<'blogAuthors'>) {
  return convexQuery(api.lib.boilerplate.blog.queries.getPostStatistics, {
    authorId,
  });
}

/**
 * Query options factory for fetching all authors
 */
export function getAuthorsQueryOptions() {
  return convexQuery(api.lib.boilerplate.blog.queries.getAuthors, {});
}

/**
 * Query options factory for fetching a single author
 */
export function getAuthorQueryOptions(authorId: Id<'blogAuthors'>) {
  return convexQuery(api.lib.boilerplate.blog.queries.getAuthor, {
    authorId,
  });
}

/**
 * Query options factory for fetching published posts (public-facing)
 */
export function getPublishedPostsQueryOptions(options?: {
  categoryId?: Id<'blogCategories'>;
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  return convexQuery(api.lib.boilerplate.blog.queries.getPublishedPosts, {
    categoryId: options?.categoryId,
    tag: options?.tag,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Query options factory for fetching featured posts
 */
export function getFeaturedPostsQueryOptions(limit?: number) {
  return convexQuery(api.lib.boilerplate.blog.queries.getFeaturedPosts, {
    limit,
  });
}

/**
 * Query options factory for fetching category by slug
 */
export function getCategoryBySlugQueryOptions(slug: string) {
  return convexQuery(api.lib.boilerplate.blog.queries.getCategoryBySlug, {
    slug,
  });
}
