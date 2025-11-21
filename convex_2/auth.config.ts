// convex/auth.config.ts
import { AuthConfig } from 'convex/server'

// For local development, use localhost (resolves to both IPv4 and IPv6)
// For production, this should be your production domain
const BETTER_AUTH_URL = 'http://localhost:3000'

export default {
  providers: [
    {
      type: 'customJwt' as const,
      issuer: 'http://localhost:3000', // JWT issuer must match what's in the JWT
      applicationID: 'better-auth',
      // Better Auth exposes JWKS at /api/auth/jwks - use IPv6 for local dev
      jwks: `${BETTER_AUTH_URL}/api/auth/jwks`,
      algorithm: 'ES256' as const, // Must match the algorithm in Better Auth JWT plugin
    },
  ],
} satisfies AuthConfig;
