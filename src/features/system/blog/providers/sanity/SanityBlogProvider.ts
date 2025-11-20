// src/features/system/blog/providers/sanity/SanityBlogProvider.ts
/**
 * Sanity.io Blog Provider
 *
 * Implements BlogProvider interface for Sanity CMS integration
 * Uses GROQ queries and Sanity Client for all operations
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

interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion?: string;
  token?: string; // For write operations
  useCdn?: boolean;
}

interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  [key: string]: any;
}

export class SanityBlogProvider implements BlogProvider {
  public readonly type = 'sanity' as const;
  private sanityConfig: SanityConfig;
  private readonly baseUrl: string;

  constructor(public config: BlogProviderConfig) {
    this.sanityConfig = this.parseConfig(config);
    const { projectId, dataset, useCdn = true } = this.sanityConfig;
    const subdomain = useCdn ? 'cdn' : 'api';
    this.baseUrl = `https://${projectId}.${subdomain}.sanity.io/${this.sanityConfig.apiVersion}/data`;
  }

  private parseConfig(config: BlogProviderConfig): SanityConfig {
    if (!config.credentials) {
      throw new Error('Sanity credentials are required');
    }

    const {
      projectId,
      dataset,
      apiVersion = '2023-05-03',
      token,
      useCdn,
    } = config.credentials;

    if (!projectId || !dataset) {
      throw new Error('Sanity Project ID and Dataset are required');
    }

    // Parse useCdn - credentials are strings from env vars, so we need to handle string booleans
    const parsedUseCdn = useCdn === undefined || useCdn === null || useCdn === 'true';

    return {
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: parsedUseCdn
    };
  }

  private async querySanity(query: string, params: Record<string, any> = {}): Promise<any> {
    const { projectId, dataset, apiVersion } = this.sanityConfig;
    const encodedQuery = encodeURIComponent(query);
    const encodedParams = encodeURIComponent(JSON.stringify(params));

    const url = `${this.baseUrl}/query/${dataset}?query=${encodedQuery}${
      Object.keys(params).length > 0 ? `&$params=${encodedParams}` : ''
    }`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sanity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.result;
  }

  private async mutateSanity(mutations: any[]): Promise<any> {
    const { projectId, dataset, token } = this.sanityConfig;

    if (!token) {
      throw new Error('Sanity token is required for write operations');
    }

    const url = `${this.baseUrl}/mutate/${dataset}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ mutations }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sanity Mutation error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private convertSanityDocToBlogPost(doc: SanityDocument): BlogPost {
    return {
      _id: doc._id as any,
      _creationTime: new Date(doc._createdAt).getTime(),
      title: doc.title || 'Untitled',
      slug: doc.slug?.current || doc._id,
      content: doc.body?.map((block: any) => {
        if (block._type === 'block') {
          return block.children?.map((child: any) => child.text).join('') || '';
        }
        return '';
      }).join('\n\n') || '',
      excerpt: doc.excerpt || doc.description,
      status: this.mapSanityStatus(doc.publishedAt),
      visibility: doc.visibility || 'public',
      featured: doc.featured || false,
      featuredImage: doc.mainImage ? {
        url: this.getImageUrl(doc.mainImage),
        alt: doc.mainImage.alt,
      } : undefined,
      tags: doc.categories?.map((cat: any) => cat.title || cat.name) || [],
      categoryId: doc.category?._ref as any,
      authorId: doc.author?._ref as any,
      authorName: doc.author?.name || 'Unknown',
      seoTitle: doc.seo?.title || doc.metaTitle,
      seoDescription: doc.seo?.description || doc.metaDescription,
      seoKeywords: doc.seo?.keywords || doc.keywords,
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt).getTime() : undefined,
      createdAt: new Date(doc._createdAt).getTime(),
      updatedAt: new Date(doc._updatedAt).getTime(),
      createdBy: 'sanity',
      updatedBy: 'sanity',
      viewCount: doc.views || 0,
      provider: 'sanity',
    } as BlogPost;
  }

  private getImageUrl(image: any): string {
    if (!image?.asset?._ref) return '';

    const { projectId, dataset } = this.sanityConfig;
    const ref = image.asset._ref;

    // Parse image reference: image-{assetId}-{dimensions}-{format}
    const parts = ref.split('-');
    const assetId = parts[1];
    const dimensions = parts[2];
    const format = parts[3];

    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}`;
  }

  private mapSanityStatus(publishedAt?: string): 'draft' | 'published' {
    return publishedAt ? 'published' : 'draft';
  }

  // Post operations
  async getPosts(filters?: PostFilters): Promise<BlogPost[]> {
    try {
      let query = `*[_type == "post"`;

      if (filters?.status === 'published') {
        query += ` && defined(publishedAt)`;
      } else if (filters?.status === 'draft') {
        query += ` && !defined(publishedAt)`;
      }

      if (filters?.categoryId) {
        query += ` && category._ref == $categoryId`;
      }

      if (filters?.tag) {
        query += ` && $tag in categories[]->title`;
      }

      if (filters?.featured) {
        query += ` && featured == true`;
      }

      query += `] | order(publishedAt desc, _createdAt desc)`;

      const docs = await this.querySanity(query, {
        categoryId: filters?.categoryId,
        tag: filters?.tag,
      });

      return docs.map((doc: SanityDocument) => this.convertSanityDocToBlogPost(doc));
    } catch (error) {
      console.error('Error fetching Sanity posts:', error);
      return [];
    }
  }

  async getPost(id: string): Promise<BlogPost | null> {
    try {
      const query = `*[_type == "post" && _id == $id][0]`;
      const doc = await this.querySanity(query, { id });

      if (!doc) return null;

      return this.convertSanityDocToBlogPost(doc);
    } catch (error) {
      console.error('Error fetching Sanity post:', error);
      return null;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const query = `*[_type == "post" && slug.current == $slug][0]`;
      const doc = await this.querySanity(query, { slug });

      if (!doc) return null;

      return this.convertSanityDocToBlogPost(doc);
    } catch (error) {
      console.error('Error fetching Sanity post by slug:', error);
      return null;
    }
  }

  async createPost(data: PostFormData, userId: Id<"userProfiles">): Promise<Id<'blogPosts'>> {
    try {
      const doc = {
        _type: 'post',
        title: data.title,
        slug: {
          _type: 'slug',
          current: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        },
        body: this.convertMarkdownToPortableText(data.content),
        excerpt: data.excerpt,
        featured: false,
        visibility: data.visibility || 'public',
        seo: {
          title: data.seoTitle,
          description: data.seoDescription,
          keywords: data.seoKeywords,
        },
        categories: data.tags?.map(tag => ({
          _type: 'reference',
          _ref: tag, // Assuming tags are already IDs
        })),
      };

      const result = await this.mutateSanity([
        {
          create: doc,
        },
      ]);

      return result.results[0].id as Id<'blogPosts'>;
    } catch (error) {
      console.error('Error creating Sanity post:', error);
      throw error;
    }
  }

  private convertMarkdownToPortableText(markdown: string): any[] {
    // Simple conversion - in production, use a proper markdown-to-portable-text library
    return markdown.split('\n\n').map(paragraph => ({
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: paragraph,
        },
      ],
    }));
  }

  async updatePost(
    id: Id<'blogPosts'>,
    data: Partial<PostFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const patch: any = {};

      if (data.title) patch.title = data.title;
      if (data.content) patch.body = this.convertMarkdownToPortableText(data.content);
      if (data.excerpt) patch.excerpt = data.excerpt;
      if (data.seoTitle || data.seoDescription || data.seoKeywords) {
        patch.seo = {
          title: data.seoTitle,
          description: data.seoDescription,
          keywords: data.seoKeywords,
        };
      }

      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: patch,
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating Sanity post:', error);
      throw error;
    }
  }

  async deletePost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.mutateSanity([
        {
          delete: {
            id: id as string,
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting Sanity post:', error);
      throw error;
    }
  }

  async publishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: {
              publishedAt: new Date().toISOString(),
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Error publishing Sanity post:', error);
      throw error;
    }
  }

  async schedulePost(
    id: Id<'blogPosts'>,
    scheduledFor: number,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: {
              publishedAt: new Date(scheduledFor).toISOString(),
              scheduled: true,
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Error scheduling Sanity post:', error);
      throw error;
    }
  }

  async unpublishPost(id: Id<'blogPosts'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            unset: ['publishedAt'],
          },
        },
      ]);
    } catch (error) {
      console.error('Error unpublishing Sanity post:', error);
      throw error;
    }
  }

  // Category operations
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const query = `*[_type == "category"] | order(name asc)`;
      const docs = await this.querySanity(query);

      return docs.map((doc: SanityDocument) => ({
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        name: doc.name || doc.title || 'Unnamed Category',
        slug: doc.slug?.current || doc._id,
        description: doc.description,
        parentId: doc.parent?._ref as any,
        color: doc.color,
        icon: doc.icon,
        seoTitle: doc.seo?.title,
        seoDescription: doc.seo?.description,
        order: doc.order || 0,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogCategory));
    } catch (error) {
      console.error('Error fetching Sanity categories:', error);
      return [];
    }
  }

  async getCategory(id: Id<'blogCategories'>): Promise<BlogCategory | null> {
    try {
      const query = `*[_type == "category" && _id == $id][0]`;
      const doc = await this.querySanity(query, { id });

      if (!doc) return null;

      return {
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        name: doc.name || doc.title,
        slug: doc.slug?.current,
        description: doc.description,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogCategory;
    } catch (error) {
      console.error('Error fetching Sanity category:', error);
      return null;
    }
  }

  async createCategory(data: CategoryFormData, userId: Id<"userProfiles">): Promise<Id<'blogCategories'>> {
    try {
      const doc = {
        _type: 'category',
        name: data.name,
        slug: {
          _type: 'slug',
          current: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        },
        description: data.description,
        color: data.color,
        order: data.order || 0,
      };

      const result = await this.mutateSanity([
        {
          create: doc,
        },
      ]);

      return result.results[0].id as Id<'blogCategories'>;
    } catch (error) {
      console.error('Error creating Sanity category:', error);
      throw error;
    }
  }

  async updateCategory(
    id: Id<'blogCategories'>,
    data: Partial<CategoryFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const patch: any = {};

      if (data.name) patch.name = data.name;
      if (data.description) patch.description = data.description;
      if (data.color) patch.color = data.color;
      if (data.order !== undefined) patch.order = data.order;

      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: patch,
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating Sanity category:', error);
      throw error;
    }
  }

  async deleteCategory(id: Id<'blogCategories'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.mutateSanity([
        {
          delete: {
            id: id as string,
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting Sanity category:', error);
      throw error;
    }
  }

  // Tag operations (Sanity typically uses categories for tagging)
  async getTags(): Promise<BlogTag[]> {
    try {
      const query = `*[_type == "tag"] | order(name asc)`;
      const docs = await this.querySanity(query);

      return docs.map((doc: SanityDocument) => ({
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        name: doc.name || doc.title || 'Unnamed Tag',
        slug: doc.slug?.current || doc._id,
        description: doc.description,
        color: doc.color,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogTag));
    } catch (error) {
      console.error('Error fetching Sanity tags:', error);
      return [];
    }
  }

  async getTag(id: Id<'blogTags'>): Promise<BlogTag | null> {
    try {
      const query = `*[_type == "tag" && _id == $id][0]`;
      const doc = await this.querySanity(query, { id });

      if (!doc) return null;

      return {
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        name: doc.name || doc.title,
        slug: doc.slug?.current,
        description: doc.description,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogTag;
    } catch (error) {
      console.error('Error fetching Sanity tag:', error);
      return null;
    }
  }

  async createTag(data: TagFormData, userId: Id<"userProfiles">): Promise<Id<'blogTags'>> {
    try {
      const doc = {
        _type: 'tag',
        name: data.name,
        slug: {
          _type: 'slug',
          current: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        },
        description: data.description,
        color: data.color,
      };

      const result = await this.mutateSanity([
        {
          create: doc,
        },
      ]);

      return result.results[0].id as Id<'blogTags'>;
    } catch (error) {
      console.error('Error creating Sanity tag:', error);
      throw error;
    }
  }

  async updateTag(id: Id<'blogTags'>, data: Partial<TagFormData>, userId: Id<"userProfiles">): Promise<void> {
    try {
      const patch: any = {};

      if (data.name) patch.name = data.name;
      if (data.description) patch.description = data.description;
      if (data.color) patch.color = data.color;

      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: patch,
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating Sanity tag:', error);
      throw error;
    }
  }

  async deleteTag(id: Id<'blogTags'>, userId: Id<"userProfiles">): Promise<void> {
    try {
      await this.mutateSanity([
        {
          delete: {
            id: id as string,
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting Sanity tag:', error);
      throw error;
    }
  }

  // Author operations
  async getAuthors(): Promise<BlogAuthor[]> {
    try {
      const query = `*[_type == "author"] | order(name asc)`;
      const docs = await this.querySanity(query);

      return docs.map((doc: SanityDocument) => ({
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        userId: doc.userId || doc._id,
        name: doc.name || 'Unnamed Author',
        slug: doc.slug?.current || doc._id,
        email: doc.email || `${doc.slug?.current || doc._id}@sanity.local`,
        bio: doc.bio,
        avatar: doc.image ? this.getImageUrl(doc.image) : undefined,
        website: doc.website,
        twitter: doc.social?.twitter,
        facebook: doc.social?.facebook,
        linkedin: doc.social?.linkedin,
        github: doc.social?.github,
        instagram: doc.social?.instagram,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogAuthor));
    } catch (error) {
      console.error('Error fetching Sanity authors:', error);
      return [];
    }
  }

  async getAuthor(id: Id<'blogAuthors'>): Promise<BlogAuthor | null> {
    try {
      const query = `*[_type == "author" && _id == $id][0]`;
      const doc = await this.querySanity(query, { id });

      if (!doc) return null;

      return {
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        userId: doc.userId || doc._id,
        name: doc.name,
        slug: doc.slug?.current,
        email: doc.email || `${doc.slug?.current}@sanity.local`,
        bio: doc.bio,
        avatar: doc.image ? this.getImageUrl(doc.image) : undefined,
        website: doc.website,
        twitter: doc.social?.twitter,
        facebook: doc.social?.facebook,
        linkedin: doc.social?.linkedin,
        github: doc.social?.github,
        instagram: doc.social?.instagram,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Sanity author:', error);
      return null;
    }
  }

  async getAuthorByUserId(userId: Id<"userProfiles">): Promise<BlogAuthor | null> {
    try {
      const query = `*[_type == "author" && userId == $userId][0]`;
      const doc = await this.querySanity(query, { userId });

      if (!doc) return null;

      return {
        _id: doc._id as any,
        _creationTime: new Date(doc._createdAt).getTime(),
        userId: doc.userId,
        name: doc.name,
        slug: doc.slug?.current,
        email: doc.email || `${doc.slug?.current}@sanity.local`,
        bio: doc.bio,
        avatar: doc.image ? this.getImageUrl(doc.image) : undefined,
        website: doc.website,
        twitter: doc.social?.twitter,
        facebook: doc.social?.facebook,
        linkedin: doc.social?.linkedin,
        github: doc.social?.github,
        instagram: doc.social?.instagram,
        createdAt: new Date(doc._createdAt).getTime(),
        createdBy: 'sanity',
        updatedAt: new Date(doc._updatedAt).getTime(),
        updatedBy: 'sanity',
      } as BlogAuthor;
    } catch (error) {
      console.error('Error fetching Sanity author by userId:', error);
      return null;
    }
  }

  async createAuthor(data: AuthorFormData, userId: Id<"userProfiles">): Promise<Id<'blogAuthors'>> {
    try {
      const doc = {
        _type: 'author',
        userId,
        name: data.name,
        slug: {
          _type: 'slug',
          current: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        },
        bio: data.bio,
        website: data.website,
        email: data.email,
      };

      const result = await this.mutateSanity([
        {
          create: doc,
        },
      ]);

      return result.results[0].id as Id<'blogAuthors'>;
    } catch (error) {
      console.error('Error creating Sanity author:', error);
      throw error;
    }
  }

  async updateAuthor(
    id: Id<'blogAuthors'>,
    data: Partial<AuthorFormData>,
    userId: Id<"userProfiles">
  ): Promise<void> {
    try {
      const patch: any = {};

      if (data.name) patch.name = data.name;
      if (data.bio) patch.bio = data.bio;
      if (data.email) patch.email = data.email;
      if (data.website) patch.website = data.website;

      await this.mutateSanity([
        {
          patch: {
            id: id as string,
            set: patch,
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating Sanity author:', error);
      throw error;
    }
  }

  // Search & Analytics
  async searchPosts(query: string, filters?: PostFilters): Promise<BlogPost[]> {
    try {
      let groqQuery = `*[_type == "post" && (
        title match $query ||
        excerpt match $query ||
        pt::text(body) match $query
      )`;

      if (filters?.status === 'published') {
        groqQuery += ` && defined(publishedAt)`;
      }

      groqQuery += `] | order(_score desc)`;

      const docs = await this.querySanity(groqQuery, { query: `*${query}*` });

      return docs.map((doc: SanityDocument) => this.convertSanityDocToBlogPost(doc));
    } catch (error) {
      console.error('Error searching Sanity posts:', error);
      return [];
    }
  }

  async getPostStatistics(authorId?: string): Promise<BlogStatistics> {
    try {
      let countQuery = `count(*[_type == "post"`;

      if (authorId) {
        countQuery += ` && author._ref == $authorId`;
      }

      countQuery += `])`;

      const publishedQuery = `count(*[_type == "post" && defined(publishedAt)${
        authorId ? ` && author._ref == $authorId` : ''
      }])`;

      const draftQuery = `count(*[_type == "post" && !defined(publishedAt)${
        authorId ? ` && author._ref == $authorId` : ''
      }])`;

      const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
        this.querySanity(countQuery, authorId ? { authorId } : {}),
        this.querySanity(publishedQuery, authorId ? { authorId } : {}),
        this.querySanity(draftQuery, authorId ? { authorId } : {}),
      ]);

      // Get unique authors, categories, and tags
      const authors = await this.getAuthors();
      const categories = await this.getCategories();
      const tags = await this.getTags();

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts: 0,
        archivedPosts: 0,
        totalViews: 0,
        totalComments: 0,
        totalLikes: 0,
        totalAuthors: authors.length,
        totalCategories: categories.length,
        totalTags: tags.length,
      };
    } catch (error) {
      console.error('Error fetching Sanity statistics:', error);
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

export default SanityBlogProvider;
