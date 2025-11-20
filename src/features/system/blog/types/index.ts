// src/features/boilerplate/blog/types/index.ts
/**
 * Blog Feature - Frontend Types
 *
 * Type definitions for the blog feature frontend
 */

import { Id } from '@/convex/_generated/dataModel'

import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  BlogProviderSync,
  BlogMedia,
} from '../../../../../convex/schema.ts';

/**
 * Re-export Convex types
 */
export type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  BlogProviderSync,
  BlogMedia,
};

/**
 * ============================================
 * PROVIDER TYPES
 * ============================================
 */

export type BlogProviderType = 'internal' | 'ghost' | 'contentful' | 'sanity';

export interface BlogProviderConfig {
  type: BlogProviderType;
  enabled: boolean;
  isPrimary: boolean;
  credentials?: Record<string, string>;
  syncEnabled?: boolean;
  syncDirection?: 'push' | 'pull' | 'bidirectional';
}

/**
 * ============================================
 * POST TYPES
 * ============================================
 */

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type PostVisibility = 'public' | 'private' | 'password' | 'members_only' | 'unlisted';

export interface PostFormData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  categoryId?: Id<'blogCategories'>;
  tags: string[];
  featuredImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  focusKeyword?: string;
  allowComments?: boolean;
  visibility?: PostVisibility;
  series?: string;
  seriesOrder?: number;
}

export interface PostFilters {
  status?: PostStatus;
  authorId?: Id<'blogAuthors'>;
  categoryId?: Id<'blogCategories'>;
  tag?: string;
  featured?: boolean;
  search?: string;
}

export interface PostListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  filters?: PostFilters;
}

export interface PostWithRelations extends BlogPost {
  author?: BlogAuthor;
  category?: BlogCategory;
  tagObjects?: BlogTag[];
  relatedPosts?: BlogPost[];
  commentsCount?: number;
}

/**
 * ============================================
 * CATEGORY TYPES
 * ============================================
 */

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: Id<'blogCategories'>;
  color?: string;
  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
}

export interface CategoryWithChildren extends BlogCategory {
  children?: CategoryWithChildren[];
  parent?: BlogCategory;
  postCount?: number;
}

/**
 * ============================================
 * TAG TYPES
 * ============================================
 */

export interface TagFormData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface TagWithCount extends BlogTag {
  postCount: number;
}

/**
 * ============================================
 * AUTHOR TYPES
 * ============================================
 */

export interface AuthorFormData {
  userId?: Id<"userProfiles">;
  name: string;
  slug?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  isActive?: boolean;
}

export interface AuthorWithStats extends BlogAuthor {
  postCount: number;
  publishedPostCount: number;
  totalViews: number;
  recentPosts?: BlogPost[];
}

/**
 * ============================================
 * EDITOR TYPES
 * ============================================
 */

export interface EditorState {
  content: string;
  isModified: boolean;
  lastSaved?: number;
  autoSaveEnabled: boolean;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  showPreview?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export interface EditorToolbarAction {
  id: string;
  label: string;
  icon: string;
  action: (editor: any) => void;
  shortcut?: string;
}

/**
 * ============================================
 * SEO TYPES
 * ============================================
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  focusKeyword?: string;
  ogImage?: string;
  ogImageAlt?: string;
  canonical?: string;
  structuredData?: Record<string, any>;
}

export interface SEOScore {
  score: number; // 0-100
  recommendations: SEORecommendation[];
}

export interface SEORecommendation {
  type: 'title' | 'description' | 'keywords' | 'content' | 'images';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  currentValue?: string | number;
  recommendedValue?: string | number;
}

/**
 * ============================================
 * ANALYTICS TYPES
 * ============================================
 */

export interface PostAnalytics {
  postId: Id<'blogPosts'>;
  views: number;
  uniqueViews: number;
  likes: number;
  comments: number;
  shares: number;
  averageReadTime: number;
  bounceRate: number;
  sources: {
    direct: number;
    organic: number;
    social: number;
    referral: number;
  };
}

export interface BlogStatistics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
}

/**
 * ============================================
 * UI COMPONENT TYPES
 * ============================================
 */

