// src/routes/{-$locale}/_protected/_admin/admin/blog/posts/new.tsx
/**
 * New Blog Post Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { PostEditorPage } from '@/features/boilerplate/blog/pages/PostEditorPage';
import { getCategoriesQueryOptions } from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Loading } from '@/components/ui';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/posts/new')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';

    console.log(`🔄 New Blog Post Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: New Blog Post');

    // ✅ Use query options for consistent cache keys
    const categoriesQueryOptions = getCategoriesQueryOptions();

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          const categories = await convexClient.query(
            api.lib.boilerplate.blog.queries.getCategories,
            {}
          );

          // Cache data using query options
          context.queryClient.setQueryData(categoriesQueryOptions.queryKey, categories);

          console.log('✅ SSR: Categories data cached for editor:', {
            categories: categoriesQueryOptions.queryKey,
            count: categories?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: New Blog Post');
      } catch (error) {
        console.warn('SSR prefetch failed for new post editor:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: New Blog Post');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedCategories = context.queryClient.getQueryData(categoriesQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        categoriesCached: !!cachedCategories,
        count: cachedCategories ? (cachedCategories as any).length : 0,
      });

      await context.queryClient.ensureQueryData(categoriesQueryOptions);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: New Blog Post');
    }

    return {};
  },
  component: NewPostComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading editor..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.posts.new', {
        title: 'New Post - Blog Admin',
        description: 'Create a new blog post',
        keywords: 'blog, new post, create, admin',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Editor</h2>
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

function NewPostComponent() {
  return <PostEditorPage />;
}