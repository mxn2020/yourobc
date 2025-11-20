// src/features/system/i18n/components/LocaleLink.tsx

import { Link as TanStackLink } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { useI18n } from '@/features/system/i18n/context'

export function Link(props: LinkProps) {
  const { locale } = useI18n()
  const { to, ...restProps } = props

  // Add locale prefix if not present
  const localizedTo = typeof to === 'string' && !to.startsWith(`/${locale}`)
    ? `/${locale}${to.startsWith('/') ? to : `/${to}`}`
    : to

  return <TanStackLink to={localizedTo as any} {...restProps} />
}
