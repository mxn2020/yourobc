// src/features/boilerplate/i18n/index.ts

export * from './config'
export * from './types'
export * from './context'
export * from './hooks'
export { getLocaleFromPath, addLocaleToPath, stripLocaleFromPath } from './utils/path'
export { I18N_CONFIG, isI18nEnabled, isLocaleEnabled, getEnabledLocales } from './config/i18n-config'
export type { I18nConfig } from './config/i18n-config'
