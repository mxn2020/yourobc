// src/routes/{-$locale}/auth/login.tsx

import { createFileRoute } from '@tanstack/react-router'
import { LoginPage, requireGuestBeforeLoad } from '@/features/system/auth'
import { defaultLocale } from '@/features/system/i18n'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/auth/login')({
  validateSearch: (search: Record<string, unknown>): {
    redirect?: string
    email?: string
  } => {
    return {
      redirect: (search.redirect as string) || undefined,
      email: (search.email as string) || undefined,
    }
  },
  beforeLoad: async ({ search, params }) => {
    const locale = (params.locale || defaultLocale) as Locale
    
    // Build the default redirect path as a string
    const defaultRedirectPath = locale === defaultLocale 
      ? '/dashboard' 
      : `/${locale}/dashboard`
    
    await requireGuestBeforeLoad(search.redirect || defaultRedirectPath)
    
    return { 
      session: null,
      locale 
    }
  },
  component: LoginPage,
})
