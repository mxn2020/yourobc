// src/features/system/blog/providers/internal/InternalBlogProvider.ts
/**
 * Internal Blog Provider (Convex)
 *
 * Implementation of BlogProvider interface using Convex as backend
 */

import type { ConvexClient } from 'convex/browser';
import type { FunctionReference } from 'convex/server';
import type { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import type {
  BlogProvider,
  BlogProviderType,
  BlogProviderConfig,
  PostFormData,
  PostFilters,
  CategoryFormData,
  TagFormData,
  AuthorFormData,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  BlogStatistics,
} from '../../types';

export class InternalBlogProvider implements BlogProvider {
  public readonly type: BlogProviderType = 'internal';
  public readonly config: BlogProviderConfig;
  private convex: ConvexClient;

  constructor(convex: ConvexClient, config: BlogProviderConfig) {
    this.convex = convex;
    this.config = config;
  }

  /**
   * ============================================
   * POST OPERATIONS
   * ============================================
   */

  async getPosts(filters?: PostFilters): Promise<BlogPost[]> {
    const result = await this.convex.query(
      'lib/system/blog/queries:getPosts' as unknown as FunctionReference<
        'query',
        'public',
        { status?: string; authorId?: string; categoryId?: string; tag?: string; featured?: boolean },
        { posts: BlogPost[]; total: number; hasMore: boolean }
      >,
      {
        status: filters?.status,
        authorId: filters?.authorId,
        categoryId: filters?.categoryId,
        tag: filters?.tag,
        featured: filters?.featured,
      }
    );
    return result.posts;
  }

  async getPost(id: string): Promise<BlogPost | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getPost' as unknown as FunctionReference<
        'query',
        'public',
        { postId: Id<'blogPosts'> },
        BlogPost | null
      >,
      { postId: id as Id<'blogPosts'> }
    );
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getPostBySlug' as unknown as FunctionReference<
        'query',
        'public',
        { slug: string },
        BlogPost | null
      >,
      { slug }
    );
  }

  async createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>> {
    return await this.convex.mutation(
      'lib/system/blog/mutations:createPost' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        Id<'blogPosts'>
      >,
      {
        authUserId: userId,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        tags: data.tags,
        featuredImage: data.featuredImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        focusKeyword: data.focusKeyword,
        allowComments: data.allowComments,
        visibility: data.visibility,
        series: data.series,
        seriesOrder: data.seriesOrder,
      }
    );
  }

  async updatePost(
    id: Id<'blogPosts'>,
    data: Partial<PostFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:updatePost' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        void
      >,
      {
        authUserId: userId,
        postId: id,
        ...data,
      }
    );
  }

  async deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:deletePost' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; postId: Id<'blogPosts'> },
        void
      >,
      {
        authUserId: userId,
        postId: id,
      }
    );
  }

  async publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:publishPost' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; postId: Id<'blogPosts'> },
        void
      >,
      {
        authUserId: userId,
        postId: id,
      }
    );
  }

  async schedulePost(
    id: Id<'blogPosts'>,
    scheduledFor: number,
    userId: Id<"userProfiles">
  ): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:schedulePost' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; postId: Id<'blogPosts'>; scheduledFor: number },
        void
      >,
      {
        authUserId: userId,
        postId: id,
        scheduledFor,
      }
    );
  }

  async unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:unpublishPost' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; postId: Id<'blogPosts'> },
        void
      >,
      {
        authUserId: userId,
        postId: id,
      }
    );
  }

  /**
   * ============================================
   * CATEGORY OPERATIONS
   * ============================================
   */

  async getCategories(): Promise<BlogCategory[]> {
    return await this.convex.query(
      'lib/system/blog/queries:getCategories' as unknown as FunctionReference<
        'query',
        'public',
        {},
        BlogCategory[]
      >,
      {}
    );
  }

  async getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getCategory' as unknown as FunctionReference<
        'query',
        'public',
        { categoryId: Id<'blogCategories'> },
        BlogCategory | null
      >,
      { categoryId: id }
    );
  }

  async createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>> {
    return await this.convex.mutation(
      'lib/system/blog/mutations:createCategory' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        Id<'blogCategories'>
      >,
      {
        authUserId: userId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        color: data.color,
        icon: data.icon,
        coverImage: data.coverImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        order: data.order,
      }
    );
  }

  async updateCategory(
    id: Id<'blogCategories'>,
    data: Partial<CategoryFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:updateCategory' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        void
      >,
      {
        authUserId: userId,
        categoryId: id,
        ...data,
      }
    );
  }

  async deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:deleteCategory' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; categoryId: Id<'blogCategories'> },
        void
      >,
      {
        authUserId: userId,
        categoryId: id,
      }
    );
  }

  /**
   * ============================================
   * TAG OPERATIONS
   * ============================================
   */

  async getTags(): Promise<BlogTag[]> {
    return await this.convex.query(
      'lib/system/blog/queries:getTags' as unknown as FunctionReference<
        'query',
        'public',
        {},
        BlogTag[]
      >,
      {}
    );
  }

  async getTag(id: Id<'blogTags'>): Promise<BlogTag | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getTag' as unknown as FunctionReference<
        'query',
        'public',
        { tagId: Id<'blogTags'> },
        BlogTag | null
      >,
      { tagId: id }
    );
  }

  async createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>> {
    return await this.convex.mutation(
      'lib/system/blog/mutations:createTag' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        Id<'blogTags'>
      >,
      {
        authUserId: userId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      }
    );
  }

  async updateTag(
    id: Id<'blogTags'>,
    data: Partial<TagFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:updateTag' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        void
      >,
      {
        authUserId: userId,
        tagId: id,
        ...data,
      }
    );
  }

  async deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:deleteTag' as unknown as FunctionReference<
        'mutation',
        'public',
        { authUserId: string; tagId: Id<'blogTags'> },
        void
      >,
      {
        authUserId: userId,
        tagId: id,
      }
    );
  }

  /**
   * ============================================
   * AUTHOR OPERATIONS
   * ============================================
   */

  async getAuthors(): Promise<BlogAuthor[]> {
    return await this.convex.query(
      'lib/system/blog/queries:getAuthors' as unknown as FunctionReference<
        'query',
        'public',
        {},
        BlogAuthor[]
      >,
      {}
    );
  }

  async getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getAuthor' as unknown as FunctionReference<
        'query',
        'public',
        { authorId: Id<'blogAuthors'> },
        BlogAuthor | null
      >,
      { authorId: id }
    );
  }

  async getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null> {
    return await this.convex.query(
      'lib/system/blog/queries:getAuthorByUserId' as unknown as FunctionReference<
        'query',
        'public',
        { userId: Id<"userProfiles"> },
        BlogAuthor | null
      >,
      { userId }
    );
  }

  async createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>> {
    return await this.convex.mutation(
      'lib/system/blog/mutations:createAuthor' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        Id<'blogAuthors'>
      >,
      {
        authUserId: userId,
        userId: data.userId,
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        avatar: data.avatar,
        email: data.email,
        website: data.website,
        socialLinks: data.socialLinks,
        isActive: data.isActive,
      }
    );
  }

  async updateAuthor(
    id: Id<'blogAuthors'>,
    data: Partial<AuthorFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    await this.convex.mutation(
      'lib/system/blog/mutations:updateAuthor' as unknown as FunctionReference<
        'mutation',
        'public',
        any,
        void
      >,
      {
        authUserId: userId,
        authorId: id,
        ...data,
      }
    );
  }

  /**
   * ============================================
   * SEARCH & ANALYTICS
   * ============================================
   */

  async searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]> {
    return await this.convex.query(
      'lib/system/blog/queries:searchPosts' as unknown as FunctionReference<
        'query',
        'public',
        { query: string; status?: string },
        BlogPost[]
      >,
      {
        query,
        status: filters?.status,
      }
    );
  }

  async getPostStatistics(authorId?: string): Promise<BlogStatistics> {
    return await this.convex.query(
      'lib/system/blog/queries:getPostStatistics' as unknown as FunctionReference<
        'query',
        'public',
        { authorId?: string },
        BlogStatistics
      >,
      { authorId }
    );
  }

  /**
   * ============================================
   * MEDIA OPERATIONS
   * ============================================
   */

  async uploadMedia(file: File, userId: Id<"userProfiles">): Promise<{ url: string; id?: string }> {
    // For Convex, we use the file storage API
    // This is a placeholder - actual implementation depends on your file upload setup
    throw new Error('Media upload not implemented yet. Use Convex file storage API.');
  }

  async deleteMedia(id: string, userId: Id<"userProfiles">): Promise<void> {
    // Placeholder for media deletion
    throw new Error('Media deletion not implemented yet.');
  }
}

export default InternalBlogProvider;
