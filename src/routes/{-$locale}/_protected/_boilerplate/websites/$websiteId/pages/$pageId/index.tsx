// routes/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/$pageId/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { PageDetailsPage } from '@/features/boilerplate/websites'
import { websitesService } from '@/features/boilerplate/websites/services/WebsitesService'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { WebsiteId } from '@/features/boilerplate/websites/types'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/websites/$websiteId/pages/$pageId/')({
  loader: async ({ params, context }) => {
    const isServer = typeof window === 'undefined'
    const { websiteId, pageId } = params

    console.log(`🔄 Page Details Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'}) - Page: ${pageId}`)
    console.time('Route Loader: Page Details')

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          // Fetch page with sections
          const page = await convexClient.query(api.lib.boilerplate.websites.queries.getPageWithSections, {
            pageId: pageId as any
          })

          // Cache data
          context.queryClient.setQueryData(['websites', 'pages', pageId], page)

          console.log('✅ SSR: Page data cached:', {
            pageId,
            pageTitle: page?.title
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Page Details')
      } catch (error) {
        console.warn('SSR prefetch failed for page:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Page Details')
      }
    }

    return {}
  },
  component: PageDetailsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="websites" showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support
      meta: await createI18nSeo(locale, 'websites.pages.details', {
        title: 'Page Details',
        description: 'View and manage page content',
        keywords: 'page details, content management, page editor',
      }),
    }
  },
})

function PageDetailsIndexPage() {
  const { websiteId, pageId } = Route.useParams()

  return <PageDetailsPage websiteId={websiteId as WebsiteId} pageId={pageId as any} />
}
