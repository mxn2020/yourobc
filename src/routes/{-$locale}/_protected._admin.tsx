// src/routes/{-$locale}/_protected._admin.tsx  ✅ Correct path

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { requireAdminServer } from '@/features/system/auth/lib/server-functions'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { locales, defaultLocale } from '@/features/system/i18n'
import type { Locale } from '@/features/system/i18n'

export const Route = createFileRoute('/{-$locale}/_protected/_admin')({
  beforeLoad: async ({ context, location, params }) => {
    const locale = (params.locale || defaultLocale) as Locale

    // Validate locale
    if (params.locale && !locales.includes(locale)) {
      throw redirect({
        to: '/{-$locale}/unauthorized',
        params: { locale: locale === defaultLocale ? undefined : locale },
        search: {
          redirect: location.href,
          error: 'Access denied. Admin privileges required.'
        }
      })
    }

    // Server-side auth check first
    const authResult = await requireAdminServer()

    // Check user profile and admin role
    const userProfile = await context.queryClient.ensureQueryData(
      convexQuery(api.lib.system.user_profiles.queries.getProfileByAuthId, {})
    )

    // Verify admin role and active status
    if (!userProfile ||
      (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') ||
      !userProfile.isActive) {
      throw redirect({
        to: '/{-$locale}/unauthorized',
        params: { locale: locale === defaultLocale ? undefined : locale },
        search: {
          redirect: location.href,
          error: 'Access denied. Admin privileges required.'
        }
      })
    }

    return {
      adminUser: authResult,
      adminProfile: userProfile,
      locale
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { adminUser, adminProfile } = Route.useRouteContext()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white p-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="text-sm">
            Welcome, {adminUser.email} | Role: {adminProfile?.role || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </div>
  )
}