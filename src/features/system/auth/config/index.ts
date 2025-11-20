// src/features/system/auth/config/index.ts
/**
 * Authentication Configuration
 *
 * Manages authentication providers, session settings, and security options
 * Integrates with Better Auth library
 */

import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue, getEnvAsNumber } from '../../_shared/env-utils';

// ============================================
// 1. TYPES & INTERFACES
// ============================================

export type AuthProviderType = 'email' | 'google' | 'apple' | 'twitter' | 'github';

export interface AuthProviderConfig {
  enabled: boolean;
  name: string;
  clientId?: string;
  requiresVerification?: boolean;
}

export interface AuthSettings {
  sessionDuration: number; // in seconds
  requireEmailVerification: boolean;
  allowSignup: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // in seconds
  twoFactorEnabled: boolean;
}

export interface AuthSecuritySettings {
  rateLimiting: boolean;
  ipWhitelist: string[];
  blockedDomains: string[];
  sessionCookieSecure: boolean;
  sessionCookieSameSite: 'strict' | 'lax' | 'none';
}

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================

export const AUTH_ENV = {
  // Feature toggle
  ENABLE_AUTH: envIsNotFalse('VITE_ENABLE_AUTH'),

  // Session settings
  SESSION_DURATION: getEnvAsNumber('VITE_AUTH_SESSION_DURATION', 604800), // 7 days default

  // Email/Password settings
  REQUIRE_EMAIL_VERIFICATION: envIsNotFalse('VITE_AUTH_REQUIRE_EMAIL_VERIFICATION'),
  ALLOW_SIGNUP: envIsNotFalse('VITE_AUTH_ALLOW_SIGNUP'),
  PASSWORD_MIN_LENGTH: getEnvAsNumber('VITE_AUTH_PASSWORD_MIN_LENGTH', 8),

  // Security settings
  MAX_LOGIN_ATTEMPTS: getEnvAsNumber('VITE_AUTH_MAX_LOGIN_ATTEMPTS', 5),
  LOCKOUT_DURATION: getEnvAsNumber('VITE_AUTH_LOCKOUT_DURATION', 900), // 15 minutes
  TWO_FACTOR_ENABLED: envIsTrue('VITE_AUTH_2FA_ENABLED'),

  // Provider credentials
  GOOGLE_CLIENT_ID: getEnvWithDefault('VITE_GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnvWithDefault('GOOGLE_CLIENT_SECRET', ''),

  APPLE_CLIENT_ID: getEnvWithDefault('VITE_APPLE_CLIENT_ID', ''),
  APPLE_CLIENT_SECRET: getEnvWithDefault('APPLE_CLIENT_SECRET', ''),

  TWITTER_CLIENT_ID: getEnvWithDefault('VITE_TWITTER_CLIENT_ID', ''),
  TWITTER_CLIENT_SECRET: getEnvWithDefault('TWITTER_CLIENT_SECRET', ''),

  GITHUB_CLIENT_ID: getEnvWithDefault('VITE_GITHUB_CLIENT_ID', ''),
  GITHUB_CLIENT_SECRET: getEnvWithDefault('GITHUB_CLIENT_SECRET', ''),

  // Better Auth settings
  BETTER_AUTH_SECRET: getEnvWithDefault('BETTER_AUTH_SECRET', ''),
  BETTER_AUTH_URL: getEnvWithDefault('VITE_BETTER_AUTH_URL', 'http://localhost:3000'),
} as const;

// ============================================
// 3. PROVIDER CONFIGURATIONS
// ============================================

export const AUTH_PROVIDERS: Record<AuthProviderType, AuthProviderConfig> = {
  email: {
    enabled: true,
    name: 'Email/Password',
    requiresVerification: AUTH_ENV.REQUIRE_EMAIL_VERIFICATION,
  },
  google: {
    enabled: Boolean(AUTH_ENV.GOOGLE_CLIENT_ID && AUTH_ENV.GOOGLE_CLIENT_SECRET),
    name: 'Google',
    clientId: AUTH_ENV.GOOGLE_CLIENT_ID,
  },
  apple: {
    enabled: Boolean(AUTH_ENV.APPLE_CLIENT_ID && AUTH_ENV.APPLE_CLIENT_SECRET),
    name: 'Apple',
    clientId: AUTH_ENV.APPLE_CLIENT_ID,
  },
  twitter: {
    enabled: Boolean(AUTH_ENV.TWITTER_CLIENT_ID && AUTH_ENV.TWITTER_CLIENT_SECRET),
    name: 'Twitter',
    clientId: AUTH_ENV.TWITTER_CLIENT_ID,
  },
  github: {
    enabled: Boolean(AUTH_ENV.GITHUB_CLIENT_ID && AUTH_ENV.GITHUB_CLIENT_SECRET),
    name: 'GitHub',
    clientId: AUTH_ENV.GITHUB_CLIENT_ID,
  },
};

// ============================================
// 4. MAIN CONFIGURATION OBJECT
// ============================================

export const AUTH_CONFIG = {
  // Feature metadata
  name: 'Authentication',
  version: '1.0.0',
  enabled: AUTH_ENV.ENABLE_AUTH,

  // Better Auth integration
  betterAuth: {
    url: AUTH_ENV.BETTER_AUTH_URL,
    secret: AUTH_ENV.BETTER_AUTH_SECRET,
  },

  // Providers
  providers: AUTH_PROVIDERS,
  enabledProviders: Object.entries(AUTH_PROVIDERS)
    .filter(([_, config]) => config.enabled)
    .map(([type, _]) => type as AuthProviderType),

  // Authentication settings
  settings: {
    sessionDuration: AUTH_ENV.SESSION_DURATION,
    requireEmailVerification: AUTH_ENV.REQUIRE_EMAIL_VERIFICATION,
    allowSignup: AUTH_ENV.ALLOW_SIGNUP,
    passwordMinLength: AUTH_ENV.PASSWORD_MIN_LENGTH,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    maxLoginAttempts: AUTH_ENV.MAX_LOGIN_ATTEMPTS,
    lockoutDuration: AUTH_ENV.LOCKOUT_DURATION,
    twoFactorEnabled: AUTH_ENV.TWO_FACTOR_ENABLED,
  } as AuthSettings,

  // Security settings
  security: {
    rateLimiting: true,
    ipWhitelist: [],
    blockedDomains: ['tempmail.com', 'guerrillamail.com', 'throwaway.email'],
    sessionCookieSecure: envIsTrue('PROD'),
    sessionCookieSameSite: 'lax' as const,
  } as AuthSecuritySettings,
} as const;

// ============================================
// 5. VALIDATION FUNCTION
// ============================================

export function validateAuthConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if auth is enabled
  if (!AUTH_ENV.ENABLE_AUTH) {
    return { valid: true, errors: [], warnings: ['Authentication is disabled'] };
  }

  // Validate Better Auth secret
  if (!AUTH_ENV.BETTER_AUTH_SECRET || AUTH_ENV.BETTER_AUTH_SECRET === 'your-secret-here') {
    errors.push('BETTER_AUTH_SECRET must be set to a secure random value');
  }

  // Validate Better Auth URL
  if (!AUTH_ENV.BETTER_AUTH_URL) {
    errors.push('VITE_BETTER_AUTH_URL must be set');
  }

  // Check if at least one provider is enabled
  const hasEnabledProvider = Object.values(AUTH_PROVIDERS).some(p => p.enabled);
  if (!hasEnabledProvider) {
    errors.push('At least one authentication provider must be enabled');
  }

  // Validate email provider if enabled
  if (AUTH_PROVIDERS.email.enabled) {
    if (AUTH_ENV.REQUIRE_EMAIL_VERIFICATION && !getEnv('VITE_EMAIL_FROM')) {
      warnings.push('Email verification is enabled but email sending is not configured');
    }
  }

  // Validate OAuth providers
  const oauthProviders: AuthProviderType[] = ['google', 'apple', 'twitter', 'github'];
  oauthProviders.forEach(provider => {
    if (AUTH_PROVIDERS[provider].enabled) {
      const envPrefix = provider.toUpperCase();
      if (!AUTH_ENV[`${envPrefix}_CLIENT_ID` as keyof typeof AUTH_ENV]) {
        errors.push(`${provider} provider is missing CLIENT_ID`);
      }
      if (!AUTH_ENV[`${envPrefix}_CLIENT_SECRET` as keyof typeof AUTH_ENV]) {
        errors.push(`${provider} provider is missing CLIENT_SECRET`);
      }
    }
  });

  // Validate password settings
  if (AUTH_ENV.PASSWORD_MIN_LENGTH < 6) {
    warnings.push('Password minimum length is less than 6, this is not recommended');
  }

  // Validate session duration
  if (AUTH_ENV.SESSION_DURATION < 3600) {
    warnings.push('Session duration is less than 1 hour, users may experience frequent logouts');
  }

  // Validate 2FA settings
  if (AUTH_ENV.TWO_FACTOR_ENABLED) {
    warnings.push('2FA is enabled - ensure you have a 2FA provider configured');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Check if authentication is enabled
 */
export function isAuthEnabled(): boolean {
  return AUTH_ENV.ENABLE_AUTH;
}

/**
 * Check if a specific provider is enabled
 */
export function isProviderEnabled(provider: AuthProviderType): boolean {
  return AUTH_PROVIDERS[provider]?.enabled || false;
}

/**
 * Get list of enabled providers
 */
export function getEnabledProviders(): AuthProviderType[] {
  return AUTH_CONFIG.enabledProviders;
}

/**
 * Check if email/password auth is enabled
 */
export function isEmailAuthEnabled(): boolean {
  return isProviderEnabled('email');
}

/**
 * Check if any OAuth provider is enabled
 */
export function isOAuthEnabled(): boolean {
  return AUTH_CONFIG.enabledProviders.some(p => p !== 'email');
}

/**
 * Get auth setting with type safety
 */
export function getAuthSetting<K extends keyof AuthSettings>(
  key: K
): AuthSettings[K] {
  return AUTH_CONFIG.settings[key];
}

/**
 * Validate password against configured rules
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const settings = AUTH_CONFIG.settings;

  if (password.length < settings.passwordMinLength) {
    errors.push(`Password must be at least ${settings.passwordMinLength} characters`);
  }

  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (settings.passwordRequireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (settings.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if email domain is blocked
 */
export function isEmailDomainBlocked(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  return AUTH_CONFIG.security.blockedDomains.some(blocked =>
    domain === blocked.toLowerCase() || domain.endsWith(`.${blocked.toLowerCase()}`)
  );
}

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default AUTH_CONFIG;
