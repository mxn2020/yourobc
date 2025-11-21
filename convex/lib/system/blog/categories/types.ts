// convex/lib/system/blog/categories/types.ts
// TypeScript type definitions for blog categories module

import type { Doc, Id } from '@/generated/dataModel';
import type { BlogEntityStatus } from '@/schema/system/blog/blog/types';

// Entity types
export type BlogCategory = Doc<'blogCategories'>;
export type BlogCategoryId = Id<'blogCategories'>;

// Data interfaces
export interface CreateBlogCategoryData {
  title: string;
  slug?: string;
  description?: string;
  status?: BlogEntityStatus;
  parentId?: BlogCategoryId;
  order?: number;
  color?: string;
  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogCategoryData {
  title?: string;
  slug?: string;
  description?: string;
  status?: BlogEntityStatus;
  parentId?: BlogCategoryId;
  order?: number;
  color?: string;
  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Response types
export interface BlogCategoryWithRelations extends BlogCategory {
  parent?: BlogCategory | null;
  children?: BlogCategory[];
  posts?: Doc<'blogPosts'>[];
}

export interface BlogCategoryListResponse {
  items: BlogCategory[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface BlogCategoryFilters {
  status?: BlogEntityStatus[];
  parentId?: BlogCategoryId | null;
  search?: string;
  hasParent?: boolean;
}

// Tree types
export interface BlogCategoryTreeNode extends BlogCategory {
  children: BlogCategoryTreeNode[];
  level: number;
}
