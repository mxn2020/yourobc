// src/features/system/lib/route-guards-server.ts
import { redirect } from '@tanstack/react-router'
import { getSessionServer, requireAuthServer, requireAdminServer, getCurrentUserServer } from './server-functions'
import { defaultLocale } from '@/features/system/i18n'
import type { Locale } from '@/features/system/i18n'

// === Server-side Route Loader Helpers ===

/**
 * Route loader helper for protected routes
 * Use in route definitions
 */
export const createAuthLoader = (locale?: Locale) => async () => {
  try {
    return await requireAuthServer()
  } catch (error) {
    const activeLocale = locale || defaultLocale
    throw redirect({
      to: '/{-$locale}/auth/login',
      params: { locale: activeLocale }
    })
  }
}

/**
 * Route loader helper for admin-only routes
 * Use in route definitions
 */
export const createAdminLoader = (locale?: Locale) => async () => {
  try {
    return await requireAdminServer()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access denied'
    const activeLocale = locale || defaultLocale

    if (message.includes('Not authenticated')) {
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale: activeLocale }
      })
    }

    // User is authenticated but not admin
    throw redirect({
      to: '/{-$locale}/dashboard',
      params: { locale: activeLocale }
    })
  }
}

/**
 * Route loader helper that loads current user with profile
 * Use for routes that need user context
 */
export const createUserLoader = () => async () => {
  try {
    return await getCurrentUserServer()
  } catch (error) {
    console.warn('Failed to load user in route loader:', error)
    return null
  }
}

// === Conditional Guards ===

/**
 * Check auth status without throwing
 * Useful for optional authentication
 */
export async function checkAuthOptional() {
  try {
    const session = await getSessionServer()
    return session?.user?.id || null
  } catch (error) {
    return null
  }
}

/**
 * Redirect authenticated users away from auth pages
 * Use on login/signup routes
 */
export async function redirectIfAuthenticated(locale?: Locale) {
  try {
    const session = await getSessionServer()
    if (session?.user?.id) {
      const activeLocale = locale || defaultLocale
      throw redirect({
        to: '/{-$locale}/dashboard',
        params: { locale: activeLocale }
      })
    }
    return null
  } catch (error) {
    if (error && typeof error === 'object' && 'to' in error) {
      throw error // Re-throw redirect
    }
    return null
  }
}

/**
 * Create beforeLoad function that redirects authenticated users
 */
export const beforeLoadGuest = (locale?: Locale) =>
  redirectIfAuthenticated(locale)