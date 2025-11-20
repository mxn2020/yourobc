import { useI18n } from '@/features/boilerplate/i18n/context'
import { useLocation } from '@tanstack/react-router'
import { locales } from '@/features/boilerplate/i18n/config'
import { stripLocaleFromPath } from '@/features/boilerplate/i18n/utils/path'

export function LocaleSEO() {
  const { locale } = useI18n()
  const location = useLocation()
  const pathWithoutLocale = stripLocaleFromPath(location.pathname)
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

  return (
    <>
      {/* Canonical */}
      <link rel="canonical" href={`${baseUrl}/${locale}${pathWithoutLocale}`} />

      {/* Alternate languages */}
      {locales.map((loc) => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={loc}
          href={`${baseUrl}/${loc}${pathWithoutLocale}`}
        />
      ))}

      {/* Default language */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en${pathWithoutLocale}`}
      />

      {/* Open Graph locale */}
      <meta property="og:locale" content={locale} />
      {locales
        .filter((l) => l !== locale)
        .map((loc) => (
          <meta key={loc} property="og:locale:alternate" content={loc} />
        ))}
    </>
  )
}
