// convex/lib/boilerplate/integrations/integrations/constants.ts
// Business constants, permissions, and limits for integrations module

/**
 * Integrations Configuration Constants
 */
export const INTEGRATIONS_CONSTANTS = {
  PERMISSIONS: {
    // API Keys
    API_KEY_VIEW: 'integrations:api_key:view',
    API_KEY_CREATE: 'integrations:api_key:create',
    API_KEY_UPDATE: 'integrations:api_key:update',
    API_KEY_REVOKE: 'integrations:api_key:revoke',
    API_KEY_DELETE: 'integrations:api_key:delete',

    // Webhooks
    WEBHOOK_VIEW: 'integrations:webhook:view',
    WEBHOOK_CREATE: 'integrations:webhook:create',
    WEBHOOK_UPDATE: 'integrations:webhook:update',
    WEBHOOK_DELETE: 'integrations:webhook:delete',
    WEBHOOK_TEST: 'integrations:webhook:test',

    // OAuth Apps
    OAUTH_APP_VIEW: 'integrations:oauth_app:view',
    OAUTH_APP_CREATE: 'integrations:oauth_app:create',
    OAUTH_APP_UPDATE: 'integrations:oauth_app:update',
    OAUTH_APP_DELETE: 'integrations:oauth_app:delete',

    // External Integrations
    INTEGRATION_VIEW: 'integrations:integration:view',
    INTEGRATION_CREATE: 'integrations:integration:create',
    INTEGRATION_UPDATE: 'integrations:integration:update',
    INTEGRATION_DELETE: 'integrations:integration:delete',
    INTEGRATION_CONNECT: 'integrations:integration:connect',
    INTEGRATION_DISCONNECT: 'integrations:integration:disconnect',
  },

  LIMITS: {
    // API Keys
    API_KEY_NAME_MIN: 3,
    API_KEY_NAME_MAX: 100,
    API_KEY_DESCRIPTION_MAX: 500,
    API_KEY_SCOPES_MAX: 50,
    API_KEY_ALLOWED_IPS_MAX: 100,

    // Webhooks
    WEBHOOK_NAME_MIN: 3,
    WEBHOOK_NAME_MAX: 100,
    WEBHOOK_DESCRIPTION_MAX: 500,
    WEBHOOK_URL_MAX: 2000,
    WEBHOOK_EVENTS_MAX: 50,
    WEBHOOK_HEADERS_MAX: 50,

    // OAuth Apps
    OAUTH_APP_NAME_MIN: 3,
    OAUTH_APP_NAME_MAX: 100,
    OAUTH_APP_DESCRIPTION_MAX: 500,
    OAUTH_APP_REDIRECT_URIS_MAX: 10,
    OAUTH_APP_SCOPES_MAX: 50,

    // External Integrations
    INTEGRATION_NAME_MIN: 3,
    INTEGRATION_NAME_MAX: 100,
  },

  CONFIG: {
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
  },

  ERROR_CODES: {
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
  },

  HTTP_STATUS: {
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
  },

  DEFAULT_SCOPES_BY_RESOURCE: {
    users: ['read:users', 'write:users'],
    projects: ['read:projects', 'write:projects'],
    tasks: ['read:tasks', 'write:tasks'],
    posts: ['read:posts', 'write:posts'],
    analytics: ['read:analytics'],
  },

  WEBHOOK_RETRY_SCHEDULE: [
    1000, // 1 second
    5000, // 5 seconds
    30000, // 30 seconds
    300000, // 5 minutes
    3600000, // 1 hour
  ],

  PROVIDER_CONFIGS: {
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
  },

  API_VERSIONS: {
    V1: 'v1',
    CURRENT: 'v1',
  },

  REQUEST_HEADERS: {
    API_KEY: 'X-API-Key',
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    USER_AGENT: 'User-Agent',
    REQUEST_ID: 'X-Request-ID',
    RATE_LIMIT: 'X-RateLimit-Limit',
    RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
    RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  },

  RESPONSE_HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    RATE_LIMIT: 'X-RateLimit-Limit',
    RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
    RATE_LIMIT_RESET: 'X-RateLimit-Reset',
    REQUEST_ID: 'X-Request-ID',
  },

  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
    TEXT: 'text/plain',
  },

  OAUTH_GRANT_TYPES: {
    AUTHORIZATION_CODE: 'authorization_code',
    CLIENT_CREDENTIALS: 'client_credentials',
    REFRESH_TOKEN: 'refresh_token',
    PASSWORD: 'password', // Not recommended for production
  },

  OAUTH_RESPONSE_TYPES: {
    CODE: 'code',
    TOKEN: 'token',
  },

  ERROR_MESSAGES: {
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
  },

  SUCCESS_MESSAGES: {
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
  },
} as const;

/**
 * Webhook Event Types
 */
export const WEBHOOK_EVENTS = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',

  // Task events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  TASK_DELETED: 'task.deleted',

  // Blog events
  POST_PUBLISHED: 'post.published',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',

  // Payment events
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',

  // AI events
  AI_REQUEST_COMPLETED: 'ai.request.completed',
  AI_TEST_COMPLETED: 'ai.test.completed',
} as const;

/**
 * API Scopes
 */
export const API_SCOPES = {
  // Read scopes
  READ_USERS: 'read:users',
  READ_PROJECTS: 'read:projects',
  READ_TASKS: 'read:tasks',
  READ_POSTS: 'read:posts',
  READ_ANALYTICS: 'read:analytics',

  // Write scopes
  WRITE_USERS: 'write:users',
  WRITE_PROJECTS: 'write:projects',
  WRITE_TASKS: 'write:tasks',
  WRITE_POSTS: 'write:posts',

  // Delete scopes
  DELETE_USERS: 'delete:users',
  DELETE_PROJECTS: 'delete:projects',
  DELETE_TASKS: 'delete:tasks',
  DELETE_POSTS: 'delete:posts',

  // Special scopes
  ADMIN: 'admin',
  WEBHOOK_MANAGE: 'webhook:manage',
  API_KEY_MANAGE: 'api_key:manage',
} as const;
