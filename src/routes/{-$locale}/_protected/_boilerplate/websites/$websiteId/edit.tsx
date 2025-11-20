// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/edit.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EditWebsitePage } from '@/features/boilerplate/websites/pages/EditWebsitePage'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { Loading } from '@/components/ui'
import { api } from '@/convex/_generated/api'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/edit')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const websiteId = params.websiteId as WebsiteId

    console.log(`🔄 Edit Website Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Website: ${websiteId}`)
    console.time('Route Loader: Edit Website')

    // ✅ Use service-provided query options for consistency
    const websiteQueryOptions = websitesService.getWebsiteQueryOptions(websiteId)

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch website data for editing
          const website = await convexClient.query(api.lib.boilerplate.websites.queries.getWebsite, {
            websiteId
          })

          // Cache data using service query options
          context.queryClient.setQueryData(websiteQueryOptions.queryKey, website)

          console.log('✅ SSR: Edit website data cached:', {
            website: websiteQueryOptions.queryKey,
            websiteName: website?.name
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Edit Website')
      } catch (error) {
        console.warn('SSR prefetch failed for edit website:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Edit Website')
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
      console.timeEnd('Route Loader: Edit Website')
    }

    return {}
  },
  component: EditWebsiteIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'websites.edit', {
        title: 'Edit Website',
        description: 'Edit website information and settings',
        keywords: 'edit website, update website, website settings',
      }),
    }
  },
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Website</h2>
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

function EditWebsiteIndexPage() {
  const { websiteId } = Route.useParams()

  return <EditWebsitePage websiteId={websiteId as WebsiteId} />
}
