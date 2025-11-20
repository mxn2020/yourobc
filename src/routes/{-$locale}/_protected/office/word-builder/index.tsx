// routes/{-$locale}/_protected/office/word-builder/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { WordBuilderPage, wordBuilderService } from '@/features/office/word-builder'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/office/word-builder/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    const documentsQueryOptions = wordBuilderService.getWordDocumentsQueryOptions({ limit: 100 })
    const statsQueryOptions = wordBuilderService.getWordDocumentStatsQueryOptions()

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [documents, stats] = await Promise.all([
            convexClient.query(api.lib.addons.office.word_documents.queries.getWordDocuments, {
              options: { limit: 100 }
            }),
            convexClient.query(api.lib.addons.office.word_documents.queries.getWordDocumentStats, {})
          ])

          context.queryClient.setQueryData(documentsQueryOptions.queryKey, documents)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      await Promise.all([
        context.queryClient.ensureQueryData(documentsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])
    }
  },
  component: WordBuilderIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading Word Builder..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'word-builder', {
        title: 'Word Document Builder - Create Documents with AI',
        description: 'Generate professional Word documents from natural language descriptions. Create formatted documents, reports, and letters automatically.',
        keywords: 'word, document, builder, AI, automation, reports, letters',
      }),
    }
  },
})

function WordBuilderIndexPage() {
  return <WordBuilderPage />
}
