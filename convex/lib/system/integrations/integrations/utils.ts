// convex/lib/system/integrations/integrations/utils.ts
// Validation functions and utility helpers for integrations module

declare const process: { env: Record<string, string | undefined> }

import { INTEGRATIONS_CONSTANTS } from './constants';
import type {
  ApiKeyData,
  WebhookData,
  OAuthAppData,
  ExternalIntegrationData,
} from './types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate API key data for creation/update
 */
export function validateApiKeyData(
  data: Partial<ApiKeyData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_NAME_MIN) {
      errors.push(`Name must be at least ${INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_NAME_MIN} characters`);
    } else if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_NAME_MAX) {
      errors.push(`Name cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_NAME_MAX} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_DESCRIPTION_MAX) {
      errors.push(`Description cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_DESCRIPTION_MAX} characters`);
    }
  }

  // Validate scopes
  if (data.scopes !== undefined) {
    if (data.scopes.length === 0) {
      errors.push('At least one scope is required');
    } else if (data.scopes.length > INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_SCOPES_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_SCOPES_MAX} scopes`);
    }

    const emptyScopes = data.scopes.filter(scope => !scope.trim());
    if (emptyScopes.length > 0) {
      errors.push('Scopes cannot be empty');
    }
  }

  // Validate allowed IPs
  if (data.allowedIps !== undefined && data.allowedIps.length > 0) {
    if (data.allowedIps.length > INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_ALLOWED_IPS_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.API_KEY_ALLOWED_IPS_MAX} allowed IPs`);
    }
  }

  // Validate rate limit
  if (data.rateLimit !== undefined) {
    if (data.rateLimit.requestsPerMinute <= 0) {
      errors.push('Requests per minute must be greater than 0');
    }
    if (data.rateLimit.requestsPerHour <= 0) {
      errors.push('Requests per hour must be greater than 0');
    }
    if (data.rateLimit.requestsPerDay <= 0) {
      errors.push('Requests per day must be greater than 0');
    }
  }

  return errors;
}

/**
 * Validate webhook data for creation/update
 */
export function validateWebhookData(
  data: Partial<WebhookData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_NAME_MIN) {
      errors.push(`Name must be at least ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_NAME_MIN} characters`);
    } else if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_NAME_MAX) {
      errors.push(`Name cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_NAME_MAX} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_DESCRIPTION_MAX) {
      errors.push(`Description cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_DESCRIPTION_MAX} characters`);
    }
  }

  // Validate URL
  if (data.url !== undefined) {
    const trimmed = data.url.trim();

    if (!trimmed) {
      errors.push('URL is required');
    } else if (!isValidWebhookUrl(trimmed)) {
      errors.push('Invalid webhook URL');
    } else if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_URL_MAX) {
      errors.push(`URL cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_URL_MAX} characters`);
    }
  }

  // Validate events
  if (data.events !== undefined) {
    if (data.events.length === 0) {
      errors.push('At least one event is required');
    } else if (data.events.length > INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_EVENTS_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_EVENTS_MAX} events`);
    }

    const emptyEvents = data.events.filter(event => !event.trim());
    if (emptyEvents.length > 0) {
      errors.push('Events cannot be empty');
    }
  }

  // Validate headers
  if (data.headers !== undefined) {
    const headerCount = Object.keys(data.headers).length;
    if (headerCount > INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_HEADERS_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.WEBHOOK_HEADERS_MAX} headers`);
    }
  }

  // Validate timeout
  if (data.timeout !== undefined && data.timeout <= 0) {
    errors.push('Timeout must be greater than 0');
  }

  // Validate retry config
  if (data.retryConfig !== undefined) {
    if (data.retryConfig.maxAttempts < 0) {
      errors.push('Max attempts cannot be negative');
    }
    if (data.retryConfig.backoffMultiplier <= 0) {
      errors.push('Backoff multiplier must be greater than 0');
    }
    if (data.retryConfig.initialDelay <= 0) {
      errors.push('Initial delay must be greater than 0');
    }
  }

  return errors;
}

/**
 * Validate OAuth app data for creation/update
 */
