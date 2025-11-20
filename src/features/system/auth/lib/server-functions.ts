// src/features/boilerplate/lib/server-functions.ts

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from './auth-config' // Your Better Auth instance
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { AuthUser, Session } from '../types/auth.types'

/**
 * Get the Convex URL from environment
 * Works in both server and client contexts
 */
function getConvexUrl(): string {
  // Server-side (Node.js)
  if (typeof process !== 'undefined' && process.env?.VITE_CONVEX_URL) {
    return process.env.VITE_CONVEX_URL
  }
  // Client-side (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONVEX_URL) {
    return import.meta.env.VITE_CONVEX_URL
  }
  throw new Error('VITE_CONVEX_URL environment variable is not set')
}

// Shared helper to get authenticated session
async function getAuthenticatedSession() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  return session
}

// Shared helper to get authenticated Convex client
async function getAuthenticatedConvexClient(): Promise<ConvexHttpClient> {
  const session = await getAuthenticatedSession()

  if (!session.session?.token) {
    throw new Error('No authentication token available')
  }

  const convexUrl = process.env.VITE_CONVEX_URL || import.meta.env?.VITE_CONVEX_URL
  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL environment variable is not set')
  }

  const authenticatedConvex = new ConvexHttpClient(convexUrl)
  authenticatedConvex.setAuth(session.session.token)

  return authenticatedConvex
}

/**
 * Get the current session on the server side
 */
export const getSessionServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Session | null> => {
    try {
      const session = await getAuthenticatedSession()
      return {
        ...session,
        user: session.user as AuthUser,
      }
    } catch (error) {
      return null
    }
  }
)

/**
 * Require authentication on the server side - throws if not authenticated
 */
export const requireAuthServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser> => {
    const session = await getAuthenticatedSession()
    return session.user as AuthUser
  }
)

/**
 * Require admin role on the server side
 */
export const requireAdminServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getAuthenticatedSession()
    const authenticatedConvex = await getAuthenticatedConvexClient()

    const profile = await authenticatedConvex.query(
      api.lib.boilerplate.user_profiles.queries.getProfileByAuthId,
      {}
    )

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin') || !profile.isActive) {
      throw new Error('Admin access required')
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: profile.avatar,
      bio: profile.bio,
      role: profile.role,
      isActive: profile.isActive
    }
  }
)

/**
 * Get current user with basic profile data
 */
export const getCurrentUserServer = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const session = await getAuthenticatedSession()
      const authenticatedConvex = await getAuthenticatedConvexClient()

      const profile = await authenticatedConvex.query(
        api.lib.boilerplate.user_profiles.queries.getProfileByAuthId,
        {}
      )

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        profile: profile ? {
          avatar: profile.avatar,
          bio: profile.bio,
          role: profile.role,
          isActive: profile.isActive,
          isProfileComplete: profile.isProfileComplete
        } : null
      }
    } catch (error) {
      return null
    }
  }
)

/**
 * Check if current user has specific permission
 */
export const hasPermissionServer = createServerFn({ method: "POST" })
  .inputValidator((data: { permission: string }) => data)
  .handler(async ({ data }) => {
    const { permission } = data
    
    try {
      await getAuthenticatedSession()
      const authenticatedConvex = await getAuthenticatedConvexClient()

      const profile = await authenticatedConvex.query(
        api.lib.boilerplate.user_profiles.queries.getProfileByAuthId,
        {}
      )

      if (!profile || !profile.isActive) return false

      // Admin and superadmin have all permissions
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        return true
      }

      return profile.permissions.includes(permission) || profile.permissions.includes('*')
    } catch (error) {
      return false
    }
  })

/**
 * Get basic auth status without throwing
 */
export const getAuthStatusServer = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const session = await getAuthenticatedSession()
      const authenticatedConvex = await getAuthenticatedConvexClient()

      const profile = await authenticatedConvex.query(
        api.lib.boilerplate.user_profiles.queries.getProfileByAuthId,
        {}
      )

      const isAdmin = (profile?.role === 'admin' || profile?.role === 'superadmin') && profile.isActive

      return {
        isAuthenticated: true,
        isAdmin,
        authUserId: session.user.id
      }
    } catch (error) {
      return {
        isAuthenticated: false,
        isAdmin: false
      }
    }
  }
)