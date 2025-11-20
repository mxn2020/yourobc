// src/features/system/blog/providers/contentful/ContentfulBlogProvider.ts
/**
 * Contentful Blog Provider
 *
 * Implements BlogProvider interface for Contentful CMS integration
 * Uses Contentful Delivery API for reading and Management API for writing
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

interface ContentfulConfig {
  spaceId: string;
  accessToken: string; // Delivery API token
  environment?: string;
  managementToken?: string; // Management API token (for write operations)
}

interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: Record<string, any>;
}

export class ContentfulBlogProvider implements BlogProvider {
  public readonly type = 'contentful' as const;
  private contentfulConfig: ContentfulConfig;
  private readonly baseUrl = 'https://cdn.contentful.com';
  private readonly managementBaseUrl = 'https://api.contentful.com';

  constructor(public config: BlogProviderConfig) {
    this.contentfulConfig = this.parseConfig(config);
  }

  private parseConfig(config: BlogProviderConfig): ContentfulConfig {
    if (!config.credentials) {
      throw new Error('Contentful credentials are required');
    }

    const {
      spaceId,
      accessToken,
      environment = 'master',
      managementToken,
    } = config.credentials;

    if (!spaceId || !accessToken) {
      throw new Error('Contentful Space ID and Access Token are required');
    }

    return { spaceId, accessToken, environment, managementToken };
  }

  private async fetchContentful(endpoint: string, options: RequestInit = {}): Promise<any> {
    const { spaceId, accessToken, environment } = this.contentfulConfig;
    const url = `${this.baseUrl}/spaces/${spaceId}/environments/${environment}/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Contentful API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private async fetchContentfulManagement(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const { spaceId, environment, managementToken } = this.contentfulConfig;

    if (!managementToken) {
      throw new Error('Contentful Management Token is required for write operations');
    }

    const url = `${this.managementBaseUrl}/spaces/${spaceId}/environments/${environment}/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Contentful Management API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private convertContentfulEntryToBlogPost(entry: ContentfulEntry): BlogPost {
    const fields = entry.fields;

    return {
      _id: entry.sys.id as any,
      _creationTime: new Date(entry.sys.createdAt).getTime(),
      title: fields.title || 'Untitled',
      slug: fields.slug || entry.sys.id,
      content: fields.content || fields.body || '',
      excerpt: fields.excerpt || fields.description,
      status: this.mapContentfulStatus(entry.sys.publishedAt),
      visibility: fields.visibility || 'public',
      featured: fields.featured || false,
      featuredImage: fields.featuredImage ? {
        url: `https:${fields.featuredImage.fields?.file?.url}`,
        alt: fields.featuredImage.fields?.title,
      } : undefined,
      tags: fields.tags || [],
      categoryId: fields.category?.sys?.id as any,
      authorId: fields.author?.sys?.id as any,
      authorName: fields.author?.fields?.name || 'Unknown',
      seoTitle: fields.seoTitle || fields.metaTitle,
      seoDescription: fields.seoDescription || fields.metaDescription,
      seoKeywords: fields.seoKeywords || fields.keywords,
      publishedAt: entry.sys.publishedAt ? new Date(entry.sys.publishedAt).getTime() : undefined,
      createdAt: new Date(entry.sys.createdAt).getTime(),
      updatedAt: new Date(entry.sys.updatedAt).getTime(),
      createdBy: 'contentful',
      updatedBy: 'contentful',
      viewCount: 0,
      provider: 'contentful',
    } as BlogPost;
  }

  private mapContentfulStatus(publishedAt?: string): 'draft' | 'published' {
    return publishedAt ? 'published' : 'draft';
  }

  // Post operations
  async getPosts(filters?: PostFilters): Promise<BlogPost[]> {
    try {
      let query = 'entries?content_type=blogPost&limit=1000';

      if (filters?.status === 'published') {
        query += '&sys.publishedAt[exists]=true';
      } else if (filters?.status === 'draft') {
        query += '&sys.publishedAt[exists]=false';
      }

      if (filters?.categoryId) {
        query += `&fields.category.sys.id=${filters.categoryId}`;
      }

      if (filters?.tag) {
        query += `&fields.tags[in]=${filters.tag}`;
      }

      if (filters?.featured) {
        query += '&fields.featured=true';
      }

      const response = await this.fetchContentful(query);
      const entries: ContentfulEntry[] = response.items || [];

      return entries.map(entry => this.convertContentfulEntryToBlogPost(entry));
    } catch (error) {
      console.error('Error fetching Contentful posts:', error);
      return [];
    }
  }

  async getPost(id: string): Promise<BlogPost | null> {
    try {
      const entry = await this.fetchContentful(`entries/${id}`);
      return this.convertContentfulEntryToBlogPost(entry);
    } catch (error) {
      console.error('Error fetching Contentful post:', error);
      return null;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await this.fetchContentful(
        `entries?content_type=blogPost&fields.slug=${slug}&limit=1`
      );

      const entries: ContentfulEntry[] = response.items || [];
      if (entries.length === 0) return null;

      return this.convertContentfulEntryToBlogPost(entries[0]);
    } catch (error) {
      console.error('Error fetching Contentful post by slug:', error);
      return null;
    }
  }

  async createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>> {
    try {
      const entry = {
        fields: {
          title: { 'en-US': data.title },
          slug: { 'en-US': data.slug || data.title.toLowerCase().replace(/\s+/g, '-') },
          content: { 'en-US': data.content },
          excerpt: { 'en-US': data.excerpt },
          featured: { 'en-US': false },
          tags: { 'en-US': data.tags },
          seoTitle: { 'en-US': data.seoTitle },
          seoDescription: { 'en-US': data.seoDescription },
          seoKeywords: { 'en-US': data.seoKeywords },
        },
      };

      const response = await this.fetchContentfulManagement('entries', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'X-Contentful-Content-Type': 'blogPost',
        },
      });

      return response.sys.id as Id<'blogPosts'>;
    } catch (error) {
      console.error('Error creating Contentful post:', error);
      throw error;
    }
  }

  async updatePost(
    id: Id<'blogPosts'>,
    data: Partial<PostFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      // First, get the current entry to get its version
      const currentEntry = await this.fetchContentfulManagement(`entries/${id}`);
      const version = currentEntry.sys.version;

      const fields: Record<string, any> = {};

      if (data.title) fields.title = { 'en-US': data.title };
      if (data.content) fields.content = { 'en-US': data.content };
      if (data.excerpt) fields.excerpt = { 'en-US': data.excerpt };
      if (data.tags) fields.tags = { 'en-US': data.tags };
      if (data.seoTitle) fields.seoTitle = { 'en-US': data.seoTitle };
      if (data.seoDescription) fields.seoDescription = { 'en-US': data.seoDescription };
      if (data.seoKeywords) fields.seoKeywords = { 'en-US': data.seoKeywords };

      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fields }),
        headers: {
          'X-Contentful-Version': version.toString(),
        },
      });
    } catch (error) {
      console.error('Error updating Contentful post:', error);
      throw error;
    }
  }

  async deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      // First unpublish if published
      try {
        const entry = await this.fetchContentfulManagement(`entries/${id}`);
        if (entry.sys.publishedVersion) {
          await this.fetchContentfulManagement(`entries/${id}/published`, {
            method: 'DELETE',
            headers: {
              'X-Contentful-Version': entry.sys.version.toString(),
            },
          });
        }
      } catch (e) {
        // Entry might not be published
      }

      // Then delete
      const entry = await this.fetchContentfulManagement(`entries/${id}`);
      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error deleting Contentful post:', error);
      throw error;
    }
  }

  async publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const entry = await this.fetchContentfulManagement(`entries/${id}`);
      await this.fetchContentfulManagement(`entries/${id}/published`, {
        method: 'PUT',
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error publishing Contentful post:', error);
      throw error;
    }
  }

  async schedulePost(
    id: Id<'blogPosts'>,
    scheduledFor: number,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const entry = await this.fetchContentfulManagement(`entries/${id}`);

      await this.fetchContentfulManagement(`entries/${id}/scheduled_actions/publish`, {
        method: 'POST',
        body: JSON.stringify({
          entity: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: id,
            },
          },
          scheduledFor: {
            datetime: new Date(scheduledFor).toISOString(),
          },
        }),
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error scheduling Contentful post:', error);
      throw error;
    }
  }

  async unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const entry = await this.fetchContentfulManagement(`entries/${id}`);
      await this.fetchContentfulManagement(`entries/${id}/published`, {
        method: 'DELETE',
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error unpublishing Contentful post:', error);
      throw error;
    }
  }

  // Category operations
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const response = await this.fetchContentful('entries?content_type=blogCategory&limit=1000');
      const entries: ContentfulEntry[] = response.items || [];

      return entries.map(entry => ({
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        name: entry.fields.name || 'Unnamed Category',
        slug: entry.fields.slug || entry.sys.id,
        description: entry.fields.description,
        parentId: entry.fields.parent?.sys?.id as any,
        color: entry.fields.color,
        icon: entry.fields.icon,
        seoTitle: entry.fields.seoTitle,
        seoDescription: entry.fields.seoDescription,
        order: entry.fields.order || 0,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogCategory));
    } catch (error) {
      console.error('Error fetching Contentful categories:', error);
      return [];
    }
  }

  async getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null> {
    try {
      const entry = await this.fetchContentful(`entries/${id}`);

      return {
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        name: entry.fields.name,
        slug: entry.fields.slug,
        description: entry.fields.description,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogCategory;
    } catch (error) {
      console.error('Error fetching Contentful category:', error);
      return null;
    }
  }

  async createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>> {
    try {
      const entry = {
        fields: {
          name: { 'en-US': data.name },
          slug: { 'en-US': data.slug || data.name.toLowerCase().replace(/\s+/g, '-') },
          description: { 'en-US': data.description },
          color: { 'en-US': data.color },
          order: { 'en-US': data.order || 0 },
        },
      };

      const response = await this.fetchContentfulManagement('entries', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'X-Contentful-Content-Type': 'blogCategory',
        },
      });

      return response.sys.id as Id<'blogCategories'>;
    } catch (error) {
      console.error('Error creating Contentful category:', error);
      throw error;
    }
  }

  async updateCategory(
    id: Id<'blogCategories'>,
    data: Partial<CategoryFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const currentEntry = await this.fetchContentfulManagement(`entries/${id}`);
      const version = currentEntry.sys.version;

      const fields: Record<string, any> = {};

      if (data.name) fields.name = { 'en-US': data.name };
      if (data.description) fields.description = { 'en-US': data.description };
      if (data.color) fields.color = { 'en-US': data.color };
      if (data.order !== undefined) fields.order = { 'en-US': data.order };

      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fields }),
        headers: {
          'X-Contentful-Version': version.toString(),
        },
      });
    } catch (error) {
      console.error('Error updating Contentful category:', error);
      throw error;
    }
  }

  async deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const entry = await this.fetchContentfulManagement(`entries/${id}`);
      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error deleting Contentful category:', error);
      throw error;
    }
  }

  // Tag operations
  async getTags(): Promise<BlogTag[]> {
    try {
      const response = await this.fetchContentful('entries?content_type=blogTag&limit=1000');
      const entries: ContentfulEntry[] = response.items || [];

      return entries.map(entry => ({
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        name: entry.fields.name || 'Unnamed Tag',
        slug: entry.fields.slug || entry.sys.id,
        description: entry.fields.description,
        color: entry.fields.color,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogTag));
    } catch (error) {
      console.error('Error fetching Contentful tags:', error);
      return [];
    }
  }

  async getTag(id: Id<'blogTags'>): Promise<BlogTag | null> {
    try {
      const entry = await this.fetchContentful(`entries/${id}`);

      return {
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        name: entry.fields.name,
        slug: entry.fields.slug,
        description: entry.fields.description,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogTag;
    } catch (error) {
      console.error('Error fetching Contentful tag:', error);
      return null;
    }
  }

  async createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>> {
    try {
      const entry = {
        fields: {
          name: { 'en-US': data.name },
          slug: { 'en-US': data.slug || data.name.toLowerCase().replace(/\s+/g, '-') },
          description: { 'en-US': data.description },
          color: { 'en-US': data.color },
        },
      };

      const response = await this.fetchContentfulManagement('entries', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'X-Contentful-Content-Type': 'blogTag',
        },
      });

      return response.sys.id as Id<'blogTags'>;
    } catch (error) {
      console.error('Error creating Contentful tag:', error);
      throw error;
    }
  }

  async updateTag(id: Id<'blogTags'>, data: Partial<TagFormData>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const currentEntry = await this.fetchContentfulManagement(`entries/${id}`);
      const version = currentEntry.sys.version;

      const fields: Record<string, any> = {};

      if (data.name) fields.name = { 'en-US': data.name };
      if (data.description) fields.description = { 'en-US': data.description };
      if (data.color) fields.color = { 'en-US': data.color };

      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fields }),
        headers: {
          'X-Contentful-Version': version.toString(),
        },
      });
    } catch (error) {
      console.error('Error updating Contentful tag:', error);
      throw error;
    }
  }

  async deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const entry = await this.fetchContentfulManagement(`entries/${id}`);
      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Contentful-Version': entry.sys.version.toString(),
        },
      });
    } catch (error) {
      console.error('Error deleting Contentful tag:', error);
      throw error;
    }
  }

  // Author operations
  async getAuthors(): Promise<BlogAuthor[]> {
    try {
      const response = await this.fetchContentful('entries?content_type=author&limit=1000');
      const entries: ContentfulEntry[] = response.items || [];

      return entries.map(entry => ({
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        userId: entry.fields.userId || entry.sys.id,
        name: entry.fields.name || 'Unnamed Author',
        slug: entry.fields.slug || entry.sys.id,
        email: entry.fields.email || `${entry.fields.slug || entry.sys.id}@contentful.local`,
        bio: entry.fields.bio,
        avatar: entry.fields.avatar?.fields?.file?.url ? `https:${entry.fields.avatar.fields.file.url}` : undefined,
        website: entry.fields.website,
        twitter: entry.fields.twitter,
        facebook: entry.fields.facebook,
        linkedin: entry.fields.linkedin,
        github: entry.fields.github,
        instagram: entry.fields.instagram,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogAuthor));
    } catch (error) {
      console.error('Error fetching Contentful authors:', error);
      return [];
    }
  }

  async getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null> {
    try {
      const entry = await this.fetchContentful(`entries/${id}`);

      return {
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        userId: entry.fields.userId || entry.sys.id,
        name: entry.fields.name,
        slug: entry.fields.slug,
        email: entry.fields.email || `${entry.fields.slug}@contentful.local`,
        bio: entry.fields.bio,
        avatar: entry.fields.avatar?.fields?.file?.url ? `https:${entry.fields.avatar.fields.file.url}` : undefined,
        website: entry.fields.website,
        twitter: entry.fields.twitter,
        facebook: entry.fields.facebook,
        linkedin: entry.fields.linkedin,
        github: entry.fields.github,
        instagram: entry.fields.instagram,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Contentful author:', error);
      return null;
    }
  }

  async getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null> {
    try {
      const response = await this.fetchContentful(
        `entries?content_type=author&fields.userId=${userId}&limit=1`
      );

      const entries: ContentfulEntry[] = response.items || [];
      if (entries.length === 0) return null;

      const entry = entries[0];

      return {
        _id: entry.sys.id as any,
        _creationTime: new Date(entry.sys.createdAt).getTime(),
        userId: entry.fields.userId,
        name: entry.fields.name,
        slug: entry.fields.slug,
        email: entry.fields.email || `${entry.fields.slug}@contentful.local`,
        bio: entry.fields.bio,
        avatar: entry.fields.avatar?.fields?.file?.url ? `https:${entry.fields.avatar.fields.file.url}` : undefined,
        website: entry.fields.website,
        twitter: entry.fields.twitter,
        facebook: entry.fields.facebook,
        linkedin: entry.fields.linkedin,
        github: entry.fields.github,
        instagram: entry.fields.instagram,
        createdAt: new Date(entry.sys.createdAt).getTime(),
        createdBy: 'contentful',
        updatedAt: new Date(entry.sys.updatedAt).getTime(),
        updatedBy: 'contentful',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Contentful author by userId:', error);
      return null;
    }
  }

  async createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>> {
    try {
      const entry = {
        fields: {
          userId: { 'en-US': userId },
          name: { 'en-US': data.name },
          slug: { 'en-US': data.slug || data.name.toLowerCase().replace(/\s+/g, '-') },
          bio: { 'en-US': data.bio },
          email: { 'en-US': data.email },
          website: { 'en-US': data.website },
        },
      };

      const response = await this.fetchContentfulManagement('entries', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: {
          'X-Contentful-Content-Type': 'author',
        },
      });

      return response.sys.id as Id<'blogAuthors'>;
    } catch (error) {
      console.error('Error creating Contentful author:', error);
      throw error;
    }
  }

  async updateAuthor(
    id: Id<'blogAuthors'>,
    data: Partial<AuthorFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const currentEntry = await this.fetchContentfulManagement(`entries/${id}`);
      const version = currentEntry.sys.version;

      const fields: Record<string, any> = {};

      if (data.name) fields.name = { 'en-US': data.name };
      if (data.bio) fields.bio = { 'en-US': data.bio };
      if (data.email) fields.email = { 'en-US': data.email };
      if (data.website) fields.website = { 'en-US': data.website };

      await this.fetchContentfulManagement(`entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fields }),
        headers: {
          'X-Contentful-Version': version.toString(),
        },
      });
    } catch (error) {
      console.error('Error updating Contentful author:', error);
      throw error;
    }
  }

  // Search & Analytics
  async searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]> {
    try {
      let searchQuery = `entries?content_type=blogPost&query=${encodeURIComponent(query)}&limit=100`;

      if (filters?.status === 'published') {
        searchQuery += '&sys.publishedAt[exists]=true';
      }

      const response = await this.fetchContentful(searchQuery);
      const entries: ContentfulEntry[] = response.items || [];

      return entries.map(entry => this.convertContentfulEntryToBlogPost(entry));
    } catch (error) {
      console.error('Error searching Contentful posts:', error);
      return [];
    }
  }

  async getPostStatistics(authorId?: string): Promise<BlogStatistics> {
    try {
      let query = 'entries?content_type=blogPost&select=sys,fields.status&limit=1000';

      if (authorId) {
        query += `&fields.author.sys.id=${authorId}`;
      }

      const response = await this.fetchContentful(query);
      const entries: ContentfulEntry[] = response.items || [];

      const totalPosts = entries.length;
      const publishedPosts = entries.filter(e => e.sys.publishedAt).length;
      const draftPosts = entries.filter(e => !e.sys.publishedAt).length;

      // Get unique authors, categories, and tags
      const authors = await this.getAuthors();
      const categories = await this.getCategories();
      const tags = await this.getTags();

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts: 0, // Contentful doesn't expose scheduled count
        archivedPosts: 0, // Contentful doesn't have archived status
        totalViews: 0,
        totalComments: 0,
        totalLikes: 0,
        totalAuthors: authors.length,
        totalCategories: categories.length,
        totalTags: tags.length,
      };
    } catch (error) {
      console.error('Error fetching Contentful statistics:', error);
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

export default ContentfulBlogProvider;
