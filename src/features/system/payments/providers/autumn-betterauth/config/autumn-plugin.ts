// src/features/system/payments/providers/autumn-betterauth/config/autumn-plugin.ts
/**
 * Autumn Better Auth Plugin Configuration
 * 
 * Add this to your Better Auth config
 */

import { autumn } from 'autumn-js/better-auth';

/**
 * Autumn plugin for Better Auth
 * 
 * @example
 * import { betterAuth } from 'better-auth';
 * import { autumnBetterAuthConfig } from '@/features/system/payments/providers/autumn-betterauth';
 * 
 * export const auth = betterAuth({
 *   plugins: [autumnBetterAuthConfig],
 * });
 */
export const autumnBetterAuthConfig = autumn({
  customerScope: 'user', // or 'organization' if using org plugin
});

/**
 * For organization-based billing
 */
export const autumnOrganizationConfig = autumn({
  customerScope: 'organization',
});

/**
 * For both user and organization billing
 */
export const autumnDualConfig = autumn({
  customerScope: 'user_and_organization',
});