// convex/lib/system/blog/authors/types.ts
import type { Doc, Id } from '@/generated/dataModel';
import type { BlogAuthorStatus } from '@/schema/system/blog/blog/types';

export type BlogAuthor = Doc<'blogAuthors'>;
export type BlogAuthorId = Id<'blogAuthors'>;

export interface CreateBlogAuthorData {
  title: string;
  slug?: string;
  email: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  userId?: Id<'userProfiles'>;
  status?: BlogAuthorStatus;
}

export interface UpdateBlogAuthorData extends Partial<CreateBlogAuthorData> {}

export interface BlogAuthorListResponse {
  items: BlogAuthor[];
  total: number;
  hasMore: boolean;
}
