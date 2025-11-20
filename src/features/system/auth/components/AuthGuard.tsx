// src/features/boilerplate/auth/components/AuthGuard.tsx


/**
 * AuthGuard - Client-side authentication guard component
 * OPTIMIZED VERSION - Simplified logic and reduced re-renders
 *
 * USAGE:
 * - Use for protecting specific components/sections within a page
 * - DO NOT use in AppLayout or route loaders (causes race conditions)
 * - Route-level protection is handled by _protected.tsx
 */

import { useEffect } from 'react'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { Loading } from '@/components/ui'
import type { AuthGuardProps } from '../types/auth.types'
import { useI18n } from '@/features/boilerplate/i18n'
import { defaultLocale } from '@/features/boilerplate/i18n'

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback
}: AuthGuardProps) {
  const { isAuthenticated, isAuthLoading, isProfileLoading, isAdmin } = useAuth()
  const router = useRouter()
  const location = useLocation()
  const { locale } = useI18n()

  const isLoading = isAuthLoading || isProfileLoading
  const isAuthRoute = location.pathname.includes('/auth')

  // Simplified single useEffect for all redirect logic
  useEffect(() => {
    // Skip checks for auth routes or while loading
    if (isAuthRoute || isLoading) return

    const shouldRedirectToLogin = requireAuth && !isAuthenticated
    const shouldRedirectFromAdmin = requireAdmin && isAuthenticated && !isAdmin

    if (shouldRedirectToLogin || shouldRedirectFromAdmin) {
      router.navigate({
        to: '/{-$locale}/auth/login',
        params: { locale: locale === defaultLocale ? undefined : locale },
        search: { redirect: location.pathname },
        replace: true,
      })
    }
  }, [
    isLoading,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    isAuthRoute,
    router,
    location.pathname,
    locale
  ])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="md" />
      </div>
    )
  }

  // Allow access to auth routes
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Allow access if auth not required
  if (!requireAuth) {
    return <>{children}</>
  }

  // Hide content while redirecting
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null
  }

  // User meets all requirements
  return <>{children}</>
}