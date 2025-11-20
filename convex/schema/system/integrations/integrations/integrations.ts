// convex/schema/system/integrations/integrations/integrations.ts
// Table definitions for integrations module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { integrationsValidators } from './validators';

/**
 * API Keys Table
 *
 * Manages API keys for programmatic access with support for:
 * - Scoped permissions
 * - Rate limiting
 * - IP restrictions
 * - Expiration and revocation
 */
export const apiKeysTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: v.union(v.literal('active'), v.literal('inactive'), v.literal('revoked')),

  // Key Data
  keyPrefix: v.string(), // First 8 chars for identification (e.g., 'sk_live_')
  keyHash: v.string(), // Full hash for verification
  description: v.optional(v.string()),

  // Permissions
  scopes: v.array(v.string()), // 'read:posts', 'write:users', etc.
  rateLimit: integrationsValidators.rateLimit,

  // IP Restrictions
  allowedIps: v.optional(v.array(v.string())),
  blockedIps: v.optional(v.array(v.string())),

  // Key Status
  isActive: v.boolean(),
  expiresAt: v.optional(v.number()),
  lastUsedAt: v.optional(v.number()),

  // Usage Stats
  totalRequests: v.number(),
  totalErrors: v.number(),

  // Owner Info
  userId: v.id('userProfiles'),
  userName: v.string(),

  // Revocation
  revokedAt: v.optional(v.number()),
  revokedBy: v.optional(v.id('userProfiles')),
  revokedReason: v.optional(v.string()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key_prefix', ['keyPrefix'])
  .index('by_user', ['userId'])
  .index('by_active', ['isActive'])
  .index('by_expiration', ['expiresAt'])
  .index('by_created_at', ['createdAt']);

/**
 * API Request Logs Table
 *
 * Logs all API requests for monitoring and debugging with:
 * - Request/response details
 * - Performance metrics
 * - Error tracking
 */
export const apiRequestLogsTable = defineTable({
  // Request Identity
  requestId: v.string(),

  // API Key
  apiKeyId: v.optional(v.id('apiKeys')),
  apiKeyPrefix: v.optional(v.string()),

  // Request Details
  method: v.string(), // GET, POST, PUT, DELETE, PATCH
  path: v.string(),
  query: v.optional(v.record(v.string(), v.union(v.string(), v.array(v.string())))),
  headers: v.optional(v.record(v.string(), v.string())),
  body: v.optional(v.string()), // JSON string

  // Response
  statusCode: v.number(),
  responseBody: v.optional(v.string()), // JSON string
  responseTime: v.number(), // milliseconds

  // Client Info
  ipAddress: v.string(),
  userAgent: v.optional(v.string()),
  userId: v.optional(v.id('userProfiles')),

  // Error Tracking
  error: v.optional(integrationsValidators.apiError),

  // Rate Limiting
  rateLimitRemaining: v.optional(v.number()),
  rateLimitReset: v.optional(v.number()),

  // Special timestamp
  timestamp: v.number(),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_api_key', ['apiKeyId'])
  .index('by_status', ['statusCode'])
  .index('by_timestamp', ['timestamp'])
  .index('by_user', ['userId'])
  .index('by_path', ['path'])
  .index('by_created_at', ['createdAt']);

/**
 * Webhooks Table
 *
 * Manages outgoing webhooks for event notifications with:
 * - Event subscriptions
 * - Retry logic
 * - Signature verification
 * - Delivery statistics
 */
export const webhooksTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: v.union(v.literal('active'), v.literal('inactive')),

  // Webhook Configuration
  url: v.string(),
  secret: v.string(), // For HMAC signature
  description: v.optional(v.string()),

  // Events to Listen
  events: v.array(v.string()), // ['user.created', 'post.published', etc.]

  // HTTP Configuration
  method: integrationsValidators.webhookMethod,
  headers: v.optional(v.record(v.string(), v.string())),
  timeout: v.number(), // milliseconds

  // Retry Configuration
  retryConfig: integrationsValidators.webhookRetryConfig,

  // Filters
  filters: v.optional(integrationsValidators.webhookFilters),

  // Webhook Status
  isActive: v.boolean(),
  lastTriggeredAt: v.optional(v.number()),
  lastSuccessAt: v.optional(v.number()),
  lastFailureAt: v.optional(v.number()),

  // Statistics
  totalDeliveries: v.number(),
  successfulDeliveries: v.number(),
  failedDeliveries: v.number(),
  averageResponseTime: v.optional(v.number()),

  // Owner Info
  userId: v.id('userProfiles'),
  userName: v.string(),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_user', ['userId'])
  .index('by_active', ['isActive'])
  .index('by_events', ['events'])
  .index('by_created_at', ['createdAt']);

/**
 * Webhook Deliveries Table
 *
 * Tracks individual webhook delivery attempts with:
 * - Delivery status
 * - Request/response details
 * - Retry tracking
 */
export const webhookDeliveriesTable = defineTable({
  // Delivery Identity
  webhookId: v.id('webhooks'),

  // Event Data
  event: v.string(),
  payload: v.string(), // JSON string

  // Delivery Attempt
  attemptNumber: v.number(),

  // Request
  url: v.string(),
  method: v.string(),
  headers: v.record(v.string(), v.string()),
  body: v.string(), // JSON string

  // Response
  statusCode: v.optional(v.number()),
  responseBody: v.optional(v.string()), // JSON string
  responseTime: v.optional(v.number()),

  // Status
  status: integrationsValidators.webhookDeliveryStatus,

  // Error
  error: v.optional(integrationsValidators.webhookError),

  // Retry
  nextRetryAt: v.optional(v.number()),

  // Special timestamp
  deliveredAt: v.optional(v.number()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_webhook', ['webhookId'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_retry', ['status', 'nextRetryAt']);

/**
 * OAuth Apps Table
 *
 * Manages OAuth 2.0 applications with:
 * - Client credentials
 * - Redirect URIs
 * - Scopes and grant types
 * - App verification
 */
export const oauthAppsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: v.union(v.literal('active'), v.literal('inactive')),

  // App Identity
  description: v.optional(v.string()),

  // OAuth Credentials
  clientId: v.string(),
  clientSecret: v.string(), // Hashed

  // OAuth Configuration
  redirectUris: v.array(v.string()),
  scopes: v.array(v.string()),
  grantTypes: v.array(integrationsValidators.oauthGrantType),

  // App Info
  logoUrl: v.optional(v.string()),
  website: v.optional(v.string()),
  privacyPolicyUrl: v.optional(v.string()),
  termsOfServiceUrl: v.optional(v.string()),

  // Rate Limiting
  rateLimit: v.object({
    requestsPerMinute: v.number(),
    requestsPerHour: v.number(),
  }),

  // App Status
  isActive: v.boolean(),
  isVerified: v.boolean(),

  // Statistics
  totalUsers: v.number(),
  activeUsers: v.number(),
  totalTokens: v.number(),

  // Owner Info
  userId: v.id('userProfiles'),
  userName: v.string(),
  organizationId: v.optional(v.string()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_client_id', ['clientId'])
  .index('by_user', ['userId'])
  .index('by_active', ['isActive'])
  .index('by_created_at', ['createdAt']);

/**
 * OAuth Tokens Table
 *
 * Manages OAuth 2.0 access and refresh tokens with:
 * - Token hashing
 * - Expiration tracking
 * - Revocation support
 * - Usage tracking
 */
export const oauthTokensTable = defineTable({
  // OAuth App
  appId: v.id('oauthApps'),
  appName: v.string(),

  // Token Data
  accessTokenHash: v.string(), // Hashed
  refreshTokenHash: v.optional(v.string()), // Hashed
  tokenType: v.string(), // 'Bearer'
  scopes: v.array(v.string()),

  // User
  userId: v.id('userProfiles'),
  userName: v.string(),

  // Expiration
  expiresAt: v.number(),
  refreshTokenExpiresAt: v.optional(v.number()),

  // Token Status
  isRevoked: v.boolean(),
  revokedAt: v.optional(v.number()),
  revokedReason: v.optional(v.string()),

  // Usage
  lastUsedAt: v.optional(v.number()),
  usageCount: v.number(),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_app', ['appId'])
  .index('by_user', ['userId'])
  .index('by_expiration', ['expiresAt'])
  .index('by_revoked', ['isRevoked'])
  .index('by_created_at', ['createdAt']);

/**
 * External Integrations Table
 *
 * Manages connections to external services with:
 * - Provider configurations
 * - Connection status
 * - Sync tracking
 * - Statistics
 */
export const externalIntegrationsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: integrationsValidators.integrationStatus,

  // Integration Identity
  provider: v.string(), // 'zapier', 'make', 'n8n', 'auth0', 'workos'
  type: integrationsValidators.integrationType,

  // Configuration
  config: integrationsValidators.integrationConfig,

  // Connection Status
  isConnected: v.boolean(),
  lastConnectedAt: v.optional(v.number()),
  lastDisconnectedAt: v.optional(v.number()),
  connectionError: v.optional(v.string()),

  // Sync Status (if applicable)
  lastSyncedAt: v.optional(v.number()),
  syncStatus: v.optional(integrationsValidators.syncStatus),

  // Statistics
  totalRequests: v.number(),
  successfulRequests: v.number(),
  failedRequests: v.number(),

  // Owner Info
  userId: v.id('userProfiles'),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_user', ['userId'])
  .index('by_provider', ['provider'])
  .index('by_type', ['type'])
  .index('by_connected', ['isConnected'])
  .index('by_created_at', ['createdAt']);

/**
 * Integration Events Table
 *
 * Logs events from external integrations with:
 * - Event type tracking
 * - Request/response logging
 * - Status tracking
 * - Performance metrics
 */
export const integrationEventsTable = defineTable({
  // Event Identity
  integrationId: v.id('externalIntegrations'),

  // Event Data
  eventType: v.string(),
  direction: integrationsValidators.eventDirection,

  // Request/Response
  request: v.optional(v.string()), // JSON string
  response: v.optional(v.string()), // JSON string

  // Status
  status: integrationsValidators.eventStatus,
  error: v.optional(v.string()),

  // Timing
  processingTime: v.optional(v.number()),

  // Special timestamp
  timestamp: v.number(),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_integration', ['integrationId'])
  .index('by_status', ['status'])
  .index('by_timestamp', ['timestamp'])
  .index('by_created_at', ['createdAt']);
