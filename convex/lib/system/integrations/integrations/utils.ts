// convex/lib/system/integrations/integrations/utils.ts
// Utility functions for integrations module

declare const process: { env: Record<string, string | undefined> }

import { INTEGRATIONS_CONSTANTS } from './constants';

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
