// src/features/boilerplate/auth/hooks/useAuthenticatedUser.ts

import { useAuth } from './useAuth'
import { Id } from "@/convex/_generated/dataModel"

/**
 * Standardized hook for getting authenticated user data
 * Returns null if user is not authenticated or loading
 * Simplified with proper typing
 */
export function useAuthenticatedUser() {
  const { auth, profile, isAuthenticated, isAuthLoading } = useAuth()

  // Return null if not authenticated, still loading, or missing required data
  if (!isAuthenticated || isAuthLoading || !auth?.id || !profile) {
    return null
  }

  return {
    id: auth.id,
    role: profile.role || 'user',
    name: auth.name || profile.name,
    email: profile.email,
    permissions: profile.permissions || [],
  }
}
