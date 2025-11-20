// src/routes/{-$locale}/_protected/_admin/admin/blog/tags/index.tsx

/**
 * Admin Blog Tags Route
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/convex/_generated/api';
import { useTags } from '@/features/boilerplate/blog/hooks/useTags';
import { getTagsQueryOptions } from '@/features/boilerplate/blog/services/blogQueryOptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { defaultLocale } from '@/features/boilerplate/i18n';
import { createI18nSeo } from '@/utils/seo';

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/tags/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined';

    console.log(`🔄 Blog Tags Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`);
    console.time('Route Loader: Blog Tags');

    // ✅ Use query options for consistent cache keys
    const tagsQueryOptions = getTagsQueryOptions();

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch');
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server');
        const convexClient = await getAuthenticatedConvexClient();

        if (convexClient) {
          const tags = await convexClient.query(
            api.lib.boilerplate.blog.queries.getTags,
            {}
          );

          // Cache data using query options
          context.queryClient.setQueryData(tagsQueryOptions.queryKey, tags);

          console.log('✅ SSR: Tags data cached:', {
            tags: tagsQueryOptions.queryKey,
            count: tags?.length || 0,
          });

          console.timeEnd('Route Loader: SSR Data Fetch');
        }
        console.timeEnd('Route Loader: Blog Tags');
      } catch (error) {
        console.warn('SSR prefetch failed for tags:', error);
        console.timeEnd('Route Loader: SSR Data Fetch');
        console.timeEnd('Route Loader: Blog Tags');
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData');

      const cachedTags = context.queryClient.getQueryData(tagsQueryOptions.queryKey);

      console.log('📦 CLIENT: Cache check:', {
        tagsCached: !!cachedTags,
        count: cachedTags ? (cachedTags as any).length : 0,
      });

      await context.queryClient.ensureQueryData(tagsQueryOptions);

      console.timeEnd('Route Loader: Client ensureQueryData');
      console.timeEnd('Route Loader: Blog Tags');
    }

    return {};
  },
  component: TagsComponent,
  pendingComponent: () => (
    <Loading size="lg" message="Loading tags..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale;

    return {
      meta: await createI18nSeo(locale, 'blog.tags', {
        title: 'Tags - Blog Admin',
        description: 'Manage blog tags',
        keywords: 'blog, tags, admin, management',
      }),
    };
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Tags</h2>
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

function TagsComponent() {
  const { locale } = Route.useParams();
  const currentLocale = locale || defaultLocale;
  const { tags, loading } = useTags();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tags...</div>
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

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tags</h1>

      {tags && tags.length > 0 ? (
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag._id} variant="secondary" className="text-base">
                {tag.name}
              </Badge>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No tags yet</p>
        </Card>
      )}
    </div>
  );
}