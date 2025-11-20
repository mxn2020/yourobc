// src/lib/convex-server.ts
import { ConvexHttpClient } from 'convex/browser'
import { auth } from '@/features/system/auth/lib/auth-config'
import { getRequest } from '@tanstack/react-start/server'

/**
 * Get an authenticated Convex HTTP client for server-side queries
 * Fetches JWT token from Better Auth and creates Convex client
 */
export async function getAuthenticatedConvexClient(): Promise<ConvexHttpClient | null> {
  try {
    const request = getRequest()
    
    // Get Better Auth session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return null
    }

    // Get JWT token from Better Auth's /token endpoint
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${baseURL}/api/auth/token`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const jwt = data?.token
    
    if (!jwt) {
      return null
    }

    // Validate JWT format
    const jwtParts = jwt.split('.')
    if (jwtParts.length !== 3) {
      console.error('Invalid JWT format')
      return null
    }

    // Create Convex client with JWT
    const CONVEX_URL = process.env.VITE_CONVEX_URL!
    const convexClient = new ConvexHttpClient(CONVEX_URL)
    convexClient.setAuth(jwt)

    return convexClient
  } catch (error) {
    console.error('Failed to create authenticated Convex client:', error)
    return null
  }
}