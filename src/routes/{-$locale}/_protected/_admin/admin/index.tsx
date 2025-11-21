// routes/{-$locale}/_protected/_admin/admin/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardPage } from '@/features/system/admin'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Admin Dashboard`)
    console.time('Route Loader: Admin Dashboard')

    // Get admin user from parent context (admin auth layer)
    const { adminUser } = context

    if (!adminUser || !adminUser.id) {
      console.warn('Admin user not found in context')
      return {}
    }

    // ✅ Define query options for consistency (inline since no service exists yet)
    const statsQueryKey = ['user_profiles', 'getProfileStats', {}]
    const usersQueryKey = ['user_profiles', 'getAllProfiles', { options: { limit: 10 } }]

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [stats, users] = await Promise.all([
            convexClient.query(api.lib.system.user_profiles.queries.getProfileStats, {}),
            convexClient.query(api.lib.system.user_profiles.queries.getAllProfiles, {
              options: { limit: 10 }
            })
          ])

          // Cache data using query keys (ensures same keys as hooks)
          context.queryClient.setQueryData(statsQueryKey, stats)
          context.queryClient.setQueryData(usersQueryKey, users)

          console.log('✅ SSR: Admin dashboard data cached with keys:', {
            stats: statsQueryKey,
            users: usersQueryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Admin Dashboard')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Admin Dashboard')
      }
    } else {
      // CLIENT: Check cache and ensure data
      console.time('Route Loader: Client ensureQueryData')

      const cachedStats = context.queryClient.getQueryData(statsQueryKey)
      const cachedUsers = context.queryClient.getQueryData(usersQueryKey)

      console.log('📦 CLIENT: Cache check:', {
        statsCached: !!cachedStats,
        usersCached: !!cachedUsers
      })

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Admin Dashboard')
    }
  },
  component: AdminDashboardIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="admin" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Admin Dashboard</h2>
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
      meta: await createI18nSeo(locale, 'admin.dashboard', {
        title: 'Admin Dashboard',
        description: 'Manage users, content, and system settings',
        keywords: 'admin, dashboard, management, users, analytics',
      }),
    }
  },
})

function AdminDashboardIndexPage() {
  return <AdminDashboardPage />
}
