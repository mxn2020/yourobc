// src/routes/$locale/auth/reset-password.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage, requireGuestBeforeLoad } from '@/features/system/auth'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '', // Required for password reset
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
  component: ResetPasswordPage,
})