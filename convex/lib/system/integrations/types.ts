// convex/lib/boilerplate/integrations/types.ts

import { Id } from '@/generated/dataModel';

/**
 * API Key Types
 */
export interface ApiKeyData {
  name: string;
  description?: string;
  scopes: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  allowedIps?: string[];
  expiresAt?: number;
}

export interface ApiKeyValidation {
  valid: boolean;
  keyId?: Id<'apiKeys'>;
  scopes?: string[];
  rateLimitRemaining?: number;
  rateLimitReset?: number;
  error?: string;
}

/**
 * Webhook Types
 */
export interface WebhookData {
  name: string;
  description?: string;
  url: string;
  secret?: string;
  events: string[];
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  timeout?: number;
  retryConfig?: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  filters?: {
    conditions?: string;
    sampleRate?: number;
  };
}

export type WebhookStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export interface WebhookDeliveryAttempt {
  attemptNumber: number;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: number;
}

/**
 * OAuth Types
 */
export interface OAuthAppData {
  name: string;
  description?: string;
  redirectUris: string[];
  scopes: string[];
  grantTypes: ('authorization_code' | 'client_credentials' | 'refresh_token')[];
  logoUrl?: string;
  website?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface OAuthTokenData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  scopes: string[];
  expiresIn: number;
  refreshTokenExpiresIn?: number;
}

export interface OAuthAuthorizationRequest {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  responseType: 'code' | 'token';
}

export interface OAuthTokenRequest {
  grantType: 'authorization_code' | 'refresh_token' | 'client_credentials';
  code?: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

/**
 * External Integration Types
 */
export type IntegrationType = 'automation' | 'auth' | 'api' | 'webhook';

export type IntegrationProvider =
  | 'zapier'
  | 'make'
  | 'n8n'
  | 'auth0'
  | 'workos';

export interface ExternalIntegrationData {
  name: string;
  provider: IntegrationProvider;
  type: IntegrationType;
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    additionalConfig?: string;
  };
}

export type SyncStatus = 'success' | 'failed' | 'in_progress';

export type EventDirection = 'inbound' | 'outbound';

/**
 * Request Log Types
 */
export interface ApiRequestLogData {
  requestId: string;
  apiKeyId?: Id<'apiKeys'>;
  method: string;
  path: string;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  body?: string;
  statusCode: number;
  responseBody?: string;
  responseTime: number;
  ipAddress: string;
  userAgent?: string;
  userId?: Id<'userProfiles'>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export interface RequestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByStatus: Record<number, number>;
  requestsByPath: Record<string, number>;
  requestsByHour: Record<number, number>;
}

export interface RequestLogFilters {
  apiKeyId?: Id<'apiKeys'>;
  userId?: Id<'userProfiles'>;
  method?: string;
  path?: string;
  statusCode?: number;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

export interface RequestStatsFilters {
  apiKeyId?: Id<'apiKeys'>;
  userId?: Id<'userProfiles'>;
  startDate?: number;
  endDate?: number;
}

/**
 * Rate Limiting Types
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay?: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  reset: number; // Timestamp when limit resets
  limit: number;
}

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

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Webhook Signature Algorithm
 */
export type SignatureAlgorithm = 'sha256' | 'sha512';
