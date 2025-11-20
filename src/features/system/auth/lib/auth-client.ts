// src/features/boilerplate/lib/auth-client.ts

import { createAuthClient } from "better-auth/react"
import { adminClient, jwtClient } from "better-auth/client/plugins"
import {
  ac,
  adminRole,
  analystRole,
  editorRole,
  guestRole,
  moderatorRole,
  superadminRole,
  userRole
} from "./auth-permissions"

// Single auth client instance - singleton pattern
const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production'
    ? process.env.BETTER_AUTH_URL || "https://your-domain.com"
    : "http://localhost:3000",
  plugins: [
    jwtClient(), // JWT plugin for getting JWT tokens
    adminClient({
      ac, // Pass the access controller
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        user: userRole,
        moderator: moderatorRole,
        editor: editorRole,
        analyst: analystRole,
        guest: guestRole,
      }
    })
  ]
})

// Export the singleton instance
export { authClient }

// Re-export all auth client functions for convenience
export const useSession = authClient.useSession
export const signOut = authClient.signOut

// Export email auth functions
export const signInEmail = authClient.signIn.email
export const signUpEmail = authClient.signUp.email

// Export social auth functions  
export const signInSocial = authClient.signIn.social

// Export main sign in/up functions
export const signIn = authClient.signIn
export const signUp = authClient.signUp

// Export for external usage
export const getSession = authClient.getSession

// Export JWT token function (provided by jwtClient plugin)
export const getToken = authClient.token

// Export admin functions
export const adminAPI = authClient.admin