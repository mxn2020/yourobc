// src/features/system/integrations/types/index.ts

import { Doc, Id } from "@/convex/_generated/dataModel";

// Re-export backend types that are needed in frontend
export type ApiKey = Doc<"apiKeys">;
export type ApiRequestLog = Doc<"apiRequestLogs">;
export type Webhook = Doc<"webhooks">;
export type WebhookDelivery = Doc<"webhookDeliveries">;
export type OAuthApp = Doc<"oauthApps">;
export type OAuthToken = Doc<"oauthTokens">;
export type ExternalIntegration = Doc<"externalIntegrations">;
export type IntegrationEvent = Doc<"integrationEvents">;

// Frontend-specific types

/**
 * Integration provider interface
 */
export interface IntegrationProvider {
  name: string;
  type: IntegrationProviderType;
  isInitialized: boolean;

  // Initialize the provider
  initialize(convexClient?: any): Promise<void>;

  // API Key management
  createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult>;
  getApiKeys(userId: Id<"userProfiles">): Promise<ApiKey[]>;
  revokeApiKey(keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">): Promise<void>;
  validateApiKey(key: string): Promise<boolean>;

  // Webhook management
  createWebhook(params: CreateWebhookParams): Promise<Id<"webhooks">>;
  getWebhooks(userId: Id<"userProfiles">): Promise<Webhook[]>;
  updateWebhook(params: UpdateWebhookParams): Promise<void>;
  deleteWebhook(webhookId: Id<"webhooks">, userId: Id<"userProfiles">): Promise<void>;
  testWebhook(webhookId: Id<"webhooks">): Promise<TestWebhookResult>;

  // OAuth management
  createOAuthApp(params: CreateOAuthAppParams): Promise<CreateOAuthAppResult>;
  getOAuthApps(userId: Id<"userProfiles">): Promise<OAuthApp[]>;
  updateOAuthApp(params: UpdateOAuthAppParams): Promise<void>;
  deleteOAuthApp(appId: Id<"oauthApps">, userId: Id<"userProfiles">): Promise<void>;

  // External integrations
  createExternalIntegration(params: ConnectExternalIntegrationParams): Promise<Id<"externalIntegrations">>;
  disconnectExternalIntegration(integrationId: Id<"externalIntegrations">, userId: Id<"userProfiles">): Promise<void>;
  getExternalIntegrations(userId: Id<"userProfiles">): Promise<ExternalIntegration[]>;

  // Logs & analytics
  getRequestLogs(params: GetRequestLogsParams): Promise<ApiRequestLog[]>;
  getIntegrationEvents(params: GetIntegrationEventsParams): Promise<IntegrationEvent[]>;
  getUsageStats(userId: Id<"userProfiles">, startDate: number, endDate: number): Promise<UsageStats>;
}

/**
 * Integration provider types
 */
export type IntegrationProviderType = "internal" | "zapier" | "make" | "n8n";

/**
 * API Key creation parameters
 */
export interface CreateApiKeyParams {
  name: string;
  description?: string;
  scopes: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  expiresAt?: number;
  allowedIps?: string[];
  metadata?: Record<string, string | number | boolean>;
}

/**
 * API Key creation result
 */
export interface CreateApiKeyResult {
  keyId: Id<"apiKeys">;
  key: string; // Only returned once at creation
}

/**
 * Webhook creation parameters
 */
export interface CreateWebhookParams {
  name: string;
  description?: string;
  url: string;
  secret?: string;
  events: string[];
  method?: "POST" | "PUT";
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
  isActive?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Webhook update parameters
 */
export interface UpdateWebhookParams {
  webhookId: Id<"webhooks">;
  name?: string;
  description?: string;
  url?: string;
  secret?: string;
  events?: string[];
  method?: "POST" | "PUT";
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
  isActive?: boolean;
  metadata?: Record<string, string | number | boolean>;
  updatedBy: string;
}

/**
 * OAuth app creation parameters
 */
export interface CreateOAuthAppParams {
  name: string;
  description?: string;
  redirectUris: string[];
  scopes: string[];
  grantTypes?: Array<"authorization_code" | "client_credentials" | "refresh_token">;
  logoUrl?: string;
  website?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  organizationId?: string;
}

/**
 * OAuth app creation result
 */
export interface CreateOAuthAppResult {
  appId: Id<"oauthApps">;
  clientId: string;
  clientSecret: string; // Only returned once at creation
}

/**
 * OAuth app update parameters
 */
export interface UpdateOAuthAppParams {
  appId: Id<"oauthApps">;
  name?: string;
  description?: string;
  redirectUris?: string[];
  scopes?: string[];
  grantTypes?: Array<"authorization_code" | "client_credentials" | "refresh_token">;
  logoUrl?: string;
  website?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  isActive?: boolean;
  updatedBy: string;
}

/**
 * External integration connection parameters
 */
export interface ConnectExternalIntegrationParams {
  name: string;
  provider: "zapier" | "make" | "n8n" | "auth0" | "workos" | "custom";
  type: "automation" | "auth" | "api" | "webhook";
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    additionalConfig?: string;
    events?: string[];
  };
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Request logs query parameters
 */
export interface GetRequestLogsParams {
  apiKeyId?: Id<"apiKeys">;
  userId?: Id<"userProfiles">;
  method?: string;
  path?: string;
  startDate?: number;
  endDate?: number;
  statusCode?: number;
  limit?: number;
}

/**
 * Integration events query parameters
 */
export interface GetIntegrationEventsParams {
  integrationId?: Id<"externalIntegrations">;
  eventType?: string;
  status?: "success" | "failed" | "pending";
  direction?: "inbound" | "outbound";
  startDate?: number;
  endDate?: number;
  limit?: number;
}

/**
 * Test webhook result (returned by testWebhook)
 */
export interface TestWebhookResult {
  deliveryId: Id<"webhookDeliveries">;
  message: string;
  status?: 'success' | 'failed' | 'pending';
}

/**
 * Usage statistics
 */
export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByStatus: Record<number, number>;
  requestsByPath: Record<string, number>;
  requestsByHour: Record<number, number>;
  requestsByDay: Array<{
    date: string;
    count: number;
  }>;
  topApiKeys?: Array<{
    keyId: Id<"apiKeys">;
    keyName: string;
    requestCount: number;
  }>;
}

/**
 * Integrations context value
 */
export interface IntegrationsContextValue {
  provider: IntegrationProvider | null;
  isInitialized: boolean;

