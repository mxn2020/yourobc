// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/settings.tsx

import { createFileRoute } from '@tanstack/react-router'
import { WebsiteSettingsPage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/settings')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const websiteId = params.websiteId as WebsiteId

    console.log(`🔄 Website Settings Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Website: ${websiteId}`)
    console.time('Route Loader: Website Settings')

    // ✅ Use service-provided query options for consistency
    const websiteQueryOptions = websitesService.getWebsiteQueryOptions(websiteId)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch website data
          const website = await convexClient.query(api.lib.boilerplate.websites.queries.getWebsite, {
            websiteId
          })

          // Cache data using service query options
          context.queryClient.setQueryData(websiteQueryOptions.queryKey, website)

          console.log('✅ SSR: Website settings data cached:', {
            website: websiteQueryOptions.queryKey,
            websiteName: website?.name
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Website Settings')
      } catch (error) {
        console.warn('SSR prefetch failed for website settings:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Website Settings')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedWebsite = context.queryClient.getQueryData(websiteQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        websiteCached: !!cachedWebsite,
        websiteName: cachedWebsite ? (cachedWebsite as any).name : 'Not cached'
      })

      await context.queryClient.ensureQueryData(websiteQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Website Settings')
    }

    return {}
  },
  component: WebsiteSettingsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support
      meta: await createI18nSeo(locale, 'websites.settings', {
        title: 'Website Settings',
        description: 'Configure website settings and preferences',
        keywords: 'website settings, configuration, preferences',
      }),
    }
  },
})

function WebsiteSettingsIndexPage() {
  const { websiteId } = Route.useParams()

  return <WebsiteSettingsPage websiteId={websiteId as WebsiteId} />
}
