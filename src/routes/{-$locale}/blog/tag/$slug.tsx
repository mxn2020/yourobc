// src/routes/{-$locale}/blog/tag/$slug.tsx

/**
 * Blog Tag Filter Page Route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { getPublishedPostsQueryOptions } from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { formatDate, calculateReadTime } from '@/features/boilerplate/blog/utils/content';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/{-$locale}/blog/tag/$slug')({
  loader: async ({ context, params }) => {
    const isServer = typeof window === 'undefined';
    const { slug } = params;

    console.log(`🔄 Blog Tag Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Tag: ${slug}`);
    console.time('Route Loader: Blog Tag Page');

    // ✅ Use query options with server-side filtering by tag
    const tagPostsQueryOptions = getPublishedPostsQueryOptions({ tag: slug, limit: 100 });

    // SERVER: SSR prefetching with authenticated Convex client and server-side filtering
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch posts filtered by tag on the server (more efficient!)
          const tagPosts = await convexClient.query(api.lib.boilerplate.blog.queries.getPublishedPosts, {
            tag: slug,
            limit: 100,
          });

          // Cache filtered data
          context.queryClient.setQueryData(tagPostsQueryOptions.queryKey, tagPosts);

          console.log('✅ SSR: Tag posts data cached:', {
            tagPosts: tagPostsQueryOptions.queryKey,
            tag: slug,
            count: tagPosts?.posts?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Blog Tag Page');
      } catch (error) {
        console.warn('SSR prefetch failed for tag page:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Tag Page');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedTagPosts = context.queryClient.getQueryData(tagPostsQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        tagPostsCached: !!cachedTagPosts,
        tag: slug,
      });

      await context.queryClient.ensureQueryData(tagPostsQueryOptions);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Blog Tag Page');
    }

    return {};
  },
  component: TagPageComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading posts..." showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.tag', {
        title: `Tag: ${params.slug} - Blog`,
        description: `Posts tagged with ${params.slug}`,
        keywords: `blog, ${params.slug}, tag, articles`,
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Tag Posts</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
});

function TagPageComponent() {
  const { slug, locale } = Route.useParams();
  const currentLocale = locale || defaultLocale;

  // Use server-filtered data from query options
  const tagPostsQueryOptions = getPublishedPostsQueryOptions({ tag: slug, limit: 100 });
  const { data: tagPostsData, isLoading } = useQuery(tagPostsQueryOptions);

  // Extract posts from the response
  const tagPosts = tagPostsData?.posts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/{-$locale}/blog"
          params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
        >
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Blog
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <Tag className="w-8 h-8 text-gray-600" />
        <h1 className="text-4xl font-bold text-gray-900">{slug}</h1>
      </div>

      {tagPosts && tagPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tagPosts.map((post) => (
            <Link 
              key={post._id} 
              to="/{-$locale}/blog/$slug" 
              params={{ 
                slug: post.slug,
                locale: currentLocale === defaultLocale ? undefined : currentLocale 
              }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(post.content)} min read</span>
                  </div>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No posts with this tag yet</p>
        </Card>
      )}
    </div>
  );
}
