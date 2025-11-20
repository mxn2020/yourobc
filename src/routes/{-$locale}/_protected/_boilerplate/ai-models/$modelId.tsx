// routes/{-$locale}/_protected/_boilerplate/ai-models/$modelId.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ModelDetailPage } from '@/features/boilerplate/ai-models'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/ai-models/$modelId')({
  loader: async () => {
    // Note: AI Models use REST API, not Convex, so no SSR prefetching
    // Data is fetched client-side via React Query
  },
  component: ModelDetailComponent,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="ai" showMessage />
  ),
  errorComponent: ({ error, reset }) => (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading AI Model</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  ),
  head: async ({ matches, params }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'ai-models.detail', {
        title: `AI Model - ${params.modelId}`,
        description: `Configure and manage AI model ${params.modelId}`,
        keywords: 'ai, model, configuration, details',
      }),
    }
  },
})

function ModelDetailComponent() {
  return <ModelDetailPage />
}
