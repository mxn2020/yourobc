// routes/{-$locale}/_protected/_admin/admin/users.tsx

import { createFileRoute } from '@tanstack/react-router'
import { UserManagementPage } from '@/features/system/admin'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_admin/admin/users')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Admin Users`)
    console.time('Route Loader: Admin Users')

    // Get admin user from parent context (admin auth layer)
    const { adminUser } = context

    if (!adminUser || !adminUser.id) {
      console.warn('Admin user not found in context')
      return {}
    }

    // ✅ Define query options for consistency (inline since no service exists yet)
    const usersQueryKey = ['user_profiles', 'getAllProfiles', { options: { limit: 25, offset: 0 } }]

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const users = await convexClient.query(
            api.lib.system.user_profiles.queries.getAllProfiles,
            { options: { limit: 25, offset: 0 } }
          )

          // Cache data using query keys (ensures same keys as hooks)
          context.queryClient.setQueryData(usersQueryKey, users)

          console.log('✅ SSR: Users data cached with keys:', {
            users: usersQueryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Admin Users')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Admin Users')
      }
    } else {
      // CLIENT: Check cache and ensure data
      console.time('Route Loader: Client ensureQueryData')

      const cachedUsers = context.queryClient.getQueryData(usersQueryKey)

      console.log('📦 CLIENT: Cache check:', {
        usersCached: !!cachedUsers
      })

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Admin Users')
    }
  },
  component: UserManagementIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="admin" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading User Management</h2>
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
      meta: await createI18nSeo(locale, 'admin.users', {
        title: 'User Management - Admin',
        description: 'Manage user accounts, roles, and permissions',
        keywords: 'admin, users, management, roles, permissions',
      }),
    }
  },
})

function UserManagementIndexPage() {
  return <UserManagementPage />
}
