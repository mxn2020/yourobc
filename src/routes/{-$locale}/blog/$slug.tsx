// src/routes/{-$locale}/blog/$slug.tsx

/**
 * Public Blog Post Detail Route
 */

import { createFileRoute, notFound } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { PostDetailPage } from '@/features/boilerplate/blog/pages/PostDetailPage';
import { generateMetaTags } from '@/features/boilerplate/blog/utils/seo';
import { BLOG_ENV } from '@/features/boilerplate/blog/config';
import { getPostBySlugQueryOptions, getCategoryQueryOptions } from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Loading } from '@/components/ui';
import { convexQuery } from '@convex-dev/react-query';

export const Route = createFileRoute('/{-$locale}/blog/$slug')({
  loader: async ({ context, params }) => {
    const isServer = typeof window === 'undefined';
    const { slug } = params;

    console.log(`🔄 Blog Post Detail Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Slug: ${slug}`);
    console.time('Route Loader: Blog Post Detail');

    // ✅ Use query options for consistent cache keys
    const postQueryOptions = getPostBySlugQueryOptions(slug);

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch the post
          const post = await convexClient.query(api.lib.boilerplate.blog.queries.getPostBySlug, {
            slug,
          });

          if (!post) {
            console.timeEnd('Route Loader: SSR Data Fetch');
            console.timeEnd('Route Loader: Blog Post Detail');
            throw notFound();
          }

          // Check if post is published (for public access)
          if (post.status !== 'published' || (post.visibility && post.visibility !== 'public')) {
            console.timeEnd('Route Loader: SSR Data Fetch');
            console.timeEnd('Route Loader: Blog Post Detail');
            throw notFound();
          }

          // Cache post data
          context.queryClient.setQueryData(postQueryOptions.queryKey, post);

          // Prefetch related data in parallel
          const relatedPostsPromises = [];

          // Related posts
          relatedPostsPromises.push(
            convexClient.query(api.lib.boilerplate.blog.queries.getRelatedPosts, {
              postId: post._id,
              limit: 3,
            }).then(relatedPosts => {
              const relatedQueryOptions = convexQuery(api.lib.boilerplate.blog.queries.getRelatedPosts, {
                postId: post._id,
                limit: 3,
              });
              context.queryClient.setQueryData(relatedQueryOptions.queryKey, relatedPosts);
            })
          );

          // Category if exists
          if (post.categoryId) {
            const categoryQueryOptions = getCategoryQueryOptions(post.categoryId);
            relatedPostsPromises.push(
              convexClient.query(api.lib.boilerplate.blog.queries.getCategory, {
                categoryId: post.categoryId,
              }).then(category => {
                context.queryClient.setQueryData(categoryQueryOptions.queryKey, category);
              })
            );
          }

          await Promise.all(relatedPostsPromises);

          console.log('✅ SSR: Blog post data cached:', {
            post: postQueryOptions.queryKey,
            postTitle: post.title,
            hasCategory: !!post.categoryId,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
          console.timeEnd('Route Loader: Blog Post Detail');
          return { post };
        }
        console.timeEnd('Route Loader: Blog Post Detail');
        return { post: null };
      } catch (error) {
        console.warn('SSR prefetch failed for blog post:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Post Detail');
        if (error && typeof error === 'object' && 'message' in error && (error as any).message === 'Not found') {
          throw notFound();
        }
        throw error;
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedPost = context.queryClient.getQueryData(postQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        postCached: !!cachedPost,
        postTitle: cachedPost ? (cachedPost as any).title : 'Not cached',
      });

      try {
        const post = await context.queryClient.ensureQueryData(postQueryOptions);

        if (!post) {
          console.timeEnd('Route Loader: Client ensureQueryData');
          console.timeEnd('Route Loader: Blog Post Detail');
          throw notFound();
        }

        // Check if post is published
        if (post.status !== 'published' || (post.visibility && post.visibility !== 'public')) {
          console.timeEnd('Route Loader: Client ensureQueryData');
          console.timeEnd('Route Loader: Blog Post Detail');
          throw notFound();
        }

        console.timeEnd('Route Loader: Client ensureQueryData');
        console.timeEnd('Route Loader: Blog Post Detail');
        return { post };
      } catch (error) {
        console.timeEnd('Route Loader: Client ensureQueryData');
        console.timeEnd('Route Loader: Blog Post Detail');
        throw error;
      }
    }
  },
  component: PostDetailPageComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading post..." showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Post</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [
          {
            title: 'Post Not Found',
          },
        ],
      };
    }

    const { post } = loaderData;
    const siteUrl = BLOG_ENV.SITE_URL || '';
    const metaTags = generateMetaTags(post, siteUrl);

    return {
      meta: [
        {
          title: metaTags.title,
        },
        {
          name: 'description',
          content: metaTags.description,
        },
        // Open Graph tags
        {
          property: 'og:title',
          content: metaTags.title,
        },
        {
          property: 'og:description',
          content: metaTags.description,
        },
        {
          property: 'og:type',
          content: 'article',
        },
        {
          property: 'og:url',
          content: metaTags.canonical,
        },
        ...(metaTags.ogImage
          ? [
              {
                property: 'og:image',
                content: metaTags.ogImage,
              },
              ...(metaTags.ogImageAlt
                ? [
                    {
                      property: 'og:image:alt',
                      content: metaTags.ogImageAlt,
                    },
                  ]
                : []),
            ]
          : []),
        // Twitter Card tags
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: metaTags.title,
        },
        {
          name: 'twitter:description',
          content: metaTags.description,
        },
        ...(metaTags.ogImage
          ? [
              {
                name: 'twitter:image',
                content: metaTags.ogImage,
              },
            ]
          : []),
        // Article meta
        {
          property: 'article:published_time',
          content: new Date(post.publishedAt ?? post.createdAt).toISOString(),
        },
        {
          property: 'article:modified_time',
          content: new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt).toISOString(),
        },
        {
          property: 'article:author',
          content: post.authorName,
        },
        ...(post.tags || []).map((tag) => ({
          property: 'article:tag',
          content: tag,
        })),
        // Keywords
        ...(metaTags.keywords && metaTags.keywords.length > 0
          ? [
              {
                name: 'keywords',
                content: metaTags.keywords.join(', '),
              },
            ]
          : []),
        // Canonical URL
        {
          name: 'canonical',
          content: metaTags.canonical,
        },
      ],
      // Add structured data as JSON-LD
      script: metaTags.structuredData
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify(metaTags.structuredData),
            },
          ]
        : undefined,
    };
  },
});

function PostDetailPageComponent() {
  return <PostDetailPage />;
}