export function validateOAuthAppData(
  data: Partial<OAuthAppData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_NAME_MIN) {
      errors.push(`Name must be at least ${INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_NAME_MIN} characters`);
    } else if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_NAME_MAX) {
      errors.push(`Name cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_NAME_MAX} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_DESCRIPTION_MAX) {
      errors.push(`Description cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_DESCRIPTION_MAX} characters`);
    }
  }

  // Validate redirect URIs
  if (data.redirectUris !== undefined) {
    if (data.redirectUris.length === 0) {
      errors.push('At least one redirect URI is required');
    } else if (data.redirectUris.length > INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_REDIRECT_URIS_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_REDIRECT_URIS_MAX} redirect URIs`);
    }

    const invalidUris = data.redirectUris.filter(uri => !isValidUrl(uri.trim()));
    if (invalidUris.length > 0) {
      errors.push('All redirect URIs must be valid URLs');
    }
  }

  // Validate scopes
  if (data.scopes !== undefined) {
    if (data.scopes.length === 0) {
      errors.push('At least one scope is required');
    } else if (data.scopes.length > INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_SCOPES_MAX) {
      errors.push(`Cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.OAUTH_APP_SCOPES_MAX} scopes`);
    }
  }

  // Validate grant types
  if (data.grantTypes !== undefined && data.grantTypes.length === 0) {
    errors.push('At least one grant type is required');
  }

  // Validate URLs
  if (data.logoUrl !== undefined && data.logoUrl.trim() && !isValidUrl(data.logoUrl.trim())) {
    errors.push('Invalid logo URL');
  }
  if (data.website !== undefined && data.website.trim() && !isValidUrl(data.website.trim())) {
    errors.push('Invalid website URL');
  }
  if (data.privacyPolicyUrl !== undefined && data.privacyPolicyUrl.trim() && !isValidUrl(data.privacyPolicyUrl.trim())) {
    errors.push('Invalid privacy policy URL');
  }
  if (data.termsOfServiceUrl !== undefined && data.termsOfServiceUrl.trim() && !isValidUrl(data.termsOfServiceUrl.trim())) {
    errors.push('Invalid terms of service URL');
  }

  // Validate rate limit
  if (data.rateLimit !== undefined) {
    if (data.rateLimit.requestsPerMinute <= 0) {
      errors.push('Requests per minute must be greater than 0');
    }
    if (data.rateLimit.requestsPerHour <= 0) {
      errors.push('Requests per hour must be greater than 0');
    }
  }

  return errors;
}

/**
 * Validate external integration data for creation/update
 */
export function validateExternalIntegrationData(
  data: Partial<ExternalIntegrationData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < INTEGRATIONS_CONSTANTS.LIMITS.INTEGRATION_NAME_MIN) {
      errors.push(`Name must be at least ${INTEGRATIONS_CONSTANTS.LIMITS.INTEGRATION_NAME_MIN} characters`);
    } else if (trimmed.length > INTEGRATIONS_CONSTANTS.LIMITS.INTEGRATION_NAME_MAX) {
      errors.push(`Name cannot exceed ${INTEGRATIONS_CONSTANTS.LIMITS.INTEGRATION_NAME_MAX} characters`);
    }
  }

  // Validate provider
  if (data.provider !== undefined) {
    const validProviders = ['zapier', 'make', 'n8n', 'auth0', 'workos'];
    if (!validProviders.includes(data.provider)) {
      errors.push('Invalid provider');
    }
  }

  // Validate type
  if (data.type !== undefined) {
    const validTypes = ['automation', 'auth', 'api', 'webhook'];
    if (!validTypes.includes(data.type)) {
      errors.push('Invalid integration type');
    }
  }

  // Validate config
  if (data.config !== undefined) {
    if (data.config.webhookUrl && !isValidUrl(data.config.webhookUrl.trim())) {
      errors.push('Invalid webhook URL in configuration');
    }
  }

  return errors;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a secure API key
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const prefix = 'sk_' + generateRandomString(8);
  const secret = generateRandomString(INTEGRATIONS_CONSTANTS.CONFIG.API_KEY_LENGTH);
  const key = `${prefix}_${secret}`;
  const hash = hashString(key);

  return { key, prefix, hash };
}

/**
 * Generate a random string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash a string (simple hash for API keys)
 * In production, use a proper crypto library
 */
export function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Verify API key against hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  return hashString(key) === hash;
}

/**
 * Generate webhook secret
 */
