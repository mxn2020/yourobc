// src/routes/{-$locale}/blog/index.tsx

/**
 * Public Blog Homepage Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { BlogHomePage } from '@/features/boilerplate/blog/pages/BlogHomePage';
import {
  getFeaturedPostsQueryOptions,
  getPublishedPostsQueryOptions,
  getCategoriesQueryOptions,
} from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Loading } from '@/components/ui';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/blog/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';

    console.log(`🔄 Blog Homepage Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Blog Homepage');

    // ✅ Use query options for consistent cache keys
    const featuredPostsQueryOptions = getFeaturedPostsQueryOptions(3);
    const recentPostsQueryOptions = getPublishedPostsQueryOptions({ limit: 12 });
    const categoriesQueryOptions = getCategoriesQueryOptions();

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          // Fetch blog data in parallel
          const [featuredPosts, recentPosts, categories] = await Promise.all([
            convexClient.query(api.lib.boilerplate.blog.queries.getFeaturedPosts, { limit: 3 }),
            convexClient.query(api.lib.boilerplate.blog.queries.getPublishedPosts, { limit: 12 }),
            convexClient.query(api.lib.boilerplate.blog.queries.getCategories, {}),
          ]);

          // Cache data using query options
          context.queryClient.setQueryData(featuredPostsQueryOptions.queryKey, featuredPosts);
          context.queryClient.setQueryData(recentPostsQueryOptions.queryKey, recentPosts);
          context.queryClient.setQueryData(categoriesQueryOptions.queryKey, categories);

          console.log('✅ SSR: Blog homepage data cached:', {
            featuredPosts: featuredPostsQueryOptions.queryKey,
            recentPosts: recentPostsQueryOptions.queryKey,
            categories: categoriesQueryOptions.queryKey,
            featuredCount: featuredPosts?.length || 0,
            recentCount: recentPosts?.posts?.length || 0,
            categoriesCount: categories?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Blog Homepage');
      } catch (error) {
        console.warn('SSR prefetch failed for blog homepage:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Homepage');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedFeatured = context.queryClient.getQueryData(featuredPostsQueryOptions.queryKey);
      const cachedRecent = context.queryClient.getQueryData(recentPostsQueryOptions.queryKey);
      const cachedCategories = context.queryClient.getQueryData(categoriesQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        featuredCached: !!cachedFeatured,
        recentCached: !!cachedRecent,
        categoriesCached: !!cachedCategories,
      });

      await Promise.all([
        context.queryClient.ensureQueryData(featuredPostsQueryOptions),
        context.queryClient.ensureQueryData(recentPostsQueryOptions),
        context.queryClient.ensureQueryData(categoriesQueryOptions),
      ]);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Blog Homepage');
    }

    return {};
  },
  component: BlogHomePageComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading blog..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.home', {
        title: 'Blog - Insights, Tutorials & Stories',
        description: 'Discover the latest insights, tutorials, and stories from our team',
        keywords: 'blog, articles, tutorials, insights, stories',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Blog</h2>
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

function BlogHomePageComponent() {
  return <BlogHomePage />;
}
