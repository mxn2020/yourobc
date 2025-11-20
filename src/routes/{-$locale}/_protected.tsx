// src/routes/{-$locale}/_protected.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionServer } from '@/features/boilerplate/auth/lib/server-functions'
import { locales, defaultLocale } from '@/features/boilerplate/i18n'
import type { Locale } from '@/features/boilerplate/i18n'

export const Route = createFileRoute('/{-$locale}/_protected')({
  beforeLoad: async ({ location, params }) => {
    const locale = (params.locale || defaultLocale) as Locale

    // Validate locale first
    if (params.locale && !locales.includes(locale)) {
      throw redirect({
        to: '/{-$locale}/dashboard', // Safe fallback
        params: { locale: undefined }, // Use default locale
      })
    }

    // Server-side session check
    const session = await getSessionServer()

    if (!session?.user) {
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale: locale === defaultLocale ? undefined : locale },
        search: {
          redirect: location.href,
          email: undefined
        }
      })
    }

    // Note: Convex queries are client-side only because they require JWT authentication
    // The userProfile will be loaded on the client side via Convex queries
    // Server-side we only verify the Better Auth session
    return {
      user: session.user,
      authUserId: session.user.id, // Convenient accessor for loaders
      userProfile: null, // Will be loaded client-side
      locale
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return <Outlet />
}
