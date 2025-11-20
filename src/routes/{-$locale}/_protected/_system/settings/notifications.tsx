// routes/{-$locale}/_protected/_system/settings/notifications.tsx

import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettingsPage } from '@/features/system/notifications'
import { NotificationService } from '@/features/system/notifications/services/NotificationService'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

const notificationService = NotificationService.getInstance()

export const Route = createFileRoute('/{-$locale}/_protected/_system/settings/notifications')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    console.log(`🔄 Notification Settings Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Notification Settings Page')

    // Get query options for notification settings
    const settingsQueryOptions = notificationService.getNotificationSettingsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (isServer) {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch notification settings
          const settings = await convexClient.query(settingsQueryOptions.queryFn as any)

          // Cache data
          context.queryClient.setQueryData(settingsQueryOptions.queryKey, settings)

          console.log('✅ SSR: Notification settings cached:', {
            settings: settingsQueryOptions.queryKey,
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Notification Settings Page')
      } catch (error) {
        console.warn('SSR prefetch failed for notification settings:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Notification Settings Page')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedSettings = context.queryClient.getQueryData(settingsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        settingsCached: !!cachedSettings,
      })

      await context.queryClient.ensureQueryData(settingsQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Notification Settings Page')
    }

    return {}
  },
  component: NotificationSettingsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="settings" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Notification Settings</h2>
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
      meta: await createI18nSeo(locale, 'settings.notifications', {
        title: 'Notification Settings',
        description: 'Manage your notification preferences',
        keywords: 'notifications, settings, preferences, alerts',
      }),
    }
  },
})

function NotificationSettingsIndexPage() {
  return <NotificationSettingsPage />
}