  // API Keys
  createApiKey: (params: CreateApiKeyParams) => Promise<CreateApiKeyResult>;
  getApiKeys: () => Promise<ApiKey[]>;
  revokeApiKey: (keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">) => Promise<void>;

  // Webhooks
  createWebhook: (params: CreateWebhookParams) => Promise<Id<"webhooks">>;
  getWebhooks: () => Promise<Webhook[]>;
  testWebhook: (webhookId: Id<"webhooks">) => Promise<TestWebhookResult>;
  deleteWebhook: (webhookId: Id<"webhooks">, userId: Id<"userProfiles">) => Promise<void>;

  // OAuth
  createOAuthApp: (params: CreateOAuthAppParams) => Promise<CreateOAuthAppResult>;
  getOAuthApps: () => Promise<OAuthApp[]>;
}

/**
 * Webhook event types
 */
export const WEBHOOK_EVENTS = {
  // User events
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  // Payment events
  PAYMENT_SUCCEEDED: "payment.succeeded",
  PAYMENT_FAILED: "payment.failed",
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_CANCELED: "subscription.canceled",

  // AI events
  AI_REQUEST_COMPLETED: "ai.request.completed",
  AI_REQUEST_FAILED: "ai.request.failed",

  // Project events
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_COMPLETED: "project.completed",

  // Custom events
  CUSTOM: "custom.*",
} as const;

/**
 * API scopes
 */
export const API_SCOPES = {
  // Read scopes
  READ_USERS: "users:read",
  READ_PAYMENTS: "payments:read",
  READ_PROJECTS: "projects:read",
  READ_ANALYTICS: "analytics:read",

  // Write scopes
  WRITE_USERS: "users:write",
  WRITE_PROJECTS: "projects:write",

  // Admin scopes
  ADMIN: "admin:*",
} as const;

/**
 * OAuth grant types
 */
export type OAuthGrantType =
  | "authorization_code"
  | "client_credentials"
  | "refresh_token";

/**
 * OAuth scope categories
 */
export const OAUTH_SCOPES = {
  // Profile scopes
  PROFILE_READ: "profile:read",
  PROFILE_WRITE: "profile:write",

  // Data scopes
  DATA_READ: "data:read",
  DATA_WRITE: "data:write",

  // Admin scopes
  ADMIN_READ: "admin:read",
  ADMIN_WRITE: "admin:write",
} as const;

/**
 * Integration status (matches schema status field)
 */
export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

/**
 * Webhook delivery status (matches schema)
 */
export type WebhookDeliveryStatus = "pending" | "delivered" | "failed" | "retrying";

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  period: "minute" | "hour" | "day";
}
