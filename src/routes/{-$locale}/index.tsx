// src/routes/{-$locale}/index.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthStatus } from '@/features/system/auth/lib/route-guards-client'
import { defaultLocale } from '@/features/system/i18n'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/')({
  beforeLoad: async ({ params }) => {
    const locale = (params.locale || defaultLocale) as Locale

    const { isAuthenticated } = await getAuthStatus()

    if (isAuthenticated) {
      throw redirect({ 
        to: '/{-$locale}/dashboard',
        params: { 
          locale: locale === defaultLocale ? undefined : locale 
        }
      })
    } else {
      throw redirect({ 
        to: '/{-$locale}/auth/login',
        params: { 
          locale: locale === defaultLocale ? undefined : locale 
        },
        search: {
          redirect: undefined,
          email: undefined
        }
      })
    }
  },
})