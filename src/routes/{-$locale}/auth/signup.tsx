// src/routes/$locale/auth/signup.tsx

import { createFileRoute } from '@tanstack/react-router'
import { SignupPage, requireGuestBeforeLoad } from '@/features/system/auth'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/auth/signup')({
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
  component: SignupPage,
})