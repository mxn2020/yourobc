// src/features/system/blog/services/BlogService.ts
/**
 * Blog Service - Facade Pattern
 *
 * Main service that manages blog providers and provides a unified API
 * Similar to PaymentService architecture
 */

import type { ConvexClient } from 'convex/browser';
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
} from '../types';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { InternalBlogProvider } from '../providers/internal';
import {
  PROVIDER_CONFIGS,
  getPrimaryProvider,
  getProviderConfig,
  isProviderEnabled,
  validateBlogConfig,
} from '../config';

export class BlogService {
  private static instance: BlogService | null = null;
  private providers: Map<BlogProviderType, BlogProvider> = new Map();
  private activeProvider: BlogProvider | null = null;
  private convex: ConvexClient;
  private initialized = false;

  private constructor(convex: ConvexClient) {
    this.convex = convex;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(convex: ConvexClient): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService(convex);
    }
    return BlogService.instance;
  }

  /**
   * Reset instance (useful for testing)
   */
  public static resetInstance(): void {
    BlogService.instance = null;
  }

  /**
   * Initialize the blog service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Validate configuration
    const validation = validateBlogConfig();
    if (!validation.valid) {
      console.error('Blog configuration errors:', validation.errors);
      throw new Error(`Blog configuration is invalid: ${validation.errors.join(', ')}`);
    }

    // Initialize internal provider (always available)
    const internalConfig = getProviderConfig('internal');
    const internalProvider = new InternalBlogProvider(this.convex, internalConfig);
    this.providers.set('internal', internalProvider);

    // TODO: Initialize external providers (Ghost, Contentful, Sanity)
    // These will be implemented in later phases
    /*
    if (isProviderEnabled('ghost')) {
      const ghostConfig = getProviderConfig('ghost');
      const ghostProvider = new GhostBlogProvider(ghostConfig);
      this.providers.set('ghost', ghostProvider);
    }

    if (isProviderEnabled('contentful')) {
      const contentfulConfig = getProviderConfig('contentful');
      const contentfulProvider = new ContentfulBlogProvider(contentfulConfig);
      this.providers.set('contentful', contentfulProvider);
    }

    if (isProviderEnabled('sanity')) {
      const sanityConfig = getProviderConfig('sanity');
      const sanityProvider = new SanityBlogProvider(sanityConfig);
      this.providers.set('sanity', sanityProvider);
    }
    */

    // Set active provider
    const primaryProviderType = getPrimaryProvider();
    const primaryProvider = this.providers.get(primaryProviderType);

    if (!primaryProvider) {
      throw new Error(`Primary provider "${primaryProviderType}" is not available`);
    }

    this.activeProvider = primaryProvider;
    this.initialized = true;

    console.log(`Blog service initialized with provider: ${primaryProviderType}`);
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.activeProvider) {
      throw new Error('Blog service is not initialized. Call initialize() first.');
    }
  }

  /**
   * Get the active provider
   */
  public getActiveProvider(): BlogProvider {
    this.ensureInitialized();
    return this.activeProvider!;
  }

  /**
   * Switch to a different provider
   */
  public switchProvider(providerType: BlogProviderType): void {
    this.ensureInitialized();

    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider "${providerType}" is not available`);
    }

    this.activeProvider = provider;
    console.log(`Switched to blog provider: ${providerType}`);
  }

  /**
   * Get all available providers
   */
  public getAvailableProviders(): BlogProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   */
  public isProviderAvailable(providerType: BlogProviderType): boolean {
    return this.providers.has(providerType);
  }

  /**
   * Get provider configuration
   */
  public getProviderConfig(providerType: BlogProviderType): BlogProviderConfig | undefined {
    return this.providers.get(providerType)?.config;
  }

  /**
   * ============================================
   * POST OPERATIONS (delegated to active provider)
   * ============================================
   */

  async getPosts(filters?: PostFilters): Promise<BlogPost[]> {
    this.ensureInitialized();
    return this.activeProvider!.getPosts(filters);
  }

  async getPost(id: string): Promise<BlogPost | null> {
    this.ensureInitialized();
    return this.activeProvider!.getPost(id);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    this.ensureInitialized();
    return this.activeProvider!.getPostBySlug(slug);
  }

  async createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>> {
    this.ensureInitialized();
    return this.activeProvider!.createPost(data, userId);
  }

  async updatePost(
    id: Id<'blogPosts'>,
    data: Partial<PostFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.updatePost(id, data, userId);
  }

  async deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.deletePost(id, userId);
  }

  async publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.publishPost(id, userId);
  }

  async schedulePost(id: Id<'blogPosts'>, scheduledFor: number, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.schedulePost(id, scheduledFor, userId);
  }

  async unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.unpublishPost(id, userId);
  }

  /**
   * ============================================
   * CATEGORY OPERATIONS
   * ============================================
   */

  async getCategories(): Promise<BlogCategory[]> {
    this.ensureInitialized();
    return this.activeProvider!.getCategories();
  }

  async getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null> {
    this.ensureInitialized();
    return this.activeProvider!.getCategory(id);
  }

  async createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>> {
    this.ensureInitialized();
    return this.activeProvider!.createCategory(data, userId);
  }

  async updateCategory(
    id: Id<'blogCategories'>,
    data: Partial<CategoryFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.updateCategory(id, data, userId);
  }

  async deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.deleteCategory(id, userId);
  }

  /**
   * ============================================
   * TAG OPERATIONS
   * ============================================
   */

  async getTags(): Promise<BlogTag[]> {
    this.ensureInitialized();
    return this.activeProvider!.getTags();
  }

  async getTag(id: Id<'blogTags'>): Promise<BlogTag | null> {
    this.ensureInitialized();
    return this.activeProvider!.getTag(id);
  }

  async createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>> {
    this.ensureInitialized();
    return this.activeProvider!.createTag(data, userId);
  }

  async updateTag(id: Id<'blogTags'>, data: Partial<TagFormData>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.updateTag(id, data, userId);
  }

  async deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.deleteTag(id, userId);
  }

  /**
   * ============================================
   * AUTHOR OPERATIONS
   * ============================================
   */

  async getAuthors(): Promise<BlogAuthor[]> {
    this.ensureInitialized();
    return this.activeProvider!.getAuthors();
  }

  async getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null> {
    this.ensureInitialized();
    return this.activeProvider!.getAuthor(id);
  }

  async getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null> {
    this.ensureInitialized();
    return this.activeProvider!.getAuthorByUserId(userId);
  }

  async createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>> {
    this.ensureInitialized();
    return this.activeProvider!.createAuthor(data, userId);
  }

  async updateAuthor(
    id: Id<'blogAuthors'>,
    data: Partial<AuthorFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    this.ensureInitialized();
    return this.activeProvider!.updateAuthor(id, data, userId);
  }

  /**
   * ============================================
   * SEARCH & ANALYTICS
   * ============================================
   */

  async searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]> {
    this.ensureInitialized();
    return this.activeProvider!.searchPosts(query, filters);
  }

  async getPostStatistics(authorId?: string): Promise<BlogStatistics> {
    this.ensureInitialized();
    return this.activeProvider!.getPostStatistics(authorId);
  }

  /**
   * ============================================
   * MEDIA OPERATIONS
   * ============================================
   */

  async uploadMedia(file: File, userId: Id<"userProfiles">): Promise<{ url: string; id?: string }> {
    this.ensureInitialized();

    if (!this.activeProvider!.uploadMedia) {
      throw new Error('Media upload is not supported by the current provider');
    }

    return this.activeProvider!.uploadMedia(file, userId);
  }

  async deleteMedia(id: string, userId: Id<"userProfiles">): Promise<void> {
    this.ensureInitialized();

    if (!this.activeProvider!.deleteMedia) {
      throw new Error('Media deletion is not supported by the current provider');
    }

    return this.activeProvider!.deleteMedia(id, userId);
  }
}

export default BlogService;
