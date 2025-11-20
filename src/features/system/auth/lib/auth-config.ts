// src/features/system/lib/auth-config.ts - IN DEVELOPMENT
import { betterAuth } from "better-auth";
import { admin, jwt } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { reactStartCookies } from "better-auth/react-start";
import { autumn } from "autumn-js/better-auth";
import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AuthSession, AuthUser, AuthUserId } from "../types/auth.types";
import {
  ac,
  adminRole,
  analystRole,
  editorRole,
  guestRole,
  moderatorRole,
  superadminRole,
  userRole,
} from "./auth-permissions";

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  jwt: {
    enabled: true,
    issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    audience: "better-auth", // Must match applicationID in convex/auth.config.ts
    expiresIn: 60 * 60 * 24 * 7, // 7 days - match session expiration

    // Explicitly customize JWT claims
    customize: (user: any) => {
      return {
        sub: user.id, // User ID in subject claim (what Convex reads)
        // Optional: Add other useful claims
        role: user.role,
        email: user.email,
        email_verified: user.emailVerified,
        // Don't add sensitive data like passwords or tokens!
      }
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour

    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`Reset password for ${user.email}: ${url}`);
      console.log(`Token: ${token}`);
      // TODO: Implement actual email sending (e.g., with Resend, SendGrid, etc.)
    },

    onPasswordReset: async ({ user }, request) => {
      console.log(`Password reset completed for user ${user.id}`);
      // TODO: Log security event, notify user of password change
      await syncUserToConvex(user, 'sync');
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      enabled: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      enabled: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    freshAge: 60 * 60, // 60 minutes
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
        input: false,
      },
    }
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await syncUserToConvex(user, 'create')
        },
      },
      update: {
        after: async (user) => {
          await syncUserToConvex(user, 'update')
        },
      },
    },
    session: {
      create: {
        after: async (session, ctx) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId }
          });

          // Session from better-auth has userId as string (Better Auth user ID)
          const authSession: AuthSession = {
            ...session,
            userId: session.userId, // Already a string from better-auth
          } as AuthSession

          if (user) {
            await syncUserToConvex(user, 'sync')
            await trackUserLogin(authSession);
          }
        },
      },
    },
  },

  plugins: [
    jwt({
      // JWT plugin configuration - nested under 'jwt' property
      jwt: {
        issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        audience: "better-auth", // Must match applicationID in convex/auth.config.ts
        expirationTime: "7d", // 7 days to match session expiration
        // Custom JWT payload claims
        definePayload: ({ user }: any) => ({
          role: user.role,
          email: user.email,
          email_verified: user.emailVerified,
        }),
      },
      // JWKS key configuration - Convex only supports RS256 and ES256
      jwks: {
        keyPairConfig: {
          alg: "ES256", // Change from EdDSA to ES256 for Convex compatibility
          // Note: crv is automatically set for ES256, don't specify it
        }
      }
    }),
    admin({
      ac, // Pass the access controller
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        user: userRole,
        moderator: moderatorRole,
        editor: editorRole,
        analyst: analystRole,
        guest: guestRole,
      },
      defaultRole: 'user',
      adminRoles: ['admin', 'superadmin'],
      defaultBanReason: "Terms of service violation",
      defaultBanExpiresIn: 60 * 60 * 24 * 30, // 30 days default
      bannedUserMessage: "Your account has been suspended. Contact support for assistance.",
    }),
    // Only include Autumn plugin if AUTUMN_SECRET_KEY is configured
    ...(process.env.AUTUMN_SECRET_KEY ? [
      autumn({
        customerScope: "user", // Make each user a customer (can be changed to "organization" if needed)
      })
    ] : []),
    reactStartCookies(),
  ],
});

/**
 * Sync user from Better Auth to Convex user profile
 * @param user - AuthUser from better-auth
 * @param action - Type of sync operation
 */
async function syncUserToConvex(user: AuthUser, action: 'create' | 'update' | 'sync' = 'sync') {
  const userId: AuthUserId = user.id; // Better Auth ID (string)

  try {
    // syncProfileFromAuth mutation handles both creating and updating profiles
    await convex.mutation(api.lib.system.user_profiles.mutations.syncProfileFromAuth, {
      authUserId: userId,
      email: user.email,
      name: user.name || undefined,
      avatar: user.image || undefined,
      isEmailVerified: user.emailVerified,
      role: user.role || undefined,
      banned: user.banned || undefined,
      banReason: user.banReason || undefined,
      banExpires: user.banExpires ? user.banExpires.getTime() : undefined,
      authCreatedAt: user.createdAt.getTime(),
      authUpdatedAt: user.updatedAt.getTime(),
    });
    console.log(`${action === 'create' ? 'Created' : action === 'update' ? 'Updated' : 'Synced'} user ${userId} to Convex`);
  } catch (error) {
    console.error(`Failed to ${action} user ${userId} in Convex:`, error);

    if (process.env.NODE_ENV === 'development') {
      console.warn('Profile sync failed - this is common during development when Convex DB is reset');
    }
  }
}

/**
 * Track user login activity in Convex
 * @param session - AuthSession with userId (authUserId - string)
 */
async function trackUserLogin(session: AuthSession) {
  try {
    const authUserId: AuthUserId = session.userId; // session.userId is a string (Better Auth ID)
    await convex.mutation(api.lib.system.user_profiles.mutations.updateActivity, {
      activityType: 'login',
      metadata: {
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
      },
    });
    console.log(`Tracked login for user ${authUserId}`);
  } catch (error) {
    console.error(`Failed to track login for user ${session.userId}:`, error);
  }
}

export async function recoverAllUsers() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This function is only available in development');
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log(`Found ${users.length} users in Neon database`);

    const authUserIds = users.map(u => u.id);
    const missingCheck = await convex.query(api.lib.system.user_profiles.recovery.findMissingProfiles, {
      authUserIds
    });

    console.log(`Missing profiles: ${missingCheck.missing}/${missingCheck.total}`);

    if (missingCheck.missing > 0) {
      const usersToRecover = users.filter(u => missingCheck.missingIds.includes(u.id));

      if (usersToRecover.length === 0) {
        throw new Error('No users found to recover despite missing profiles detected');
      }

      const results = await convex.mutation(api.lib.system.user_profiles.recovery.batchRecoverProfiles, {
        users: usersToRecover.map(u => ({
          authUserId: u.id,
          email: u.email,
          name: u.name || undefined,
          avatar: u.image || undefined,
          isEmailVerified: u.emailVerified,
          role: u.role,
        }))
      });

      const successful = results.filter(r => r.success).length;
      console.log(`Successfully recovered ${successful}/${results.length} profiles`);

      return {
        totalUsers: users.length,
        recovered: successful,
        failed: results.length - successful,
        results
      };
    }

    return {
      totalUsers: users.length,
      recovered: 0,
      failed: 0,
      message: 'All profiles already exist'
    };
  } catch (error) {
    console.error('Failed to recover users:', error);
    throw error;
  }
}