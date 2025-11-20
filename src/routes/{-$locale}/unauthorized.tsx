// src/routes/{-$locale}/unauthorized.tsx

import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useTranslation } from '@/features/boilerplate/i18n'
import { locales, defaultLocale } from '@/features/boilerplate/i18n'
import type { Locale } from '@/features/boilerplate/i18n'

export const Route = createFileRoute('/{-$locale}/unauthorized')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
      error: (search.error as string) || undefined,
    }
  },
  beforeLoad: ({ params }) => {
    const locale = (params.locale || defaultLocale) as Locale

    // Validate locale
    if (params.locale && !locales.includes(locale)) {
      throw redirect({
        to: '/{-$locale}/unauthorized',
        params: { locale: undefined },
        search: {
          redirect: undefined,
          error: 'Invalid locale specified'
        }
      })
    }

    return { locale }
  },
  component: UnauthorizedPage,
  head: () => ({
    meta: [
      {
        title: 'Unauthorized - Geenius',
      },
      {
        name: 'description',
        content: 'Access denied to the requested resource',
      },
    ],
  }),
})

function UnauthorizedPage() {
  const { redirect: redirectUrl, error } = Route.useSearch()
  const { locale } = Route.useRouteContext()
  const { t } = useTranslation('auth')

  const errorMessage = error || t('unauthorized.defaultMessage')
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('unauthorized.title')}
        </h1>

        <p className="text-gray-600 mb-6">{errorMessage}</p>

        <div className="space-y-3">
          <Link
            to="/{-$locale}/dashboard"
            params={{ locale: locale === defaultLocale ? undefined : locale }}
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            {t('unauthorized.actions.goToDashboard')}
          </Link>

          <Link
            to={redirectUrl || `${localePrefix}/dashboard`}
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
          >
            {t('unauthorized.actions.tryAgain')}
          </Link>
        </div>
      </div>
    </div>
  )
}