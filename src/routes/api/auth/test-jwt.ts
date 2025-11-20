// src/routes/api/auth/test-jwt.ts
import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/features/boilerplate/auth'

export const Route = createFileRoute('/api/auth/test-jwt')({
  server: {
    handlers: {
      GET: handleTestJWT,
    },
  },
})

/**
 * Test endpoint to verify JWT generation and structure
 * Development only - validates Better Auth JWT configuration
 */
async function handleTestJWT({ request }: { request: Request }) {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not available' }, { status: 403 })
  }

  try {
    // Get current session using Better Auth
    const session = await authService.getSession()

    if (!session?.data?.user) {
      return Response.json({
        error: 'Not authenticated',
        message: 'Please log in first to test JWT generation'
      }, { status: 401 })
    }

    const { user, session: sessionData } = session.data

    // Extract JWT token
    const token = sessionData?.token

    if (!token) {
      return Response.json({
        error: 'No JWT token found',
        message: 'JWT is enabled but no token in session',
        user: {
          id: user.id,
          email: user.email,
        },
        debug: {
          hasSession: !!sessionData,
          sessionKeys: sessionData ? Object.keys(sessionData) : [],
        }
      }, { status: 500 })
    }

    // Decode JWT (without verification - just for inspection)
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return Response.json({
        error: 'Invalid JWT format',
        tokenPreview: token.substring(0, 50) + '...',
      }, { status: 500 })
    }

    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )

    // Return comprehensive test results
    return Response.json({
      success: true,
      message: 'JWT is being generated correctly',

      // User info
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },

      // JWT info
      jwt: {
        hasToken: true,
        tokenPreview: token.substring(0, 50) + '...',

        // Decoded claims
        claims: {
          sub: payload.sub, // User ID
          role: payload.role,
          email: payload.email,
          email_verified: payload.email_verified,
          iss: payload.iss, // Issuer
          aud: payload.aud, // Audience (Convex URL)
          exp: payload.exp, // Expiration
          iat: payload.iat, // Issued at
        },

        // Validation
        validation: {
          hasSubject: !!payload.sub,
          subjectMatchesUserId: payload.sub === user.id,
          hasIssuer: !!payload.iss,
          hasAudience: !!payload.aud,
          hasExpiration: !!payload.exp,
          expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
          isExpired: payload.exp ? Date.now() / 1000 > payload.exp : null,
        }
      },

      // Session info
      session: {
        id: sessionData.id,
        expiresAt: sessionData.expiresAt,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
      },

      // Next steps
      nextSteps: [
        'Test Convex integration: GET /api/auth/test-convex',
        'Test from frontend: Visit /test/auth',
        'Check browser console for Convex auth state logs'
      ]
    })

  } catch (error) {
    console.error('JWT test error:', error)
    return Response.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
