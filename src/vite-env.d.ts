/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * Add new environment variables here to get TypeScript autocomplete and type checking
 */
interface ImportMetaEnv {
  // App Loading Behavior
  readonly VITE_ENABLE_ROOT_LOADING_SPINNER?: string

  // Convex
  readonly VITE_CONVEX_URL: string

  // Better Auth
  readonly VITE_BETTER_AUTH_URL: string

  // Stripe
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string

  // Blog
  readonly VITE_SITE_URL?: string
  readonly VITE_ENABLE_BLOG?: string
  readonly VITE_PRIMARY_BLOG_PROVIDER?: string
  readonly VITE_BLOG_DEFAULT_AUTHOR?: string
  readonly VITE_BLOG_POSTS_PER_PAGE?: string

  // Internationalization (i18n)
  readonly VITE_ENABLE_I18N?: string
  readonly VITE_I18N_DEFAULT_LOCALE?: string
  readonly VITE_I18N_ENABLED_LOCALES?: string
  readonly VITE_I18N_FALLBACK_LOCALE?: string
  readonly VITE_I18N_DETECT_BROWSER_LOCALE?: string
  readonly VITE_I18N_PERSIST_LOCALE?: string
  readonly VITE_I18N_SHOW_LANGUAGE_SWITCHER?: string
  readonly VITE_I18N_CACHE_TRANSLATIONS?: string
  readonly VITE_I18N_SHOW_MISSING_WARNINGS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
