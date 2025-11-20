// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { WebsitePagesPage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const websiteId = params.websiteId as WebsiteId

    console.log(`🔄 Website Pages Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Website: ${websiteId}`)
    console.time('Route Loader: Website Pages')

    // ✅ Use service-provided query options for consistency
    const websiteQueryOptions = websitesService.getWebsiteQueryOptions(websiteId)
    const pagesQueryOptions = websitesService.getWebsitePagesQueryOptions(websiteId, { limit: 100 })

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch website and pages in parallel
          const [website, pages] = await Promise.all([
            convexClient.query(api.lib.boilerplate.websites.queries.getWebsite, {
              websiteId
            }),
            convexClient.query(api.lib.boilerplate.websites.queries.getWebsitePages, {
              websiteId,
              options: { limit: 100 }
            })
          ])

          // Cache data using service query options
          context.queryClient.setQueryData(websiteQueryOptions.queryKey, website)
          context.queryClient.setQueryData(pagesQueryOptions.queryKey, pages)

          console.log('✅ SSR: Website pages data cached:', {
            website: websiteQueryOptions.queryKey,
            pages: pagesQueryOptions.queryKey,
            websiteName: website?.name,
            pageCount: pages?.pages?.length || 0
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Website Pages')
      } catch (error) {
        console.warn('SSR prefetch failed for website pages:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Website Pages')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedWebsite = context.queryClient.getQueryData(websiteQueryOptions.queryKey)
      const cachedPages = context.queryClient.getQueryData(pagesQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        websiteCached: !!cachedWebsite,
        pagesCached: !!cachedPages,
        websiteName: cachedWebsite ? (cachedWebsite as any).name : 'Not cached'
      })

      await Promise.all([
        context.queryClient.ensureQueryData(websiteQueryOptions),
        context.queryClient.ensureQueryData(pagesQueryOptions)
      ])

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Website Pages')
    }

    return {}
  },
  component: WebsitePagesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches, params }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'websites.pages', {
        title: 'Website Pages',
        description: `Manage pages for website ${params.websiteId}`,
        keywords: 'website pages, page management, content management',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Pages</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
})

function WebsitePagesIndexPage() {
  const { websiteId } = Route.useParams()

  return <WebsitePagesPage websiteId={websiteId as WebsiteId} />
}
