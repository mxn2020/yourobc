// routes/{-$locale}/_protected/_system/email/templates.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { EmailTemplatesPage, emailService } from '@/features/system/email'
import { api } from '@/generated/api'
import { Loading } from '@/components/ui'
import { defaultLocale } from '@/features/system/i18n'
import { createI18nSeo } from '@/utils/seo'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/_system/email/templates')({
  loader: async ({ context }) => {
    const isServer = typeof window === 'undefined'
    console.log(`🔄 Route Loader STARTED (${isServer ? 'SERVER' : 'CLIENT'})`)
    console.time('Route Loader: Email Templates')

    // Auth is verified by _protected layout - use user from context
    const { user } = context
    const locale = (context.locale || defaultLocale) as Locale

    // Check admin role
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: {
          locale: locale === defaultLocale ? undefined : locale
        }
      })
    }

    // ✅ Use service-provided query options for consistency
    const templatesQueryOptions = emailService.getAllTemplatesQueryOptions()

    // SERVER: SSR prefetching with authenticated Convex client
    if (typeof window === 'undefined') {
      try {
        console.time('Route Loader: SSR Data Fetch')
        const { getAuthenticatedConvexClient } = await import('@/lib/convex-server')
        const convexClient = await getAuthenticatedConvexClient()

        if (convexClient) {
          const templates = await convexClient.query(api.lib.system.email.email_templates.queries.getAllTemplates, {})

          // Cache data using service query options (ensures same keys as hooks)
          context.queryClient.setQueryData(templatesQueryOptions.queryKey, templates)

          console.log('✅ SSR: Data cached with keys:', {
            templates: templatesQueryOptions.queryKey
          })

          console.timeEnd('Route Loader: SSR Data Fetch')
        }
        console.timeEnd('Route Loader: Email Templates')
      } catch (error) {
        console.warn('SSR prefetch failed:', error)
        console.timeEnd('Route Loader: SSR Data Fetch')
        console.timeEnd('Route Loader: Email Templates')
      }
    } else {
      // CLIENT: Use ensureQueryData to leverage cache or fetch if needed
      console.time('Route Loader: Client ensureQueryData')

      const cachedTemplates = context.queryClient.getQueryData(templatesQueryOptions.queryKey)

      console.log('📦 CLIENT: Cache check:', {
        templatesCached: !!cachedTemplates
      })

      await context.queryClient.ensureQueryData(templatesQueryOptions)

      console.timeEnd('Route Loader: Client ensureQueryData')
      console.timeEnd('Route Loader: Email Templates')
    }
  },
  component: EmailTemplatesIndexPage,
  pendingComponent: () => (
    <Loading size="lg" message="page.loading" namespace="email" showMessage />
  ),
  head: async ({ matches }) => {
    // ✅ Get locale from context instead of location
    const locale = matches[0]?.context?.locale || defaultLocale

    return {
      // SEO metadata with i18n support, loaded from translations: metadata.json
      meta: await createI18nSeo(locale, 'email.templates', {
        title: 'Email Templates - Admin',
        description: 'Manage email templates',
        keywords: 'email, templates, admin, management',
      }),
    }
  },
})

function EmailTemplatesIndexPage() {
  return <EmailTemplatesPage />
}
