// routes/{-$locale}/_protected/marketing/email-signatures/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EmailSignaturesPage, emailSignaturesService } from '@/features/marketing/email-signatures'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'
import { createI18nSeo } from '@/utils/seo'

export const Route = createFileRoute('/{-$locale}/_protected/marketing/email-signatures/')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    const signaturesQueryOptions = emailSignaturesService.getSignaturesQueryOptions({ limit: 100 })

    if (isServer) {
      try {
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()
        if (convexClient) {
          const { api } = await import('@/convex/_generated/api')
          const signatures = await convexClient.query(
            api.lib.addons.marketing.email_signatures.queries.getEmailSignatures,
            { options: { limit: 100 } }
          )
          context.queryClient.setQueryData(signaturesQueryOptions.queryKey, signatures)
        }
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
      }
    } else {
      await context.queryClient.ensureQueryData(signaturesQueryOptions)
    }
  },
  component: EmailSignaturesIndexPage,
  pendingComponent: () => <Loading size="lg" message="Loading signatures..." showMessage />,
  head: async ({ matches }) => {
    const locale = matches[0]?.context?.locale || defaultLocale
    return {
      meta: await createI18nSeo(locale, 'email-signatures', {
        title: 'Email Signature Generator',
        description: 'Create professional email signatures with templates and team management',
        keywords: 'email signature, professional, template, team management',
      }),
    }
  },
})

function EmailSignaturesIndexPage() {
  return <EmailSignaturesPage />
}
