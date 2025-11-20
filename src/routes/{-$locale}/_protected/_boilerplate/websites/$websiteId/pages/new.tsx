// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/new.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CreatePagePage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/new')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const websiteId = params.websiteId as WebsiteId

    console.log(`🔄 Create Page Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Website: ${websiteId}`)
    console.time('Route Loader: Create Page')

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

          console.log('✅ SSR: Website data cached for page creation:', {
            website: websiteQueryOptions.queryKey,
            websiteName: website?.name
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Create Page')
      } catch (error) {
        console.warn('SSR prefetch failed for create page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Create Page')
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
      console.timeEnd('Route Loader: Create Page')
    }

    return {}
  },
  component: CreatePageIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'websites.pages.create', {
        title: 'Create New Page',
        description: 'Create a new page for your website',
        keywords: 'create page, new page, page builder',
      }),
    }
  },
})

function CreatePageIndexPage() {
  const { websiteId } = Route.useParams()

  return <CreatePagePage websiteId={websiteId as WebsiteId} />
}
