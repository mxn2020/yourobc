// routes/{-$locale}/_protected/_boilerplate/ai-models/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { AIModelsPage } from '@/features/boilerplate/ai-models'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/ai-models/')({
  loader: async () => {
    // Note: AI Models use REST API, not Convex, so no SSR prefetching
    // Data is fetched client-side via React Query
  },
  component: AIModelsIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="ai" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'ai-models', {
        title: 'AI Models',
        description: 'Manage and configure AI models for your projects',
        keywords: 'ai, models, configuration, management, providers',
      }),
    }
  },
})

function AIModelsIndexPage() {
  return <AIModelsPage />
}
