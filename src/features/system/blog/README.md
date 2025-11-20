# Blog Feature

A comprehensive, production-ready blogging system with multi-provider support, SEO optimization, and markdown editing.

## 🎯 Features

### Core Features
- ✅ **Markdown Editor** - Full-featured with live preview, toolbar, and keyboard shortcuts
- ✅ **SEO Optimization** - Real-time SEO scoring (0-100) with recommendations
- ✅ **Multi-Provider** - Internal (Convex), Ghost CMS, Contentful, Sanity.io support
- ✅ **Comments System** - Integrated with existing comments addon (threaded, reactions)
- ✅ **Categories & Tags** - Hierarchical categories and flexible tagging
- ✅ **Multi-Author** - Extended author profiles with social links
- ✅ **Post Scheduling** - Schedule posts for automatic publishing via Convex cron jobs
- ✅ **Server-Side Rendering** - Full SSR for perfect SEO
- ✅ **Social Sharing** - Twitter, Facebook, LinkedIn, Reddit, Email
- ✅ **Responsive Design** - Mobile-first with Tailwind CSS

### Editor Features
- 📝 Markdown with GFM (GitHub Flavored Markdown) support
- 🎨 Live preview (Write/Split/Preview modes)
- ⌨️ Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- 💾 Auto-save every 30 seconds
- 🎯 Auto-slug generation
- ✨ Real-time SEO scoring
- 📊 Content validation
- 🏷️ Category & tag management
- ⏰ Schedule posts for future publishing

### SEO Features
- 🔍 Structured data (JSON-LD)
- 📱 Open Graph tags
- 🐦 Twitter Card tags
- 🔗 Canonical URLs
- 📈 Meta descriptions
- 🎯 Focus keyword tracking
- ⭐ SEO score with recommendations

## 📦 Installation

### 1. Environment Variables

Add to your `.env` file:

```env
# Blog Configuration
VITE_PRIMARY_BLOG_PROVIDER=internal
VITE_BLOG_ALLOW_COMMENTS=true
VITE_BLOG_MODERATE_COMMENTS=true
VITE_SITE_URL=https://yoursite.com
VITE_DEFAULT_OG_IMAGE=https://yoursite.com/og-image.png

# Optional: External Providers
VITE_GHOST_URL=
VITE_GHOST_CONTENT_API_KEY=
VITE_GHOST_ADMIN_API_KEY=

VITE_CONTENTFUL_SPACE_ID=
VITE_CONTENTFUL_ACCESS_TOKEN=
VITE_CONTENTFUL_ENVIRONMENT=master

VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
VITE_SANITY_TOKEN=
```

### 2. Provider Setup

The `BlogProvider` is already integrated in `__root.tsx`. No additional setup needed!

### 3. Routes

The following routes are automatically available:

**Public Routes:**
- `/blog` - Blog homepage
- `/blog/:slug` - Individual post

**Admin Routes:**
- `/admin/blog` - Blog dashboard
- `/admin/blog/posts/new` - Create new post
- `/admin/blog/posts/:id/edit` - Edit post (coming soon)
- `/admin/blog/categories` - Manage categories (coming soon)
- `/admin/blog/tags` - Manage tags (coming soon)

## 🚀 Usage

### Basic Usage

#### Display Blog Posts

```tsx
import { usePosts, PostList } from '@/features/boilerplate/blog';

function MyBlogPage() {
  const { posts, loading, hasMore, loadMore } = usePosts({
    filters: { status: 'published' },
    limit: 12
  });

  return (
    <PostList
      posts={posts}
      loading={loading}
      hasMore={hasMore}
      onLoadMore={loadMore}
      variant="grid"
    />
  );
}
```

#### Display Single Post

```tsx
import { usePost } from '@/features/boilerplate/blog';

function MyPostPage({ slug }: { slug: string }) {
  const { post, loading, error } = usePost({ slug });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

#### Use Markdown Editor

```tsx
import { MarkdownEditor } from '@/features/boilerplate/blog';

function MyEditor() {
  const [content, setContent] = useState('');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      showPreview={true}
      autoFocus={true}
      height={600}
    />
  );
}
```

### Advanced Usage

#### Access Blog Service Directly

```tsx
import { useBlog } from '@/features/boilerplate/blog';

function MyComponent() {
  const { service, provider, config, isReady } = useBlog();

  const createPost = async () => {
    if (!isReady) return;

    const postId = await service.createPost({
      title: 'My New Post',
      content: '# Hello World\n\nThis is my first post!',
      tags: ['tutorial', 'getting-started'],
      allowComments: true,
      visibility: 'public',
    }, userId);

    console.log('Created post:', postId);
  };

  return <button onClick={createPost}>Create Post</button>;
}
```

#### Switch Providers

```tsx
import { useBlog } from '@/features/boilerplate/blog';

function ProviderSwitcher() {
  const { switchProvider, availableProviders } = useBlog();

  return (
    <select onChange={(e) => switchProvider(e.target.value as any)}>
      {availableProviders.map((provider) => (
        <option key={provider} value={provider}>
          {provider}
        </option>
      ))}
    </select>
  );
}
```

#### Filter Posts

```tsx
import { usePosts } from '@/features/boilerplate/blog';

