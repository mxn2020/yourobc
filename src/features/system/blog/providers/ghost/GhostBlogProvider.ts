// src/features/boilerplate/blog/providers/ghost/GhostBlogProvider.ts
/**
 * Ghost CMS Blog Provider
 *
 * Implements BlogProvider interface for Ghost CMS integration
 * Uses Ghost Content API for reading and Admin API for writing
 */

import type { Id } from '../../../../../../convex/_generated/dataModel';
import type {
  BlogProvider,
  BlogProviderConfig,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  PostFormData,
  PostFilters,
  CategoryFormData,
  TagFormData,
  AuthorFormData,
  BlogStatistics,
} from '../../types';

interface GhostConfig {
  url: string;
  contentApiKey: string;
  adminApiKey?: string;
  version?: string;
}

interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  markdown?: string;
  excerpt?: string;
  feature_image?: string;
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'members' | 'paid';
  created_at: string;
  published_at?: string;
  updated_at: string;
  tags?: GhostTag[];
  authors?: GhostAuthor[];
  primary_author?: GhostAuthor;
  primary_tag?: GhostTag;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  custom_excerpt?: string;
  reading_time?: number;
}

interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  feature_image?: string;
  visibility: 'public' | 'internal';
  meta_title?: string;
  meta_description?: string;
}

interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  website?: string;
  location?: string;
  facebook?: string;
  twitter?: string;
  meta_title?: string;
  meta_description?: string;
}

export class GhostBlogProvider implements BlogProvider {
  public readonly type = 'ghost' as const;
  private ghostConfig: GhostConfig;

  constructor(public config: BlogProviderConfig) {
    this.ghostConfig = this.parseConfig(config);
  }

  private parseConfig(config: BlogProviderConfig): GhostConfig {
    if (!config.credentials) {
      throw new Error('Ghost CMS credentials are required');
    }

    const { url, contentApiKey, adminApiKey, version = 'v5.0' } = config.credentials;

    if (!url || !contentApiKey) {
      throw new Error('Ghost CMS URL and Content API key are required');
    }

    return { url, contentApiKey, adminApiKey, version };
  }

