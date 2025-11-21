// convex/lib/system/blog/media/types.ts
import type { Doc, Id } from '@/generated/dataModel';
import type { BlogEntityStatus } from '@/schema/system/blog/blog/types';

export type BlogMedia = Doc<'blogMedia'>;
export type BlogMediaId = Id<'blogMedia'>;

export interface CreateBlogMediaData {
  title: string;
  filename: string;
  url: string;
  storageId?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  folder?: string;
  tags?: string[];
  status?: BlogEntityStatus;
}

export interface UpdateBlogMediaData {
  title?: string;
  alt?: string;
  caption?: string;
  folder?: string;
  tags?: string[];
  status?: BlogEntityStatus;
}

export interface BlogMediaListResponse {
  items: BlogMedia[];
  total: number;
  hasMore: boolean;
}