export interface PostCardProps {
  post: BlogPost | PostWithRelations;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  showAuthor?: boolean;
  showCategory?: boolean;
  showExcerpt?: boolean;
  showReadTime?: boolean;
  showDate?: boolean;
  onClick?: (post: BlogPost) => void;
}

export interface PostListProps {
  posts: BlogPost[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  variant?: 'grid' | 'list';
}

export interface CategoryBadgeProps {
  category: BlogCategory;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (category: BlogCategory) => void;
}

export interface TagCloudProps {
  tags: TagWithCount[];
  maxTags?: number;
  onClick?: (tag: BlogTag) => void;
}

export interface AuthorCardProps {
  author: BlogAuthor | AuthorWithStats;
  variant?: 'default' | 'compact' | 'full';
  showBio?: boolean;
  showStats?: boolean;
  showSocialLinks?: boolean;
}

/**
 * ============================================
 * PROVIDER INTERFACE
 * ============================================
 */

export interface BlogProvider {
  type: BlogProviderType;
  config: BlogProviderConfig;

  // Post operations
  getPosts(filters?: PostFilters): Promise<BlogPost[]>;
  getPost(id: string): Promise<BlogPost | null>;
  getPostBySlug(slug: string): Promise<BlogPost | null>;
  createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>>;
  updatePost(id: Id<'blogPosts'>, data: Partial<PostFormData>, userId: Id<"userProfiles">): Promise<void>;
  deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void>;
  publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void>;
  schedulePost(id: Id<'blogPosts'>, scheduledFor: number, userId: Id<"userProfiles">): Promise<void>;
  unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void>;

  // Category operations
  getCategories(): Promise<BlogCategory[]>;
  getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null>;
  createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>>;
  updateCategory(id: Id<'blogCategories'>, data: Partial<CategoryFormData>, userId: Id<"userProfiles">): Promise<void>;
  deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void>;

  // Tag operations
  getTags(): Promise<BlogTag[]>;
  getTag(id: Id<'blogTags'>): Promise<BlogTag | null>;
  createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>>;
  updateTag(id: Id<'blogTags'>, data: Partial<TagFormData>, userId: Id<"userProfiles">): Promise<void>;
  deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void>;

  // Author operations
  getAuthors(): Promise<BlogAuthor[]>;
  getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null>;
  getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null>;
  createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>>;
  updateAuthor(id: Id<'blogAuthors'>, data: Partial<AuthorFormData>, userId: Id<"userProfiles">): Promise<void>;

  // Search & Analytics
  searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]>;
  getPostStatistics(authorId?: string): Promise<BlogStatistics>;

  // Media operations (optional - for providers that support it)
  uploadMedia?(file: File, userId: Id<"userProfiles">): Promise<{ url: string; id?: string }>;
  deleteMedia?(id: string, userId: Id<"userProfiles">): Promise<void>;
}

/**
 * ============================================
 * HOOK RETURN TYPES
 * ============================================
 */

export interface UseBlogReturn {
  provider: BlogProvider;
  config: BlogProviderConfig;
  isReady: boolean;
  error?: Error;
}

export interface UsePostsReturn {
  posts: BlogPost[];
  loading: boolean;
  error?: Error;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export interface UsePostReturn {
  post: PostWithRelations | null;
  loading: boolean;
  error?: Error;
  refresh: () => void;
  incrementViews: () => void;
}

export interface UsePostEditorReturn {
  formData: PostFormData;
  setFormData: (data: PostFormData) => void;
  editorState: EditorState;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  schedule: (date: Date) => Promise<void>;
  saveDraft: () => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  error?: Error;
}

/**
 * ============================================
 * UTILITY TYPES
 * ============================================
 */

export interface ShareUrls {
  twitter: string;
  facebook: string;
  linkedin: string;
  reddit: string;
  email: string;
}

export interface TableOfContentsItem {
  title: string;
  level: number;
  id: string;
  children?: TableOfContentsItem[];
}

export interface ReadingProgress {
  percent: number;
  timeRemaining: number; // in minutes
}

/**
 * ============================================
 * EXPORT ALL
 * ============================================
 */

export type {
  Id,
};