  private async fetchGhostApi(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const { url, contentApiKey, version } = this.ghostConfig;
    const apiUrl = `${url}/ghost/api/${version}/content/${endpoint}`;

    // Add key to URL params
    const urlWithKey = new URL(apiUrl);
    urlWithKey.searchParams.set('key', contentApiKey);

    const response = await fetch(urlWithKey.toString(), {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ghost API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  }

  private async fetchGhostAdminApi(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const { url, adminApiKey, version } = this.ghostConfig;

    if (!adminApiKey) {
      throw new Error('Ghost Admin API key is required for write operations');
    }

    const apiUrl = `${url}/ghost/api/${version}/admin/${endpoint}`;

    const response = await fetch(apiUrl, {
      ...options,
      headers: {
        'Authorization': `Ghost ${adminApiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ghost Admin API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  }

  private convertGhostPostToBlogPost(ghostPost: GhostPost): BlogPost {
    return {
      _id: ghostPost.id as any, // Ghost uses string IDs
      _creationTime: new Date(ghostPost.created_at).getTime(),
      title: ghostPost.title,
      slug: ghostPost.slug,
      content: ghostPost.markdown || ghostPost.html,
      excerpt: ghostPost.custom_excerpt || ghostPost.excerpt,
      status: this.mapGhostStatus(ghostPost.status),
      visibility: this.mapGhostVisibility(ghostPost.visibility),
      featured: ghostPost.featured,
      featuredImage: ghostPost.feature_image ? {
        url: ghostPost.feature_image,
      } : undefined,
      tags: ghostPost.tags?.map(t => t.name) || [],
      authorId: ghostPost.primary_author?.id as any,
      authorName: ghostPost.primary_author?.name || 'Unknown',
      seoTitle: ghostPost.meta_title,
      seoDescription: ghostPost.meta_description,
      publishedAt: ghostPost.published_at ? new Date(ghostPost.published_at).getTime() : undefined,
      createdAt: new Date(ghostPost.created_at).getTime(),
      updatedAt: new Date(ghostPost.updated_at).getTime(),
      createdBy: ghostPost.primary_author?.id || 'unknown',
      updatedBy: ghostPost.primary_author?.id || 'unknown',
      viewCount: 0, // Ghost doesn't provide view count via API
      provider: 'ghost',
    } as BlogPost;
  }

  private mapGhostStatus(status: string): 'draft' | 'scheduled' | 'published' | 'archived' {
    switch (status) {
      case 'published':
        return 'published';
      case 'scheduled':
        return 'scheduled';
      case 'draft':
      default:
        return 'draft';
    }
  }

  private mapGhostVisibility(visibility: string): 'public' | 'private' | 'unlisted' {
    switch (visibility) {
      case 'public':
        return 'public';
      case 'members':
      case 'paid':
        return 'private';
      default:
        return 'public';
    }
  }

  // Post operations
  async getPosts(filters?: PostFilters): Promise<BlogPost[]> {
    try {
      let queryParams = 'include=tags,authors&limit=all';

      if (filters?.status) {
        queryParams += `&filter=status:${filters.status}`;
      }
      if (filters?.featured) {
        queryParams += `&filter=featured:true`;
      }
      if (filters?.tag) {
        queryParams += `&filter=tag:${filters.tag}`;
      }

      const response = await this.fetchGhostApi(`posts/?${queryParams}`);
      const ghostPosts: GhostPost[] = response.posts || [];

      return ghostPosts.map(post => this.convertGhostPostToBlogPost(post));
    } catch (error) {
      console.error('Error fetching Ghost posts:', error);
      throw error;
    }
  }

  async getPost(id: string): Promise<BlogPost | null> {
    try {
      const response = await this.fetchGhostApi(`posts/${id}/?include=tags,authors`);
      const ghostPost: GhostPost = response.posts[0];

      if (!ghostPost) return null;

      return this.convertGhostPostToBlogPost(ghostPost);
    } catch (error) {
      console.error('Error fetching Ghost post:', error);
      return null;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await this.fetchGhostApi(`posts/slug/${slug}/?include=tags,authors`);
      const ghostPost: GhostPost = response.posts[0];

      if (!ghostPost) return null;

      return this.convertGhostPostToBlogPost(ghostPost);
    } catch (error) {
      console.error('Error fetching Ghost post by slug:', error);
      return null;
    }
  }

  async createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>> {
    try {
      const ghostPost = {
        title: data.title,
        markdown: data.content,
        excerpt: data.excerpt,
        feature_image: data.featuredImage?.url,
        meta_title: data.seoTitle,
        meta_description: data.seoDescription,
        status: 'draft',
        visibility: data.visibility === 'private' ? 'members' : 'public',
      };

      const response = await this.fetchGhostAdminApi('posts/', {
        method: 'POST',
        body: JSON.stringify({ posts: [ghostPost] }),
      });

      return response.posts[0].id as Id<'blogPosts'>;
    } catch (error) {
      console.error('Error creating Ghost post:', error);
      throw error;
    }
  }

  async updatePost(id: Id<'blogPosts'>, data: Partial<PostFormData>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const ghostPost: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.title) ghostPost.title = data.title;
      if (data.content) ghostPost.markdown = data.content;
      if (data.excerpt) ghostPost.excerpt = data.excerpt;
      if (data.featuredImage) ghostPost.feature_image = data.featuredImage.url;
      if (data.seoTitle) ghostPost.meta_title = data.seoTitle;
      if (data.seoDescription) ghostPost.meta_description = data.seoDescription;

      await this.fetchGhostAdminApi(`posts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ posts: [ghostPost] }),
      });
    } catch (error) {
      console.error('Error updating Ghost post:', error);
      throw error;
    }
  }

