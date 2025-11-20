// src/features/boilerplate/i18n/hooks.tsx

import { useI18n } from './context'
import type { Namespace } from './config'

export function useTranslation<N extends Namespace = 'common'>(namespace?: N) {
  const { t, locale } = useI18n()
  
  if (namespace) {
    return {
      t: (key: string, values?: Record<string, string | number>) => {
        return t(`${namespace}.${key}`, values)
      },
      locale
    } as const
  }
  
  return { t, locale } as const
}