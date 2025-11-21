// src/features/system/auth/lib/auth-config.generate.ts
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { reactStartCookies } from "better-auth/react-start";
import { PrismaClient } from "@prisma/client";
import { api } from '@/generated/api';
import { AuthSession, AuthUser } from "../types/auth.types";
import { 
  ac, 
  adminRole, 
  analystRole, 
  editorRole, 
  guestRole, 
  moderatorRole, 
  superadminRole, 
  userRole 
} from "./auth-permissions";

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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    
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

  plugins: [
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
    reactStartCookies(),
  ],
});

