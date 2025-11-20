// routes/{-$locale}/_protected/_boilerplate/ai-testing.tsx

import { createFileRoute } from '@tanstack/react-router'
import { AITestingPage } from '@/features/boilerplate/ai-testing'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/_boilerplate/ai-testing')({
  loader: async () => {
    // Note: AI Testing is an interactive page, no data prefetching needed
  },
  component: AITestingIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="ai" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'ai-testing', {
        title: 'AI Testing',
        description: 'Test and compare AI models and capabilities',
        keywords: 'ai, testing, models, comparison, playground',
      }),
    }
  },
})

function AITestingIndexPage() {
  return <AITestingPage />
}