export function generateWebhookSecret(): string {
  return generateRandomString(32);
}

/**
 * Generate HMAC signature for webhook
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  // Simple signature - in production use proper HMAC
  return hashString(`${payload}:${secret}`);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return signature === expectedSignature;
}

/**
 * Generate OAuth client credentials
 */
export function generateOAuthCredentials(): {
  clientId: string;
  clientSecret: string;
  clientSecretHash: string;
} {
  const clientId = 'client_' + generateRandomString(16);
  const clientSecret = 'secret_' + generateRandomString(32);
  const clientSecretHash = hashString(clientSecret);

  return { clientId, clientSecret, clientSecretHash };
}

/**
 * Generate OAuth access token
 */
export function generateAccessToken(): string {
  return 'at_' + generateRandomString(INTEGRATIONS_CONSTANTS.CONFIG.OAUTH_TOKEN_LENGTH);
}

/**
 * Generate OAuth refresh token
 */
export function generateRefreshToken(): string {
  return 'rt_' + generateRandomString(INTEGRATIONS_CONSTANTS.CONFIG.OAUTH_TOKEN_LENGTH);
}

/**
 * Generate OAuth authorization code
 */
export function generateAuthorizationCode(): string {
  return 'ac_' + generateRandomString(24);
}

/**
 * Calculate token expiration timestamp
 */
export function calculateTokenExpiration(seconds: number): number {
  return Date.now() + seconds * 1000;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attemptNumber: number,
  initialDelay: number,
  backoffMultiplier: number
): number {
  return initialDelay * Math.pow(backoffMultiplier, attemptNumber - 1);
}

/**
 * Parse scope string to array
 */
export function parseScopes(scopeString: string): string[] {
  return scopeString
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Format scopes array to string
 */
export function formatScopes(scopes: string[]): string {
  return scopes.join(' ');
}

/**
 * Validate scope against allowed scopes
 */
export function validateScope(
  requestedScopes: string[],
  allowedScopes: string[]
): boolean {
  return requestedScopes.every((scope) => allowedScopes.includes(scope));
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${generateRandomString(8)}`;
}

/**
 * Parse IP address (extract real IP from headers)
 */
export function parseIpAddress(headers: Record<string, string>): string {
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['x-real-ip'] ||
    'unknown'
  );
}

/**
 * Sanitize request data for logging
 */
export function sanitizeRequestData(data: any): any {
  if (!data) return data;

  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'creditCard',
    'credit_card',
  ];

  if (typeof data !== 'object') return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeRequestData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate redirect URI
 */
export function isValidRedirectUri(
  redirectUri: string,
  allowedUris: string[]
): boolean {
  return allowedUris.includes(redirectUri);
}

/**
 * Format error response
 */
export function formatErrorResponse(code: string, message: string, details?: any) {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Format success response
 */
export function formatSuccessResponse(data: any, metadata?: any) {
  return {
    success: true,
    data,
    metadata,
  };
}

/**
 * Calculate rate limit window
 */
export function getRateLimitWindow(windowSeconds: number): {
  start: number;
  end: number;
} {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const start = Math.floor(now / windowMs) * windowMs;
  const end = start + windowMs;

  return { start, end };
}

/**
 * Check if IP is allowed
 */
export function isIpAllowed(
  ipAddress: string,
  allowedIps?: string[],
  blockedIps?: string[]
): boolean {
  if (blockedIps && blockedIps.includes(ipAddress)) {
    return false;
  }

  if (allowedIps && allowedIps.length > 0) {
    return allowedIps.includes(ipAddress);
  }

  return true;
}

/**
 * Parse webhook event type from payload
 */
export function parseWebhookEventType(payload: any): string {
  // Try common patterns
  if (payload.event) return payload.event;
  if (payload.type) return payload.type;
  if (payload.event_type) return payload.event_type;

  return 'unknown';
}

/**
 * Build webhook payload
 */
export function buildWebhookPayload(event: string, data: any): string {
  return JSON.stringify({
    event,
    data,
    timestamp: Date.now(),
  });
}

/**
 * Mask API key for display
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return '***';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

/**
 * Validate webhook URL
 */
export function isValidWebhookUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;

  try {
    const parsed = new URL(url);
    // Disallow localhost in production
    if (
      process.env.NODE_ENV === 'production' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
