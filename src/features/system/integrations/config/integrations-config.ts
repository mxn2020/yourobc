// src/features/system/integrations/config/integrations-config.ts

import { IntegrationProviderType } from "../types";
import { getEnv, getEnvWithDefault } from '../../_shared/env-utils';

/**
 * Integrations configuration
 */
export const INTEGRATIONS_CONFIG = {
  // Default provider
  DEFAULT_PROVIDER: "internal" as IntegrationProviderType,

  // API Key configuration
  API_KEY: {
    PREFIX: "sk_",
    LENGTH: 32,
    DEFAULT_EXPIRY_DAYS: 365,
    MAX_KEYS_PER_USER: 10,
  },

  // Rate limiting defaults
  RATE_LIMIT: {
    DEFAULT_PER_MINUTE: 60,
    DEFAULT_PER_HOUR: 1000,
    DEFAULT_PER_DAY: 10000,
    BURST_MULTIPLIER: 1.5,
  },

  // Webhook configuration
  WEBHOOK: {
    MAX_WEBHOOKS_PER_USER: 20,
    TIMEOUT_MS: 30000,
    MAX_RETRIES: 5,
    INITIAL_RETRY_DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
    MAX_RETRY_DELAY_MS: 3600000, // 1 hour
    SIGNATURE_ALGORITHM: "sha256",
  },

  // OAuth configuration
  OAUTH: {
    MAX_APPS_PER_USER: 5,
    AUTHORIZATION_CODE_EXPIRY_SECONDS: 600, // 10 minutes
    ACCESS_TOKEN_EXPIRY_SECONDS: 3600, // 1 hour
    REFRESH_TOKEN_EXPIRY_SECONDS: 2592000, // 30 days
    MAX_REDIRECT_URIS: 10,
  },

  // Request logging
  LOGGING: {
    RETENTION_DAYS: 30,
    MAX_LOGS_PER_QUERY: 1000,
    LOG_REQUEST_BODY: true,
    LOG_RESPONSE_BODY: false,
  },

  // External integrations
  EXTERNAL: {
    MAX_INTEGRATIONS_PER_USER: 50,
    SYNC_INTERVAL_MINUTES: 15,
    ZAPIER: {
      ENABLED: false,
      API_URL: "https://zapier.com/api/v1",
    },
    MAKE: {
      ENABLED: false,
      API_URL: "https://www.make.com/api/v1",
    },
    N8N: {
      ENABLED: false,
      API_URL: getEnvWithDefault('N8N_API_URL', ''),
    },
  },

  // Security
  SECURITY: {
    REQUIRE_HTTPS: true,
    HMAC_SECRET_LENGTH: 32,
    IP_WHITELIST_ENABLED: false,
    ALLOWED_ORIGINS: ["*"], // Configure based on environment
  },

  // UI Configuration
  UI: {
    DEFAULT_LOGS_LIMIT: 100,
    DEFAULT_EVENTS_LIMIT: 50,
    REFRESH_INTERVAL_MS: 30000,
    SHOW_SENSITIVE_DATA: false, // Don't show API keys, secrets in UI
  },
} as const;

/**
 * Get the integration provider from environment or config
 */
export function getIntegrationProvider(): IntegrationProviderType {
  // Check environment variable
  const envProvider = getEnv('INTEGRATIONS_PROVIDER');
  if (
    envProvider === "internal" ||
    envProvider === "zapier" ||
    envProvider === "make" ||
    envProvider === "n8n"
  ) {
    return envProvider;
  }

  // Default to internal provider
  return INTEGRATIONS_CONFIG.DEFAULT_PROVIDER;
}

/**
 * Check if a specific external integration is enabled
 */
export function isExternalIntegrationEnabled(
  platform: "zapier" | "make" | "n8n"
): boolean {
  return INTEGRATIONS_CONFIG.EXTERNAL[platform.toUpperCase() as "ZAPIER" | "MAKE" | "N8N"].ENABLED;
}

/**
 * Get rate limit for a specific tier
 */
export function getRateLimitForTier(
  tier: "free" | "pro" | "enterprise"
): {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
} {
  switch (tier) {
    case "free":
      return {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
      };
    case "pro":
      return {
        requestsPerMinute: INTEGRATIONS_CONFIG.RATE_LIMIT.DEFAULT_PER_MINUTE,
        requestsPerHour: INTEGRATIONS_CONFIG.RATE_LIMIT.DEFAULT_PER_HOUR,
        requestsPerDay: INTEGRATIONS_CONFIG.RATE_LIMIT.DEFAULT_PER_DAY,
      };
    case "enterprise":
      return {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000,
      };
  }
}

/**
 * Get webhook retry configuration
 */
export function getWebhookRetryConfig() {
  return {
    maxRetries: INTEGRATIONS_CONFIG.WEBHOOK.MAX_RETRIES,
    initialDelay: INTEGRATIONS_CONFIG.WEBHOOK.INITIAL_RETRY_DELAY_MS,
    backoffMultiplier: INTEGRATIONS_CONFIG.WEBHOOK.BACKOFF_MULTIPLIER,
    maxDelay: INTEGRATIONS_CONFIG.WEBHOOK.MAX_RETRY_DELAY_MS,
  };
}

/**
 * Check if webhook URL is valid
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Require HTTPS in production
    if (INTEGRATIONS_CONFIG.SECURITY.REQUIRE_HTTPS && parsed.protocol !== "https:") {
      return false;
    }

    // Don't allow localhost/private IPs in production
    const hostname = parsed.hostname;
    if (
      getEnv('NODE_ENV') === "production" &&
      (hostname === "localhost" ||
        hostname.startsWith("127.") ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172."))
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if redirect URI is valid for OAuth
 */
export function isValidRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri);

    // Allow http for localhost in development
    if (parsed.hostname === "localhost" && getEnv('NODE_ENV') === "development") {
      return true;
    }

    // Require HTTPS for production
    if (INTEGRATIONS_CONFIG.SECURITY.REQUIRE_HTTPS && parsed.protocol !== "https:") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize API key for display (show only prefix)
 */
export function sanitizeApiKey(key: string): string {
  if (!key || key.length < 8) return "***";
  return `${key.substring(0, 8)}...`;
}

/**
 * Format rate limit for display
 */
export function formatRateLimit(rateLimit: {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}): string {
  return `${rateLimit.requestsPerMinute}/min, ${rateLimit.requestsPerHour}/hour, ${rateLimit.requestsPerDay}/day`;
}
