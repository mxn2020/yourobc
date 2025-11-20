// src/routes/{-$locale}/blog/category/$slug.tsx

/**
 * Blog Category Filter Page Route
 */

import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import {
  getCategoryBySlugQueryOptions,
  getPublishedPostsQueryOptions,
} from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { formatDate, calculateReadTime } from '@/features/boilerplate/blog/utils/content';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/{-$locale}/blog/category/$slug')({
  loader: async ({ context, params }) => {
    const isServer = typeof window === 'undefined';
    const { slug } = params;

    console.log(`🔄 Blog Category Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Category: ${slug}`);
    console.time('Route Loader: Blog Category Page');

    // ✅ Use query options
    const categoryQueryOptions = getCategoryBySlugQueryOptions(slug);

    // SERVER: SSR prefetching with authenticated Convex client and server-side filtering
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch category first to get the category ID
          const category = await convexClient.query(api.lib.boilerplate.blog.queries.getCategoryBySlug, {
            slug,
          });

          if (!category) {
            console.timeEnd('Route Loader: SSR Data Fetch');
            console.timeEnd('Route Loader: Blog Category Page');
            throw notFound();
          }

          // Cache category
          context.queryClient.setQueryData(categoryQueryOptions.queryKey, category);

          // Fetch posts filtered by category ID on the server (more efficient!)
          const categoryPostsQueryOptions = getPublishedPostsQueryOptions({
            categoryId: category._id,
            limit: 100,
          });

          const categoryPosts = await convexClient.query(api.lib.boilerplate.blog.queries.getPublishedPosts, {
            categoryId: category._id,
            limit: 100,
          });

          // Cache filtered posts
          context.queryClient.setQueryData(categoryPostsQueryOptions.queryKey, categoryPosts);

          console.log('✅ SSR: Category posts data cached:', {
            category: categoryQueryOptions.queryKey,
            categoryPosts: categoryPostsQueryOptions.queryKey,
            categoryName: category.name,
            count: categoryPosts?.posts?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Blog Category Page');
      } catch (error) {
        console.warn('SSR prefetch failed for category page:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Category Page');
        if (error && typeof error === 'object' && 'message' in error && (error as any).message === 'Not found') {
          throw notFound();
        }
        throw error;
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedCategory = context.queryClient.getQueryData(categoryQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        categoryCached: !!cachedCategory,
        categoryName: cachedCategory ? (cachedCategory as any).name : 'Not cached',
      });

      try {
        const category = await context.queryClient.ensureQueryData(categoryQueryOptions);

        if (!category) {
          console.timeEnd('Route Loader: Client ensureQueryData');
          console.timeEnd('Route Loader: Blog Category Page');
          throw notFound();
        }

        console.timeEnd('Route Loader: Client ensureQueryData');
        console.timeEnd('Route Loader: Blog Category Page');
      } catch (error) {
        console.timeEnd('Route Loader: Client ensureQueryData');
        console.timeEnd('Route Loader: Blog Category Page');
        throw error;
      }
    }

    return {};
  },
  component: CategoryPageComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading category..." showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.category', {
        title: `Category: ${params.slug} - Blog`,
        description: `Posts in the ${params.slug} category`,
        keywords: `blog, ${params.slug}, category, articles`,
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Category</h2>
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

function CategoryPageComponent() {
  const { slug, locale } = Route.useParams();
  const currentLocale = locale || defaultLocale;

  // Use server-filtered data from query options
  const categoryQueryOptions = getCategoryBySlugQueryOptions(slug);
  const { data: category, isLoading: categoryLoading } = useQuery(categoryQueryOptions);

  // Get posts for this category (using category ID from the loaded category)
  const categoryPostsQueryOptions = category
    ? getPublishedPostsQueryOptions({ categoryId: category._id, limit: 100 })
    : null;
  const { data: categoryPostsData, isLoading: postsLoading } = useQuery({
    ...categoryPostsQueryOptions!,
    enabled: !!category,
  });

  // Extract posts from the response
  const categoryPosts = categoryPostsData?.posts || [];

  if (categoryLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/{-$locale}/blog"
          params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
        >
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Blog
          </Button>
        </Link>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
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

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600">{category.description}</p>
        )}
      </div>

      {categoryPosts && categoryPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryPosts.map((post) => (
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
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(post.content)} min read</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No posts in this category yet</p>
        </Card>
      )}
    </div>
  );
}
