// src/routes/$locale/auth/forgot-password.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage, requireGuestBeforeLoad } from '@/features/boilerplate/auth'
import type { Locale } from '@/features/boilerplate/i18n'

export const Route = createFileRoute('/{-$locale}/auth/forgot-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  beforeLoad: async ({ search, params }) => {
    const locale = params.locale as Locale
    
    await requireGuestBeforeLoad(search.redirect || `/${locale}/dashboard`)
    
    return { 
      session: null,
      locale 
    }
  },
  component: ForgotPasswordPage,
})