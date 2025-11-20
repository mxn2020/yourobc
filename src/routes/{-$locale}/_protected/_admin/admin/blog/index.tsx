// routes/{-$locale}/_protected/_admin/admin/blog/index.tsx

/**
 * Admin Blog Dashboard Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { BlogDashboard } from '@/features/system/blog/pages/BlogDashboard'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/blog/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Blog Dashboard`)
    console.time('Route Loader: Blog Dashboard')

    // Get admin user from parent context (admin auth layer)
    const { adminUser } = context

    if (!adminUser || !adminUser.id) {
      console.warn('Admin user not found in context')
      return {}
    }

    // ✅ Define query options for consistency (inline since no service exists yet)
    const statsQueryKey = ['blog', 'getPostStatistics', {}]
    const draftPostsQueryKey = ['blog', 'getPosts', { status: 'draft', limit: 5 }]
    const allPostsQueryKey = ['blog', 'getPosts', { limit: 1 }]

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [stats, draftPosts, allPosts] = await Promise.all([
            convexClient.query(api.lib.system.blog.queries.getPostStatistics, {}),
            convexClient.query(api.lib.system.blog.queries.getPosts, {
              status: 'draft',
              limit: 5,
            }),
            convexClient.query(api.lib.system.blog.queries.getPosts, {
              limit: 1,
            })
          ])

          // Cache data using query keys (ensures same keys as hooks)
          context.queryClient.setQueryData(statsQueryKey, stats)
          context.queryClient.setQueryData(draftPostsQueryKey, draftPosts)
          context.queryClient.setQueryData(allPostsQueryKey, allPosts)

          console.log('✅ SSR: Blog dashboard data cached with keys:', {
            stats: statsQueryKey,
            draftPosts: draftPostsQueryKey,
            allPosts: allPostsQueryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Blog Dashboard')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Blog Dashboard')
      }
    } else {
      // CLIENT: Check cache and ensure data
      console.time('Route Loader: Client ensureQueryData')

      const cachedStats = context.queryClient.getQueryData(statsQueryKey)
      const cachedDraftPosts = context.queryClient.getQueryData(draftPostsQueryKey)
      const cachedAllPosts = context.queryClient.getQueryData(allPostsQueryKey)

      console.log('📦 CLIENT: Cache check:', {
        statsCached: !!cachedStats,
        draftPostsCached: !!cachedDraftPosts,
        allPostsCached: !!cachedAllPosts
      })

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Blog Dashboard')
    }
  },
  component: BlogDashboardComponent,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="admin" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Blog Dashboard</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'admin.blog', {
        title: 'Blog Dashboard - Admin',
        description: 'Manage your blog posts, categories, and analytics',
        keywords: 'admin, blog, posts, management, analytics',
      }),
    }
  },
})

function BlogDashboardComponent() {
  return <BlogDashboard />
}
