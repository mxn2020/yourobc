// convex/test/authTest.ts
import { query } from '@/generated/server';
import { getAuthUserIdFromContext, getCurrentUser } from '@/shared/auth.helper';

declare const process: { env: Record<string, string | undefined> }

/**
 * Test JWT authentication flow in Convex
 *
 * This query validates:
 * 1. JWT token is properly passed from frontend to Convex
 * 2. getAuthUserIdFromContext() can extract user ID from JWT
 * 3. getCurrentUser() can fetch user profile using JWT-derived ID
 * 4. User identity, profile, and role are all correct
 *
 * Development only - used to validate Better Auth JWT integration
 *
 * @example
 * // From frontend:
 * const result = useQuery(api.test.authTest.testJWTAuth);
 *
 * // From browser console:
 * const result = await window.convex.query(api.test.authTest.testJWTAuth);
 */
export const testJWTAuth = query({
  handler: async (ctx) => {
    try {
      // Test 1: Can we extract authUserId from JWT?
      const authUserId = await getAuthUserIdFromContext(ctx);

      // Test 2: Can we get the full user profile?
      const user = await getCurrentUser(ctx);

      // Test 3: Check the raw identity from JWT
      const identity = await ctx.auth.getUserIdentity();

      // Determine status and message
      const isAuthenticated = !!authUserId;
      const profileExists = !!user;

      let message: string;
      let status: 'success' | 'warning' | 'error';

      if (authUserId && user) {
        message = '✅ JWT authentication working perfectly!';
        status = 'success';
      } else if (authUserId && !user) {
        message = '⚠️ JWT received but profile not found - check sync';
        status = 'warning';
      } else {
        message = '❌ No JWT token - user not authenticated';
        status = 'error';
      }

      return {
        success: isAuthenticated,
        status,
        message,
        timestamp: Date.now(),

        // From JWT
        jwt: {
          authUserId, // Should be a string
          subject: identity?.subject,
          email: identity?.email,
          issuer: identity?.issuer,
          // Note: Better Auth doesn't include 'name' in JWT by default
        },

        // From Convex DB
        profile: user ? {
          profileId: user._id, // Should be Id<'userProfiles'>
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user._creationTime,
        } : null,

        // Status checks
        checks: {
          hasJWT: !!identity,
          hasAuthUserId: !!authUserId,
          hasUserProfile: !!user,
          authUserIdMatchesProfile: user ? user.authUserId === authUserId : null,
          emailMatches: user && identity ? user.email === identity.email : null,
        },

        // Debug info
        debug: {
          identitySubject: identity?.subject,
          identityTokenIdentifier: identity?.tokenIdentifier,
          profileAuthUserId: user?.authUserId,
        }
      };

    } catch (error) {
      // Return error details for debugging
      return {
        success: false,
        status: 'error' as const,
        message: '❌ Test failed with error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Error',
          stack: process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
        },
        timestamp: Date.now(),
      };
    }
  },
});

/**
 * Test permission checking with JWT auth
 *
 * Validates that permission checks work correctly with JWT-based authentication
 */
export const testJWTPermissions = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUser(ctx);

      if (!user) {
        return {
          success: false,
          message: 'Not authenticated',
          permissions: null,
        };
      }

      return {
        success: true,
        message: 'Permissions retrieved successfully',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        permissions: user.permissions || [],
        hasAllPermissions: user.permissions?.includes('*') || false,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
