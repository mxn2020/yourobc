// src/routes/{-$locale}/_protected/_admin/admin/blog/categories/index.tsx

/**
 * Admin Blog Categories Route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { useCategories } from '@/features/boilerplate/blog/hooks/useCategories';
import { getCategoriesQueryOptions } from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/categories/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';

    console.log(`🔄 Blog Categories Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Blog Categories');

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

          console.log('✅ SSR: Categories data cached:', {
            categories: categoriesQueryOptions.queryKey,
            count: categories?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Blog Categories');
      } catch (error) {
        console.warn('SSR prefetch failed for categories:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Categories');
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
      console.timeEnd('Route Loader: Blog Categories');
    }

    return {};
  },
  component: CategoriesComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading categories..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.categories', {
        title: 'Categories - Blog Admin',
        description: 'Manage blog categories',
        keywords: 'blog, categories, admin, management',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Categories</h2>
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

function CategoriesComponent() {
  const { locale } = Route.useParams();
  const currentLocale = locale || defaultLocale;
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/{-$locale}/admin/blog"
          params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
        >
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Blog Dashboard
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Categories</h1>

      {categories && categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No categories yet</p>
        </Card>
      )}
    </div>
  );
}