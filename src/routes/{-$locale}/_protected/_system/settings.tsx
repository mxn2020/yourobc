// routes/{-$locale}/_protected/_system/settings.tsx

import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { SettingsPage } from '@/components/Settings/SettingsPage'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_system/settings')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Settings Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Settings Page')

    // Get query options for user settings
    const userSettingsQueryOptions = convexQuery(api.lib.system.user.user_settings.queries.getUserSettings, {})

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch user settings
          const settings = await convexClient.query(api.lib.system.user.user_settings.queries.getUserSettings, {})

          // Cache data
          context.queryClient.setQueryData(userSettingsQueryOptions.queryKey, settings)

          console.log('✅ SSR: User settings cached:', {
            settings: userSettingsQueryOptions.queryKey,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Settings Page')
      } catch (error) {
        console.warn('SSR prefetch failed for user settings:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Settings Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedSettings = context.queryClient.getQueryData(userSettingsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        settingsCached: !!cachedSettings,
      })

      await context.queryClient.ensureQueryData(userSettingsQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Settings Page')
    }

    return {}
  },
  component: SettingsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="settings" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Settings</h2>
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
      meta: await createI18nSeo(locale, 'settings', {
        title: 'Settings',
        description: 'Manage your account settings and preferences',
        keywords: 'settings, account, preferences, profile',
      }),
    }
  },
})

function SettingsIndexPage() {
  return <SettingsPage />
}