  async deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`posts/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting Ghost post:', error);
      throw error;
    }
  }

  async publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`posts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          posts: [{
            status: 'published',
            published_at: new Date().toISOString(),
          }],
        }),
      });
    } catch (error) {
      console.error('Error publishing Ghost post:', error);
      throw error;
    }
  }

  async schedulePost(id: Id<'blogPosts'>, scheduledFor: number, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`posts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          posts: [{
            status: 'scheduled',
            published_at: new Date(scheduledFor).toISOString(),
          }],
        }),
      });
    } catch (error) {
      console.error('Error scheduling Ghost post:', error);
      throw error;
    }
  }

  async unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`posts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          posts: [{
            status: 'draft',
          }],
        }),
      });
    } catch (error) {
      console.error('Error unpublishing Ghost post:', error);
      throw error;
    }
  }

  // Category operations (Ghost doesn't have categories, using tags as categories)
  async getCategories(): Promise<BlogCategory[]> {
    // Ghost doesn't have categories - return empty array
    // You could map tags to categories if needed
    return [];
  }

  async getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null> {
    return null;
  }

  async createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>> {
    throw new Error('Ghost CMS does not support categories - use tags instead');
  }

  async updateCategory(id: Id<'blogCategories'>, data: Partial<CategoryFormData>, userId: Id<"userProfiles">): Promise<void> {
    throw new Error('Ghost CMS does not support categories - use tags instead');
  }

  async deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void> {
    throw new Error('Ghost CMS does not support categories - use tags instead');
  }

  // Tag operations
  async getTags(): Promise<BlogTag[]> {
    try {
      const response = await this.fetchGhostApi('tags/?limit=all&include=count.posts');
      const ghostTags: GhostTag[] = response.tags || [];

      return ghostTags.map(tag => ({
        _id: tag.id as any,
        _creationTime: Date.now(),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        seoTitle: tag.meta_title,
        seoDescription: tag.meta_description,
        createdAt: Date.now(),
        createdBy: 'ghost',
        updatedAt: Date.now(),
        updatedBy: 'ghost',
      } as BlogTag));
    } catch (error) {
      console.error('Error fetching Ghost tags:', error);
      return [];
    }
  }

  async getTag(id: Id<'blogTags'>): Promise<BlogTag | null> {
    try {
      const response = await this.fetchGhostApi(`tags/${id}/`);
      const tag: GhostTag = response.tags[0];

      if (!tag) return null;

      return {
        _id: tag.id as any,
        _creationTime: Date.now(),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        createdAt: Date.now(),
        createdBy: 'ghost',
        updatedAt: Date.now(),
        updatedBy: 'ghost',
      } as BlogTag;
    } catch (error) {
      console.error('Error fetching Ghost tag:', error);
      return null;
    }
  }

  async createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>> {
    try {
      const response = await this.fetchGhostAdminApi('tags/', {
        method: 'POST',
        body: JSON.stringify({
          tags: [{
            name: data.name,
            slug: data.slug,
            description: data.description,
            meta_title: data.seoTitle,
            meta_description: data.seoDescription,
          }],
        }),
      });

      return response.tags[0].id as Id<'blogTags'>;
    } catch (error) {
      console.error('Error creating Ghost tag:', error);
      throw error;
    }
  }

  async updateTag(id: Id<'blogTags'>, data: Partial<TagFormData>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`tags/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          tags: [{
            name: data.name,
            description: data.description,
            meta_title: data.seoTitle,
            meta_description: data.seoDescription,
          }],
        }),
      });
    } catch (error) {
      console.error('Error updating Ghost tag:', error);
      throw error;
    }
  }

  async deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.fetchGhostAdminApi(`tags/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting Ghost tag:', error);
      throw error;
    }
  }

  // Author operations
  async getAuthors(): Promise<BlogAuthor[]> {
    try {
      const response = await this.fetchGhostApi('authors/?limit=all&include=count.posts');
      const ghostAuthors: GhostAuthor[] = response.authors || [];

      return ghostAuthors.map(author => ({
        _id: author.id as any,
        _creationTime: Date.now(),
        userId: author.slug, // Use slug as userId fallback
        name: author.name,
        slug: author.slug,
        email: `${author.slug}@ghost.local`, // Ghost doesn't expose email via Content API
        bio: author.bio,
        avatar: author.profile_image,
        coverImage: author.cover_image,
        website: author.website,
        twitter: author.twitter,
        facebook: author.facebook,
        createdAt: Date.now(),
        createdBy: 'ghost',
        updatedAt: Date.now(),
        updatedBy: 'ghost',
      } as BlogAuthor));
    } catch (error) {
      console.error('Error fetching Ghost authors:', error);
      return [];
    }
  }

  async getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null> {
    try {
      const response = await this.fetchGhostApi(`authors/${id}/`);
      const author: GhostAuthor = response.authors[0];

      if (!author) return null;

      return {
        _id: author.id as any,
        _creationTime: Date.now(),
        userId: author.slug,
        name: author.name,
        slug: author.slug,
        email: `${author.slug}@ghost.local`,
        bio: author.bio,
        avatar: author.profile_image,
        website: author.website,
        twitter: author.twitter,
        facebook: author.facebook,
        createdAt: Date.now(),
        createdBy: 'ghost',
        updatedAt: Date.now(),
        updatedBy: 'ghost',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Ghost author:', error);
      return null;
    }
  }

  async getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null> {
    try {
      const response = await this.fetchGhostApi(`authors/slug/${userId}/`);
      const author: GhostAuthor = response.authors[0];

      if (!author) return null;

      return {
        _id: author.id as any,
        _creationTime: Date.now(),
        userId: author.slug,
        name: author.name,
        slug: author.slug,
        email: `${author.slug}@ghost.local`,
        bio: author.bio,
        avatar: author.profile_image,
        twitter: author.twitter,
        facebook: author.facebook,
        createdAt: Date.now(),
        createdBy: 'ghost',
        updatedAt: Date.now(),
        updatedBy: 'ghost',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Ghost author by userId:', error);
      return null;
    }
  }

  async createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>> {
    throw new Error('Ghost CMS does not allow creating authors via API - must be done in Ghost admin');
  }

  async updateAuthor(id: Id<'blogAuthors'>, data: Partial<AuthorFormData>, userId: Id<"userProfiles">): Promise<void> {
    throw new Error('Ghost CMS does not allow updating authors via API - must be done in Ghost admin');
  }

  // Search & Analytics
  async searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]> {
    // Ghost Content API doesn't support full-text search
    // Fallback to filtering by title
    try {
      const posts = await this.getPosts(filters);
      const lowerQuery = query.toLowerCase();

      return posts.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt?.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching Ghost posts:', error);
      return [];
    }
  }

  async getPostStatistics(authorId?: string): Promise<BlogStatistics> {
    try {
      const posts = await this.getPosts(authorId ? { authorId } : undefined);

      const totalPosts = posts.length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;
      const draftPosts = posts.filter(p => p.status === 'draft').length;
      const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
      const archivedPosts = posts.filter(p => p.status === 'archived').length;

      // Get unique authors, categories, and tags
      const authors = await this.getAuthors();
      const categories = await this.getCategories();
      const tags = await this.getTags();

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        archivedPosts,
        totalViews: 0, // Ghost doesn't provide view counts
        totalComments: 0, // Ghost doesn't provide comment counts via API
        totalLikes: 0, // Ghost doesn't provide likes
        totalAuthors: authors.length,
        totalCategories: categories.length,
        totalTags: tags.length,
      };
    } catch (error) {
      console.error('Error fetching Ghost statistics:', error);
      return {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        scheduledPosts: 0,
        archivedPosts: 0,
        totalViews: 0,
        totalComments: 0,
        totalLikes: 0,
        totalAuthors: 0,
        totalCategories: 0,
        totalTags: 0,
      };
    }
  }
}

export default GhostBlogProvider;
