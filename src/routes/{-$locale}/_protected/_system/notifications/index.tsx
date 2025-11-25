// routes/{-$locale}/_protected/_system/notifications/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage, notificationService } from '@/features/system/notifications'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_system/notifications/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Notifications')

    // ✅ Use service-provided query options for consistency
    const notificationsQueryOptions = notificationService.getNotificationsQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const notifications = await convexClient.query(api.lib.system.core.notifications.queries.getNotifications, {})

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(notificationsQueryOptions.queryKey, notifications)

          console.log('✅ SSR: Data cached with keys:', {
            notifications: notificationsQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Notifications')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Notifications')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedNotifications = context.queryClient.getQueryData(notificationsQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        notificationsCached: !!cachedNotifications
      })

      await context.queryClient.ensureQueryData(notificationsQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Notifications')
    }
  },
  component: NotificationsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="notifications" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'notifications', {
        title: 'Notifications',
        description: 'Manage your notifications and alerts',
        keywords: 'notifications, alerts, messages, updates',
      }),
    }
  },
})

function NotificationsIndexPage() {
  return <NotificationsPage />
}
