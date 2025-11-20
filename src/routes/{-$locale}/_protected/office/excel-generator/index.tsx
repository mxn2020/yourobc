// routes/{-$locale}/_protected/office/excel-generator/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ExcelGeneratorPage, excelGeneratorService } from '@/features/office/excel-generator'
import { api } from '@/convex/_generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/office/excel-generator/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'

    const documentsQueryOptions = excelGeneratorService.getExcelDocumentsQueryOptions({ limit: 100 })
    const statsQueryOptions = excelGeneratorService.getExcelDocumentStatsQueryOptions()

    // SERVER: SSR prefetching
    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const [documents, stats] = await Promise.all([
            convexClient.query(api.lib.addons.office.excel_documents.queries.getExcelDocuments, {
              options: { limit: 100 }
            }),
            convexClient.query(api.lib.addons.office.excel_documents.queries.getExcelDocumentStats, {})
          ])

          context.queryClient.setQueryData(documentsQueryOptions.queryKey, documents)
          context.queryClient.setQueryData(statsQueryOptions.queryKey, stats)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      // CLIENT: Use ensureQueryData
      await Promise.all([
        context.queryClient.ensureQueryData(documentsQueryOptions),
        context.queryClient.ensureQueryData(statsQueryOptions)
      ])
    }
  },
  component: ExcelGeneratorIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="Loading Excel Generator..." showMessage />
  ),
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      meta: await createI18nSeo(locale, 'excel-generator', {
        title: 'Excel Generator - Create Spreadsheets with AI',
        description: 'Generate Excel spreadsheets from natural language descriptions. Create formulas, charts, and formatted data tables automatically.',
        keywords: 'excel, spreadsheet, generator, AI, automation, formulas, charts',
      }),
    }
  },
})

function ExcelGeneratorIndexPage() {
  return <ExcelGeneratorPage />
}
