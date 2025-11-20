// src/routes/{-$locale}/auth.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { locales, defaultLocale } from '@/features/system/i18n'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/auth')({
  beforeLoad: async ({ params }) => {
    const locale = (params.locale || defaultLocale) as Locale
    
    // Validate locale - redirect invalid locales to default
    if (params.locale && !locales.includes(locale)) {
      throw redirect({
        to: '/{-$locale}/auth',
        params: { locale: undefined }, // Clean URL for default locale
      })
    }
    
    return { locale }
  },
  
  component: () => <Outlet />
})