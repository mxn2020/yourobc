// src/features/boilerplate/lib/route-guards-client.ts
import { redirect } from '@tanstack/react-router'
import { authService } from '../services/AuthService'
import { getCurrentLocale } from '@/features/boilerplate/i18n/utils/path'

// === Client-side Guards ===

/**
 * Client-side helper to check authentication and redirect if needed
 * Use in route loaders or components
 */
export async function requireAuth(location?: string) {
  try {
    const session = await authService.getSession()

    if (!session?.data?.user?.id) {
      const locale = getCurrentLocale()
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale }
      })
    }

    return session.data.user
  } catch (error) {
    if (error && typeof error === 'object' && 'to' in error) {
      throw error
    }
    const locale = getCurrentLocale()
    throw redirect({
      to: '/{-$locale}/auth/login',
      params: { locale }
    })
  }
}

/**
 * Check if user is authenticated without redirect
 * Returns auth status and user data
 */
export async function getAuthStatus() {
  try {
    const session = await authService.getSession()
    return {
      isAuthenticated: !!session?.data?.user?.id,
      user: session?.data?.user || null
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null
    }
  }
}

/**
 * Guest-only route protection (redirect authenticated users away)
 * Use this for login/signup pages
 */
export async function requireGuestBeforeLoad(redirectTo?: string) {
  try {
    const session = await authService.getSession()

    if (session?.data?.user?.id) {
      // If redirectTo is provided and starts with /, use it directly
      // Otherwise construct the default dashboard path
      if (redirectTo && redirectTo.startsWith('/')) {
        throw redirect({
          to: redirectTo as any,
        })
      } else {
        const locale = getCurrentLocale()
        throw redirect({
          to: '/{-$locale}/dashboard',
          params: { locale }
        })
      }
    }

    return null
  } catch (error) {
    // If it's already a redirect, re-throw it
    if (error && typeof error === 'object' && 'to' in error) {
      throw error
    }

    // For any other error, allow access (guest mode)
    return null
  }
}

/**
 * Client-side admin check with redirect
 * Note: This only checks auth - full admin verification happens server-side
 */
export async function requireAdmin(location?: string) {
  try {
    const session = await authService.getSession()

    if (!session?.data?.user?.id) {
      const locale = getCurrentLocale()
      throw redirect({
        to: '/{-$locale}/auth/login',
        params: { locale }
      })
    }

    // Note: Full admin role verification should be done in route loaders
    // using server functions for security
    return session.data.user
  } catch (error) {
    if (error && typeof error === 'object' && 'to' in error) {
      throw error // Re-throw redirect
    }
    const locale = getCurrentLocale()
    throw redirect({
      to: '/{-$locale}/auth/login',
      params: { locale }
    })
  }
}

// === Permission Helpers ===

/**
 * Check if current user has specific permission
 * Requires Convex query, so use in components/hooks, not route loaders
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const session = await authService.getSession()
    if (!session?.data?.user?.id) return false
    
    // This would need to be implemented in a React component/hook
    // since it requires Convex queries
    console.warn('hasPermission should be used in components with useAuth hook')
    return false // Placeholder - implement based on your state management
  } catch (error) {
    return false
  }
}

// === Route Definition Helpers ===

/**
 * Create beforeLoad function for protected routes
 */
export const beforeLoadAuth = ({ location }: { location: any }) => 
  requireAuth(location.pathname)

/**
 * Create beforeLoad function for admin routes
 */
export const beforeLoadAdmin = ({ location }: { location: any }) => 
  requireAdmin(location.pathname)

// === Type Guards ===
export function isAuthError(error: unknown): error is { to: string; search?: any } {
  return error !== null && 
    typeof error === 'object' && 'to' in error && 
    typeof (error).to === 'string'
}