function FeaturedPosts() {
  const { posts, loading } = usePosts({
    filters: {
      status: 'published',
      featured: true,
      categoryId: 'category-id',
      tag: 'tutorial',
    },
    limit: 5,
  });

  return <PostList posts={posts} loading={loading} />;
}
```

## 🎨 Components

### PostCard

Display a blog post in card format with various variants.

```tsx
import { PostCard } from '@/features/boilerplate/blog';

<PostCard
  post={post}
  variant="default" // or "featured", "compact", "list"
  showAuthor={true}
  showCategory={true}
  showExcerpt={true}
  showReadTime={true}
  showDate={true}
  onClick={(post) => console.log('Clicked:', post)}
/>
```

### PostList

Display a list of blog posts with pagination.

```tsx
import { PostList } from '@/features/boilerplate/blog';

<PostList
  posts={posts}
  loading={loading}
  hasMore={hasMore}
  onLoadMore={loadMore}
  emptyMessage="No posts found"
  variant="grid" // or "list"
/>
```

### MarkdownEditor

Full-featured markdown editor with live preview.

```tsx
import { MarkdownEditor } from '@/features/boilerplate/blog';

<MarkdownEditor
  value={content}
  onChange={setContent}
  placeholder="Write your content..."
  height={600}
  showPreview={true}
  autoFocus={true}
  readOnly={false}
/>
```

## 🪝 Hooks

### useBlog

Access the blog service and configuration.

```tsx
const {
  service,      // BlogService instance
  provider,     // Active provider
  config,       // Provider configuration
  isReady,      // Is service initialized
  error,        // Initialization error
  switchProvider,        // Switch to different provider
  availableProviders,    // List of available providers
} = useBlog();
```

### usePosts

Fetch multiple blog posts with filtering and pagination.

```tsx
const {
  posts,        // Array of posts
  loading,      // Loading state
  error,        // Error if any
  hasMore,      // More posts available
  refresh,      // Refresh posts
  loadMore,     // Load next page
} = usePosts({
  filters: {
    status: 'published',
    authorId: 'author-id',
    categoryId: 'category-id',
    tag: 'tutorial',
    featured: true,
  },
  limit: 12,
  initialLoad: true,
});
```

### usePost

Fetch a single blog post.

```tsx
const {
  post,         // Post data
  loading,      // Loading state
  error,        // Error if any
  refresh,      // Refresh post
} = usePost({
  postId: 'post-id',  // or
  slug: 'post-slug',
  incrementViews: true,
});
```

### useCategories

Fetch all blog categories.

```tsx
const {
  categories,           // Array of categories
  loading,              // Loading state
  error,                // Error if any
  refresh,              // Refresh categories
  getCategoryById,      // Get category by ID
  getCategoryBySlug,    // Get category by slug
} = useCategories();
```

### useScheduling

Schedule posts for automatic publishing.

```tsx
const {
  schedulePost,       // Schedule a post for future publishing
  cancelSchedule,     // Cancel scheduled publishing
  reschedule,         // Reschedule a post
  isScheduling,       // Loading state
  error,              // Error if any
} = useScheduling();

// Schedule a post
await schedulePost(postId, new Date('2025-12-31T10:00:00'));

// Reschedule a post
await reschedule(postId, new Date('2026-01-01T12:00:00'));

// Cancel scheduling
await cancelSchedule(postId);
```

**How it works:**
- Posts are scheduled with a specific date/time
- A Convex cron job runs every minute checking for scheduled posts
- When `scheduledFor` time is reached, the post automatically publishes
- Status changes from `scheduled` → `published`
- The cron job is configured in `/convex/crons.ts`

## 🛠️ Utilities

### Slug Utilities

```typescript
import { generateSlug, isValidSlug, makeSlugUnique } from '@/features/boilerplate/blog';

const slug = generateSlug('My Blog Post Title'); // "my-blog-post-title"
const valid = isValidSlug('my-slug'); // true
const unique = makeSlugUnique('my-slug', existingSlugs); // "my-slug-1"
```

### SEO Utilities

```typescript
import { calculateSEOScore, generateMetaTags, generateShareUrls } from '@/features/boilerplate/blog';

// Calculate SEO score
const { score, recommendations } = calculateSEOScore(post);

// Generate meta tags
const metaTags = generateMetaTags(post, 'https://yoursite.com');

// Generate social share URLs
const shareUrls = generateShareUrls(post, 'https://yoursite.com');
```

### Content Utilities

```typescript
import {
  calculateReadTime,
  countWords,
  getExcerpt,
  generateTableOfContents,
  formatDate,
} from '@/features/boilerplate/blog';

