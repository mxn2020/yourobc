// convex/lib/system/blog/tags/types.ts
// TypeScript type definitions for blog tags module

import type { Doc, Id } from '@/generated/dataModel';
import type { BlogEntityStatus } from '@/schema/system/blog/blog/types';

export type BlogTag = Doc<'blogTags'>;
export type BlogTagId = Id<'blogTags'>;

export interface CreateBlogTagData {
  title: string;
  slug?: string;
  description?: string;
  status?: BlogEntityStatus;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogTagData {
  title?: string;
  slug?: string;
  description?: string;
  status?: BlogEntityStatus;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogTagListResponse {
  items: BlogTag[];
  total: number;
  hasMore: boolean;
}
