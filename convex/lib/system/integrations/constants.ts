// convex/lib/boilerplate/integrations/constants.ts

/**
 * Integrations Configuration Constants
 */

export const INTEGRATIONS_CONFIG = {
  // API Keys
  API_KEY_PREFIX_LENGTH: 8,
  API_KEY_LENGTH: 32,
  API_KEY_ALGORITHM: 'sha256' as const,

  // Rate Limits (default)
  DEFAULT_RATE_LIMITS: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
    REQUESTS_PER_DAY: 10000,
  },

  // Webhooks
  WEBHOOK_TIMEOUT_MS: 10000, // 10 seconds
  WEBHOOK_MAX_RETRIES: 3,
  WEBHOOK_INITIAL_RETRY_DELAY_MS: 1000, // 1 second
  WEBHOOK_RETRY_BACKOFF_MULTIPLIER: 2,
  WEBHOOK_SIGNATURE_ALGORITHM: 'sha256' as const,
  WEBHOOK_SIGNATURE_HEADER: 'X-Webhook-Signature',
  WEBHOOK_EVENT_HEADER: 'X-Webhook-Event',
  WEBHOOK_ID_HEADER: 'X-Webhook-ID',

  // OAuth
  OAUTH_ACCESS_TOKEN_EXPIRATION_SECONDS: 3600, // 1 hour
  OAUTH_REFRESH_TOKEN_EXPIRATION_SECONDS: 2592000, // 30 days
  OAUTH_AUTHORIZATION_CODE_EXPIRATION_SECONDS: 600, // 10 minutes
  OAUTH_TOKEN_LENGTH: 32,

  // Request Logging
  LOG_RETENTION_DAYS: 90,
  MAX_REQUEST_BODY_SIZE: 1024 * 1024, // 1MB
  MAX_RESPONSE_BODY_SIZE: 1024 * 1024, // 1MB

  // External Integrations
  SYNC_INTERVAL_MS: 300000, // 5 minutes
  CONNECTION_TIMEOUT_MS: 30000, // 30 seconds
} as const;

/**
 * API Error Codes
 */
export const API_ERROR_CODES = {
  // Authentication Errors
  INVALID_API_KEY: 'invalid_api_key',
  API_KEY_EXPIRED: 'api_key_expired',
  API_KEY_REVOKED: 'api_key_revoked',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_EXPIRED: 'token_expired',
  UNAUTHORIZED: 'unauthorized',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',

  // Validation Errors
  INVALID_REQUEST: 'invalid_request',
  MISSING_PARAMETER: 'missing_parameter',
  INVALID_PARAMETER: 'invalid_parameter',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'resource_not_found',
  RESOURCE_ALREADY_EXISTS: 'resource_already_exists',
  RESOURCE_DELETED: 'resource_deleted',

  // Permission Errors
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  FORBIDDEN: 'forbidden',

  // Server Errors
  INTERNAL_ERROR: 'internal_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout',

  // Webhook Errors
  WEBHOOK_DELIVERY_FAILED: 'webhook_delivery_failed',
  WEBHOOK_TIMEOUT: 'webhook_timeout',
  INVALID_WEBHOOK_SIGNATURE: 'invalid_webhook_signature',

  // OAuth Errors
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
  INVALID_SCOPE: 'invalid_scope',
  REDIRECT_URI_MISMATCH: 'redirect_uri_mismatch',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Default Scopes by Resource
 */
export const DEFAULT_SCOPES_BY_RESOURCE = {
  users: ['read:users', 'write:users'],
  projects: ['read:projects', 'write:projects'],
  tasks: ['read:tasks', 'write:tasks'],
  posts: ['read:posts', 'write:posts'],
  analytics: ['read:analytics'],
} as const;

/**
 * Webhook Retry Schedule
 */
export const WEBHOOK_RETRY_SCHEDULE = [
  1000, // 1 second
  5000, // 5 seconds
  30000, // 30 seconds
  300000, // 5 minutes
  3600000, // 1 hour
] as const;

/**
 * Integration Provider Configurations
 */
export const PROVIDER_CONFIGS = {
  zapier: {
    name: 'Zapier',
    webhookFormat: 'standard',
    requiresAuth: true,
    supportsRetry: false,
  },
  make: {
    name: 'Make (Integromat)',
    webhookFormat: 'standard',
    requiresAuth: true,
    supportsRetry: false,
  },
  n8n: {
    name: 'n8n',
    webhookFormat: 'standard',
    requiresAuth: false,
    supportsRetry: true,
  },
  auth0: {
    name: 'Auth0',
    type: 'auth',
    requiresApiKey: true,
  },
  workos: {
    name: 'WorkOS',
    type: 'auth',
    requiresApiKey: true,
  },
} as const;

/**
 * API Versioning
 */
export const API_VERSIONS = {
  V1: 'v1',
  CURRENT: 'v1',
} as const;

/**
 * Request Headers
 */
export const REQUEST_HEADERS = {
  API_KEY: 'X-API-Key',
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  USER_AGENT: 'User-Agent',
  REQUEST_ID: 'X-Request-ID',
  RATE_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
} as const;

/**
 * Response Headers
 */
export const RESPONSE_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  RATE_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  REQUEST_ID: 'X-Request-ID',
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
} as const;

/**
 * OAuth Grant Types
 */
export const OAUTH_GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  CLIENT_CREDENTIALS: 'client_credentials',
  REFRESH_TOKEN: 'refresh_token',
  PASSWORD: 'password', // Not recommended for production
} as const;

/**
 * OAuth Response Types
 */
export const OAUTH_RESPONSE_TYPES = {
  CODE: 'code',
  TOKEN: 'token',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // API Key Errors
  INVALID_API_KEY: 'Invalid or missing API key',
  API_KEY_EXPIRED: 'API key has expired',
  API_KEY_REVOKED: 'API key has been revoked',
  API_KEY_NOT_FOUND: 'API key not found',

  // Rate Limit Errors
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  QUOTA_EXCEEDED: 'API quota exceeded',

  // Webhook Errors
  WEBHOOK_DELIVERY_FAILED: 'Failed to deliver webhook',
  WEBHOOK_NOT_FOUND: 'Webhook not found',
  INVALID_WEBHOOK_URL: 'Invalid webhook URL',
  WEBHOOK_TIMEOUT: 'Webhook delivery timed out',

  // OAuth Errors
  INVALID_CLIENT_CREDENTIALS: 'Invalid client credentials',
  INVALID_AUTHORIZATION_CODE: 'Invalid or expired authorization code',
  INVALID_REDIRECT_URI: 'Redirect URI does not match registered URI',
  INVALID_SCOPE: 'Invalid or unsupported scope',

  // General Errors
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_REQUEST: 'Invalid request',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  API_KEY_CREATED: 'API key created successfully',
  API_KEY_REVOKED: 'API key revoked successfully',
  WEBHOOK_CREATED: 'Webhook created successfully',
  WEBHOOK_UPDATED: 'Webhook updated successfully',
  WEBHOOK_DELETED: 'Webhook deleted successfully',
  WEBHOOK_TEST_SUCCESS: 'Webhook test successful',
  OAUTH_APP_CREATED: 'OAuth app created successfully',
  OAUTH_APP_UPDATED: 'OAuth app updated successfully',
  INTEGRATION_CONNECTED: 'Integration connected successfully',
  INTEGRATION_DISCONNECTED: 'Integration disconnected successfully',
} as const;