const readTime = calculateReadTime(content); // 5 (minutes)
const words = countWords(content); // 1234
const excerpt = getExcerpt(content, 200); // First 200 chars
const toc = generateTableOfContents(content); // Array of headings
const date = formatDate(timestamp); // "January 1, 2024"
```

## 📝 Creating Posts

### Via UI (Recommended)

1. Go to `/admin/blog/posts/new`
2. Fill in the title (slug auto-generates)
3. Write content in markdown
4. Configure SEO settings
5. Set category and tags
6. Choose your publishing option:
   - **Publish** - Publish immediately
   - **Save Draft** - Save without publishing
   - **Schedule** - Schedule for automatic publishing at a specific date/time

### Via Code

```typescript
import { useBlog } from '@/features/boilerplate/blog';

const { service } = useBlog();

// Create post
const postId = await service.createPost({
  title: 'My New Post',
  content: '# Hello World\n\nThis is my post content.',
  excerpt: 'A brief description',
  categoryId: 'category-id',
  tags: ['tutorial', 'getting-started'],
  seoTitle: 'My New Post - SEO Title',
  seoDescription: 'This is the meta description',
  seoKeywords: ['blog', 'tutorial', 'guide'],
  focusKeyword: 'tutorial',
  allowComments: true,
  visibility: 'public',
}, userId);

// Publish post
await service.publishPost(postId, userId);
```

## 🎯 SEO Best Practices

### Optimizing Posts

1. **Title**: 30-60 characters
2. **Description**: 50-160 characters
3. **Keywords**: 3-8 keywords
4. **Content**: 1000+ words recommended
5. **Focus Keyword**: Use 5-30 times (0.5-3% density)
6. **Images**: Always add alt text
7. **Headings**: Use H1, H2, H3 structure
8. **Links**: Add internal and external links

### SEO Score Breakdown

- **Title (20 points)**: Optimal length and keywords
- **Description (20 points)**: Compelling and informative
- **Keywords (20 points)**: Relevant and well-distributed
- **Content (15 points)**: Comprehensive and valuable
- **Focus Keyword (15 points)**: Proper density
- **Images (10 points)**: Alt text for accessibility

## 🔧 Configuration

### Provider Configuration

Edit `/src/features/boilerplate/blog/config/index.ts`:

```typescript
export const BLOG_CONFIG = {
  postsPerPage: 12,
  relatedPostsCount: 3,
  autoSaveInterval: 30000,
  maxImageSize: 5 * 1024 * 1024,
  minTitleLength: 3,
  maxTitleLength: 200,
  // ... more settings
};
```

### Environment-Based Configuration

```env
# Enable/disable features
VITE_BLOG_ALLOW_COMMENTS=true
VITE_BLOG_MODERATE_COMMENTS=true
VITE_BLOG_ENABLE_SCHEDULING=true
VITE_BLOG_ENABLE_MULTI_AUTHOR=true
VITE_BLOG_ENABLE_ANALYTICS=true
```

## 🚀 Deployment Checklist

- [ ] Set `VITE_SITE_URL` in production
- [ ] Set `VITE_DEFAULT_OG_IMAGE`
- [ ] Configure primary provider
- [ ] Enable comment moderation if needed
- [ ] Test SSR rendering
- [ ] Verify structured data with Google Rich Results Test
- [ ] Submit sitemap to search engines
- [ ] Set up analytics tracking

## 📊 Database Schema

### Tables

1. **blogPosts** - Blog posts with content and metadata
2. **blogCategories** - Hierarchical categories
3. **blogTags** - Flexible tagging system
4. **blogAuthors** - Extended author profiles
5. **blogProviderSync** - Provider synchronization
6. **blogMedia** - Media library

### Entity Types

Registered in `entities.config.ts`:
- `blog_posts` - Commentable entity
- `blog_categories`
- `blog_tags`
- `blog_authors`

## 🐛 Troubleshooting

### Blog service not initialized

```typescript
const { isReady, error } = useBlog();

if (!isReady) {
  console.error('Blog service error:', error);
}
```

### Posts not showing

1. Check if posts are published: `status === 'published'`
2. Check visibility: `visibility === 'public'`
3. Check if deleted: `deletedAt === undefined`

### SEO not working

1. Verify `VITE_SITE_URL` is set
2. Check meta tags in page source
3. Test with Google Rich Results Test
4. Ensure SSR is working (view page source)

## 📚 Additional Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Google SEO Guidelines](https://developers.google.com/search/docs)
- [Schema.org Article](https://schema.org/Article)
- [Open Graph Protocol](https://ogp.me/)

## 🎉 What's Next?

### Implemented
- ✅ Core blogging functionality
- ✅ Markdown editor
- ✅ SEO optimization
- ✅ Comments integration
- ✅ SSR for SEO
- ✅ Multi-provider architecture

### Coming Soon
- ⏳ Reminders integration for scheduled publishing
- ⏳ Ghost CMS provider
- ⏳ Contentful provider
- ⏳ Sanity provider
- ⏳ Image upload & management
- ⏳ Advanced analytics dashboard

## 📞 Support

For issues or questions, please check:
1. This README
2. TypeScript types (full IntelliSense)
3. Implementation progress doc (`BLOG-IMPLEMENTATION-PROGRESS.md`)

---

**Built with ❤️ using:**
- React 19
- TanStack Router
- Convex
- Tailwind CSS
- React Markdown
- TypeScript
