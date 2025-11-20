// src/routes/api/auth/test-convex.ts
import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/features/system/auth'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/api/auth/test-convex')({
  server: {
    handlers: {
      GET: handleTestConvex,
    },
  },
})

/**
 * Test endpoint to verify Convex JWT authentication
 * Development only - validates Better Auth JWT → Convex integration
 */
async function handleTestConvex({ request }: { request: Request }) {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Not available' }, { status: 403 })
  }

  try {
    // Get current session
    const session = await authService.getSession()

    if (!session?.data?.user) {
      return Response.json({
        error: 'Not authenticated',
        message: 'Please log in first to test Convex JWT'
      }, { status: 401 })
    }

    const { user, session: sessionData } = session.data
    const token = sessionData?.token

    if (!token) {
      return Response.json({
        error: 'No JWT token',
        message: 'Session exists but no JWT token found'
      }, { status: 500 })
    }

    // Create Convex client with JWT auth
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)
    convex.setAuth(token)

    // Call the test query
    const result = await convex.query(api.test.authTest.testJWTAuth)

    // Test permissions query too
    const permissionsResult = await convex.query(api.test.authTest.testJWTPermissions)

    // Return comprehensive results
    return Response.json({
      success: result.success,
      message: 'Convex JWT authentication test completed',

      // Better Auth info
      betterAuth: {
        userId: user.id,
        email: user.email,
        role: user.role,
        hasToken: !!token,
      },

      // Convex test results
      convexTest: result,

      // Permissions test
      permissions: permissionsResult,

      // Overall validation
      validation: {
        jwtGenerated: !!token,
        jwtPassedToConvex: result.success,
        userIdExtracted: !!result.jwt?.authUserId,
        profileFound: !!result.profile,
        authUserIdMatches: result.checks?.authUserIdMatchesProfile ?? false,
        emailMatches: result.checks?.emailMatches ?? false,
      },

      // Status summary
      summary: {
        status: result.status,
        allChecksPass:
          !!token &&
          result.success &&
          result.checks?.hasAuthUserId &&
          result.checks?.hasUserProfile &&
          result.checks?.authUserIdMatchesProfile &&
          result.checks?.emailMatches,
      },

      // Next steps
      nextSteps: result.success
        ? [
            '✅ JWT auth is working!',
            'Visit /test/auth for interactive testing',
            'Ready to migrate Convex mutations/queries'
          ]
        : [
            '❌ Issues detected - see convexTest.message',
            'Check Convex deployment is running',
            'Verify environment variables',
            'Check browser console for errors'
          ]
    })

  } catch (error) {
    console.error('Convex test error:', error)

    // Provide detailed error info
    return Response.json({
      error: 'Convex test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorName: error instanceof Error ? error.name : 'Error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.stack
          : undefined,
      },
      troubleshooting: [
        'Check VITE_CONVEX_URL is set correctly',
        'Verify Convex deployment is running (npx convex dev)',
        'Check convex/auth.config.ts is configured',
        'Ensure user is logged in with active session',
        'Check browser console for CORS errors'
      ]
    }, { status: 500 })
  }
}
